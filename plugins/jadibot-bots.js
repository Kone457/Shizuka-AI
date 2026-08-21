import ws from 'ws'
import {
  generateWAMessageFromContent,
  prepareWAMessageMedia
} from '@whiskeysockets/baileys'
import { getBotConfig } from '../lib/botconfig.js'

async function fetchBuffer(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Error descargando imagen: ${res.status}`)
  return Buffer.from(await res.arrayBuffer())
}

async function loadJimp() {
  const mod = await import('jimp')
  return mod.Jimp || mod.default || mod
}

async function getJimpBuffer(image, mime) {
  if (typeof image.getBufferAsync === 'function') {
    return image.getBufferAsync(mime)
  }

  try {
    const result = image.getBuffer(mime)
    if (result instanceof Promise) return await result
  } catch {}

  return new Promise((resolve, reject) => {
    image.getBuffer(mime, (err, buffer) => {
      if (err) reject(err)
      else resolve(buffer)
    })
  })
}

async function resizeImage(imageInput, width = 1000, height = 700) {
  if (!imageInput) return null

  try {
    const Jimp = await loadJimp()

    let buffer = imageInput

    if (
      typeof imageInput === 'string' &&
      /^https?:\/\//.test(imageInput)
    ) {
      buffer = await fetchBuffer(imageInput)
    }

    if (
      typeof imageInput === 'string' &&
      /^data:.*?;base64,/.test(imageInput)
    ) {
      buffer = Buffer.from(imageInput.split(',')[1], 'base64')
    }

    if (!Buffer.isBuffer(buffer)) return null

    const image = await Jimp.read(buffer)

    try {
      image.contain(width, height)
    } catch {
      try {
        image.contain({ w: width, h: height })
      } catch {
        try {
          image.resize(width, height)
        } catch {
          image.resize({ w: width, h: height })
        }
      }
    }

    if (typeof image.quality === 'function') {
      image.quality(90)
    }

    return await getJimpBuffer(image, 'image/jpeg')
  } catch {
    try {
      if (
        typeof imageInput === 'string' &&
        /^https?:\/\//.test(imageInput)
      ) {
        return await fetchBuffer(imageInput)
      }
    } catch {}

    return null
  }
}

function quotedContext(m) {
  if (!m?.key) return {}

  return {
    stanzaId: m.key.id,
    participant: m.key.participant || m.key.remoteJid,
    quotedMessage: m.message
  }
}

let handler = async (m, { conn }) => {
  const BANNER_URL = getBotConfig(conn, 'banner')

  try {
    await conn.sendMessage(m.chat, {
      react: {
        text: '🕯️',
        key: m.key
      }
    })

    if (!global.conns || !Array.isArray(global.conns)) {
      global.conns = []
    }

    let uniqueUsers = new Map()
    let totalActive = 0

    for (const connBot of global.conns) {
      if (
        !connBot.user ||
        !connBot.ws?.socket ||
        connBot.ws.socket.readyState === ws.CLOSED
      ) continue

      totalActive++

      let isInGroup = false

      try {
        const groups = await connBot.groupFetchAllParticipating()
        isInGroup = Object.keys(groups).includes(m.chat)
      } catch {
        isInGroup = false
      }

      if (!isInGroup) continue

      uniqueUsers.set(connBot.user.jid, connBot)
    }

    let subbotsInfo = []

    for (const [jid] of uniqueUsers) {
      subbotsInfo.push({
        number: `@${jid.split('@')[0]}`
      })
    }

    let txt = `╭─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╮
🌐 SUB-BOTS EN ESTE GRUPO 🌐
Subs › *${subbotsInfo.length}*
Total activos › *${totalActive}*
╰─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╯\n`

    if (subbotsInfo.length === 0) {
      txt += `\n⚠️ No hay subbots activos en este grupo.\nUsa .qr o .code`
    } else {
      subbotsInfo.forEach((subbot, i) => {
        txt += `\n${i + 1}) ${subbot.number}`
      })
    }

    const imageBuffer = await resizeImage(
      BANNER_URL,
      1000,
      700
    )

    if (!imageBuffer) {
      return await conn.sendMessage(
        m.chat,
        {
          text: txt.trim(),
          mentions: subbotsInfo.map(
            s => s.number.replace('@', '') + '@s.whatsapp.net'
          )
        },
        {
          quoted: m
        }
      )
    }

    const media = await prepareWAMessageMedia(
      {
        image: imageBuffer
      },
      {
        upload: conn.waUploadToServer
      }
    )

    const nativeFlowPayload = {
      header: {
        title: null,
        subtitle: '© Todos los derechos reservados',
        hasMediaAttachment: true,
        imageMessage: media.imageMessage
      },

      body: {
        text: txt.trim()
      },

      footer: {
        text: '© Todos los derechos reservados'
      },

      nativeFlowMessage: {
        buttons: [],
        messageParamsJson: JSON.stringify({
          limited_time_offer: {
            text: '🌐 Sub-Bots',
            url: BANNER_URL,
            copy_code: null,
            expiration_time: null
          }
        })
      },

      contextInfo: {
        mentionedJid: subbotsInfo.map(
          s => s.number.replace('@', '') + '@s.whatsapp.net'
        ),
        groupMentions: [],
        forwardingScore: 777,
        isForwarded: true,
        ...quotedContext(m)
      }
    }

    const msg = generateWAMessageFromContent(
      m.chat,
      {
        viewOnceMessage: {
          message: {
            messageContextInfo: {
              deviceListMetadata: {},
              deviceListMetadataVersion: 2
            },
            interactiveMessage: nativeFlowPayload
          }
        }
      },
      {
        quoted: m,
        userJid: conn.user?.jid || conn.user?.id
      }
    )

    return await conn.relayMessage(
      m.chat,
      msg.message,
      {
        messageId: msg.key.id
      }
    )

  } catch (e) {
    await conn.sendMessage(
      m.chat,
      {
        text: `╭─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╮
╭╼⛔ 𝐄𝐑𝐑𝐎𝐑 ⛔╮
┃֪࣪
├ׁ̟̇❍✎ ${e.message}
╰─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╯`
      },
      {
        quoted: m
      }
    )
  }
}

handler.command = ['bots']
handler.help = ['bots']
handler.tags = ['serbot']

export default handler