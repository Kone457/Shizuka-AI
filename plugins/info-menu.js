import moment from 'moment-timezone'
import {
  generateWAMessageFromContent,
  prepareWAMessageMedia
} from '@whiskeysockets/baileys'
import { getBotConfig } from '../lib/botconfig.js'

const CATEGORY_META = {
main: '⊹ Main ⊹',
rg: '⊹ Registro ⊹',
info: '⊹ Información ⊹',
ia: '⊹ Inteligencia AI ⊹',
nable: '⊹ Funciones ⊹',
buscadores: '⊹ Buscadores ⊹',
descargas: '⊹ Descargas ⊹',
imagen: '⊹ Imágenes ⊹',
fun: '⊹ Diversión ⊹',
game: '⊹ Juegos ⊹',
anime: '⊹ Anime ⊹',
grupo: '⊹ Admins ⊹',
gacha: '⊹ Gacha ⊹',
text: '⊹ Efectos ⊹',
rpg: '⊹ Economía ⊹',
perfil: '⊹ Perfil ⊹',
sticker: '⊹ Stickers ⊹',
tools: '⊹ Útilidades ⊹',
nsfw: '⊹ NSFW ⊹',
serbot: '⊹ Sub-bots ⊹'
}

const CHANNEL_URL = 'https://whatsapp.com/channel/0029Vb7h1qC65yDEhghegc2O'

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
try {

await conn.sendMessage(m.chat, {
  react: { text: '💔', key: m.key }
})

const pluginsActivos = Object.values(global.plugins || {}).filter(p => !p?.disabled)
const pluginsCount = pluginsActivos.length

const fecha = moment.tz('America/Havana').format('DD/MM/YYYY')
const hora = moment.tz('America/Havana').format('hh:mm A')

const byTag = {}

for (const plugin of pluginsActivos) {
  const tags = Array.isArray(plugin.tags) ? plugin.tags : (plugin.tags ? [plugin.tags] : [])
  const helps = Array.isArray(plugin.help) ? plugin.help : (plugin.help ? [plugin.help] : [])

  for (const tag of tags) {
    if (!CATEGORY_META[tag]) continue
    if (!byTag[tag]) byTag[tag] = new Set()
    for (const h of helps) {
      if (typeof h === 'string' && h.trim()) byTag[tag].add(h.trim())
    }
  }
}

const userName = m.pushName || 'Usuario'
const botnameConfig = getBotConfig(conn, 'botname') || 'Bot'

const mainBotJid = global.conn?.user?.jid?.split(':')[0]
const currentBotJid = conn.user?.jid?.split(':')[0]
const isMainBot = mainBotJid && currentBotJid && mainBotJid === currentBotJid

const botType = isMainBot ? ' 𝐏𝐫𝐞𝐦-𝐁𝐨𝐭' : '𝐒𝐮𝐛-𝐁𝐨𝐭'

let menuTexto = ''

menuTexto += `Hola *${userName}* soy *${botnameConfig}* (${botType})\n`
menuTexto += `ᴀǫᴜɪ ᴛɪᴇɴᴇs ʟᴀ ʟɪsᴛᴀ ᴅᴇ ᴄᴏᴍᴀɴᴅᴏs\n`
menuTexto += `╭┈ ↷\n`
menuTexto += `│ ✐ 𝓓𝓮𝔀𝓮𝓵𝓸𝓹𝓮𝓭 𝓫𝔂 𝓒𝓪𝓻𝓵𝓸𝓼 💙\n`
menuTexto += `│ ✐ ꒷ꕤ💎ദ ᴄᴀɴᴀʟ ᴏғɪᴄɪᴀʟ ෴\n`
menuTexto += `│${CHANNEL_URL}\n`
menuTexto += `╰─────────────────\n\n`

for (const tag of Object.keys(CATEGORY_META)) {
  const set = byTag[tag]

  if (!set || set.size === 0) continue

  const cmds = [...set].sort()

  menuTexto += `╭─ׅ─ׅ┈ ─๋︩︪─☪︎︎︎̸⃘̸࣭ٜ࣪࣪࣪۬◌⃘۪֟፝֯۫۫︎⃪𐇽۫۬❖⃘࣭ٜ࣪࣪࣪۬☪︎︎︎︎̸─ׅ─ׅ┈ ─๋︩︪─╮\n`
  menuTexto += `╭╼⬪࣪ꥈ𑁍⃪࣭۪ٜ ${CATEGORY_META[tag]} ໑⃪࣭۪ٜ݊݊݊݊𑁍ꥈ࣪⬪\n`
  menuTexto += `┃֪࣪  ╰─ׅ─ׅ┈ ─๋︩︪─☪︎︎︎̸⃘̸࣭ٜ࣪࣪࣪۬◌⃘۪֟፝֯۫۫︎⃪𐇽۫۬❖⃘࣭ٜ࣪࣪࣪۬☪︎︎︎︎̸─ׅ─ׅ┈ ─๋︩︪─╯\n`

  menuTexto += cmds.map(c => `├ׁ̟̇❍✎ .${c}`).join('\n') + '\n'

  menuTexto += `╰─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╯\n\n`
}

const BANNER_URL = getBotConfig(conn, 'banner2')

const imageBuffer = await resizeImage(BANNER_URL, 1000, 700)

if (!imageBuffer) {
  return await conn.sendMessage(m.chat, {
    text: menuTexto.trim()
  }, { quoted: m })
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
    text: menuTexto.trim()
  },

  footer: {
    text: '© Todos los derechos reservados'
  },

  nativeFlowMessage: {
    buttons: [],
    messageParamsJson: JSON.stringify({
      limited_time_offer: {
        text: botnameConfig,
        url: CHANNEL_URL,
        copy_code: null,
        expiration_time: null
      }
    })
  },

  contextInfo: {
    mentionedJid: [],
    groupMentions: [],
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
await conn.sendMessage(m.chat, {
text: `✿ Error: ${e.message || e}`
}, { quoted: m })
}
}

handler.help = ['menu']
handler.tags = ['info']
handler.command = ['menu', 'help']

export default handler