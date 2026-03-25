import fetch from 'node-fetch';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36'

function btoa2(str) { return Buffer.from(str, 'utf8').toString('base64') }
function atob2(b64) { return Buffer.from(b64, 'base64').toString('utf8') }

function walkDeep(node, visit, depth = 0, maxDepth = 7) {
    if (depth > maxDepth) return
    if (visit(node, depth) === false) return
    if (Array.isArray(node)) {
        for (const x of node) walkDeep(x, visit, depth + 1, maxDepth)
    } else if (node && typeof node === 'object') {
        for (const k of Object.keys(node)) walkDeep(node[k], visit, depth + 1, maxDepth)
    }
}

function cleanUrlCandidate(s, { stripSpaces = false } = {}) {
    if (typeof s !== 'string') return ''
    let t = s.trim()
        .replace(/^['"]|['"]$/g, '')
        .replace(/\\u003d/gi, '=').replace(/\\u0026/gi, '&').replace(/\\u002f/gi, '/')
        .replace(/\\\//g, '/').replace(/\\/g, '').replace(/[\\'"\]\)>,.]+$/g, '')
    if (stripSpaces) t = t.replace(/\s+/g, '')
    return t
}

function looksLikeImageUrl(u) {
    return /\.(png|jpe?g|webp|gif)(\?|$)/i.test(u) || /googleusercontent\.com|ggpht\.com/i.test(u)
}

function extractImageUrlsFromText(text) {
    const out = new Set()
    if (typeof text !== 'string' || !text) return []
    const regex = /https:\/\/[\w\-\.]+(?:googleusercontent\.com|ggpht\.com)[^\s"'<>)]+|https:\/\/[^\s"'<>)]+\.(?:png|jpe?g|webp|gif)(?:\?[^\s"'<>)]*)?/gi
    for (const m of (text.match(regex) || [])) {
        const u = cleanUrlCandidate(m)
        if (/googleusercontent\.com\/image_generation_content\/0$/.test(u)) continue
        out.add(u)
    }
    return Array.from(out)
}

function isLikelyText(s) {
    if (typeof s !== 'string') return false
    const t = s.trim()
    if (!t || t.length < 2) return false
    if (/^https?:\/\//i.test(t)) return false
    return t.length >= 8 || /\s/.test(t)
}

function pickBestTextFromAny(parsed) {
    const found = []
    walkDeep(parsed, (n) => { if (typeof n === 'string' && isLikelyText(n)) found.push(n.trim()) })
    found.sort((a, b) => b.length - a.length)
    return found[0] || ''
}

function findInnerPayloadString(outer) {
    const candidates = []
    const add = (s) => { if (typeof s === 'string' && s.trim()) candidates.push(s.trim()) }
    add(outer?.[0]?.[2]); add(outer?.[2])
    walkDeep(outer, (n) => {
        if (typeof n !== 'string') return
        const t = n.trim()
        if ((t.startsWith('[') || t.startsWith('{')) && t.length > 20) add(t)
    }, 0, 5)
    for (const s of candidates) { try { JSON.parse(s); return s } catch {} }
    return null
}

function parseStream(data) {
    const chunks = Array.from(
        data.matchAll(/^\d+\r?\n([\s\S]+?)\r?\n(?=\d+\r?\n|$)/gm)
    ).map(m => m[1]).reverse()

    let best = { text: '', parsed: null }

    for (const c of chunks) {
        try {
            const outer = JSON.parse(c)
            const inner = findInnerPayloadString(outer)
            if (!inner) continue
            const parsed = JSON.parse(inner)
            const text = pickBestTextFromAny(parsed)

            if (!best.parsed || text.length > best.text.length) {
                best = { text, parsed }
            }
        } catch {}
    }

    return { text: best.text }
}

async function getAnonCookie() {
    const r = await fetch(
        'https://gemini.google.com/_/BardChatUi/data/batchexecute?rpcids=maGuAc&source-path=%2F&hl=en-US&rt=c',
        {
            method: 'POST',
            headers: { 'content-type': 'application/x-www-form-urlencoded;charset=UTF-8', 'user-agent': UA },
            body: 'f.req=%5B%5B%5B%22maGuAc%22%2C%22%5B0%5D%22%2Cnull%2C%22generic%22%5D%5D%5D&',
        }
    )
    const setCookie = r.headers.get('set-cookie')
    return setCookie.split(';')[0]
}

async function askGemini(prompt) {
    const cookie = await getAnonCookie()

    const payload = [[prompt.trim()], ['en-US']]
    const params = { 'f.req': JSON.stringify([null, JSON.stringify(payload)]) }

    const response = await fetch(
        'https://gemini.google.com/_/BardChatUi/data/assistant.lamda.BardFrontendService/StreamGenerate?hl=en-US&rt=c',
        {
            method: 'POST',
            headers: {
                'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
                'user-agent': UA,
                cookie,
            },
            body: new URLSearchParams(params),
        }
    )

    const parsed = parseStream(await response.text())
    return parsed.text
}


export default {
  command: ['gemini'],
  category: 'ai',

  run: async (client, m, args, command) => {

    const botId = client.user.id.split(':')[0] + '@s.whatsapp.net'
    const isOficialBot = botId === global.client.user.id.split(':')[0] + '@s.whatsapp.net'
    const isPremiumBot = global.db.data.settings[botId]?.botprem === true
    const isModBot = global.db.data.settings[botId]?.botmod === true

    if (!isOficialBot && !isPremiumBot && !isModBot) {
      return client.reply(m.chat, `🔹 El comando *${command}* no esta disponible en *Sub-Bots.*`, m)
    }

    let text = args.join(' ').trim()

    if (!text && m.quoted) {
      text =
        m.quoted.text ||
        m.quoted.caption ||
        m.quoted.body ||
        ''
    }

    text = text.trim()

    if (!text) {
      return m.reply(`🔹 Escriba una *petición* o responda a un mensaje para que *Gemini* le responda.`)
    }

    try {
      const { key } = await client.sendMessage(
        m.chat,
        { text: `✎ *Gemini* está procesando tu respuesta...` },
        { quoted: m },
      )

      const response = await askGemini(text)

      if (!response) {
        return client.reply(m.chat, '✐ No se pudo obtener una *respuesta* válida', m)
      }

      await client.sendMessage(
        m.chat,
        { text: response, edit: key }
      )

    } catch (error) {
      console.error(error)
      await m.reply(msgglobal)
    }
  },
}