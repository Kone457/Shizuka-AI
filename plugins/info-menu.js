import moment from 'moment-timezone'
import axios from 'axios'
import { prepareWAMessageMedia, generateWAMessageFromContent } from '@whiskeysockets/baileys'
import { getBotConfig } from '../lib/botconfig.js'

let mediaCache = null
let mediaCacheTime = 0
let lastUsedUrl = null

async function getBuffer(url) {
  try {
    const res = await axios({ method: 'get', url, responseType: 'arraybuffer' })
    return Buffer.from(res.data)
  } catch (e) {
    throw new Error(`Error descargando imagen: ${e.message}`)
  }
}

const CATEGORY_META = {
main: '⊹ Main ⊹',
rg: '⊹ Registro ⊹',
info: '⊹ Información ⊹',
ia: '⊹ Inteligencia AI ⊹',
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
sticker: '⊹ Stickers ⊹',
tools: '⊹ Útilidades ⊹',
nsfw: '⊹ NSFW ⊹',
serbot: '⊹ Sub-bots ⊹',
owner: '⊹ Dueño ⊹'
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
const tags = Array.isArray(plugin.tags)
? plugin.tags
: (plugin.tags ? [plugin.tags] : [])

const helps = Array.isArray(plugin.help)
? plugin.help
: (plugin.help ? [plugin.help] : [])

for (const tag of tags) {
if (!CATEGORY_META[tag]) continue

if (!byTag[tag]) byTag[tag] = new Set()    

for (const h of helps) {    
  if (typeof h === 'string' && h.trim()) {    
    byTag[tag].add(h.trim())    
  }    
}

}
}

const userName = m.pushName || 'Usuario'
const botnameConfig = getBotConfig(conn, 'botname') || 'Bot'

const mainBotJid = global.conn?.user?.jid?.split(':')[0]
const currentBotJid = conn.user?.jid?.split(':')[0]
const isMainBot = mainBotJid && currentBotJid && mainBotJid === currentBotJid

const botType = isMainBot ? ' 𝐏𝐫𝐞𝐦-𝐁𝐨𝐭' : '𝐅𝐫𝐞𝐞-𝐁𝐨𝐭'

let menuTexto = ''

menuTexto += `Hola *${userName}* soy *${botnameConfig}* (${botType})\n`
menuTexto += `ᴀǫᴜɪ ᴛɪᴇɴᴇs ʟᴀ ʟɪsᴛᴀ ᴅᴇ ᴄᴏᴍᴀɴᴅᴏs\n`
menuTexto += `╭┈ ↷\n`
menuTexto += `│ ✐ 𝓓𝓮𝔀𝓮𝓵𝓸𝓹𝓮𝓭 𝓫𝔂 𝓒𝓪𝓻𝓵𝓸𝓼 💙\n`
menuTexto += `│ ✐ ꒷ꕤ💎ദ ᴄᴀɴᴀʟ ᴏғɪᴄɪᴀʟ ෴\n`
menuTexto += `│https://whatsapp.com/channel/0029Vb7h1qC65yDEhghegc2O\n`
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

const bannerUrl = getBotConfig(conn, 'banner2')
const linkMatch = 'https://whatsapp.com/channel/0029Vb7h1qC65yDEhghegc2O'

let imgBanner
if (mediaCache && lastUsedUrl === bannerUrl && Date.now() - mediaCacheTime < 3600000) {
  imgBanner = mediaCache
} else {
  const bufferBanner = await getBuffer(bannerUrl)
  const mediaBanner = await prepareWAMessageMedia(
    { image: bufferBanner },
    { upload: conn.waUploadToServer, mediaTypeOverride: 'thumbnail-link' }
  )
  imgBanner = mediaBanner.imageMessage
  mediaCache = imgBanner
  mediaCacheTime = Date.now()
  lastUsedUrl = bannerUrl
}

const getTs = (ts) => typeof ts === 'object' ? Number(ts.low || ts) : Number(ts);

const content = {
  extendedTextMessage: {
    endCardTiles: [],
    text: menuTexto.trim(),
    matchedText: linkMatch,
    canonicalUrl: linkMatch,
    description: `Powered by Carlos | ${botnameConfig}`,
    title: botnameConfig.toUpperCase(),
    previewType: 0,
    jpegThumbnail: imgBanner.jpegThumbnail,
    thumbnailDirectPath: imgBanner.directPath,
    thumbnailSha256: imgBanner.fileSha256,
    thumbnailEncSha256: imgBanner.fileEncSha256,
    mediaKey: imgBanner.mediaKey,
    mediaKeyTimestamp: getTs(imgBanner.mediaKeyTimestamp),
    thumbnailHeight: imgBanner.height || 1080,
    thumbnailWidth: imgBanner.width || 1920,
    inviteLinkGroupTypeV2: 0,
    contextInfo: {
      mentionedJid: [m.sender]
    }
  }
}

const waMsg = generateWAMessageFromContent(m.chat, content, { userJid: conn.user?.id, quoted: m })
await conn.relayMessage(m.chat, waMsg.message, { messageId: waMsg.key.id })

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
