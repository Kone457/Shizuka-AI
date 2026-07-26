import moment from 'moment-timezone'
import axios from 'axios'
import { prepareWAMessageMedia, generateWAMessageFromContent } from '@whiskeysockets/baileys'
import { getBotConfig } from '../lib/botconfig.js'


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

const handler = async (m, { conn }) => {
try {

await conn.sendMessage(m.chat, { react: { text: '🔥', key: m.key } })

const pluginsActivos = Object.values(global.plugins || {}).filter(p => !p?.disabled)

const byTag = {}
for (const plugin of pluginsActivos) {
  const tags = Array.isArray(plugin.tags) ? plugin.tags : (plugin.tags ? [plugin.tags] : [])
  const helps = Array.isArray(plugin.help) ? plugin.help : (plugin.help ? [plugin.help] : [])
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

const bannerUrl = getBotConfig(conn, 'banner2') || "https://files.evogb.win/1oU31I.jpg"


const content = {
  extendedTextMessage: {
    text: menuTexto.trim(),
    contextInfo: {
      mentionedJid: [m.sender],
      isForwarded: true,
      forwardingScore: 999,
      forwardedNewsletterMessageInfo: { // Cabecera superior de canal
        newsletterJid: '120363424754823499@newsletter',
        newsletterName: '⏤͟͟͞͞★ 𝐒𝐔𝐏𝐄𝐑 𝐌𝐄𝐍𝐔 ◌Ⳋ𝅄',
        serverMessageId: -1
      },
      externalAdReply: { // Banner gigante inferior
        title: `⚡ Menú de ${botnameConfig}`,
        body: 'Selecciona una categoría abajo',
        mediaType: 1,
        renderLargerThumbnail: true,
        thumbnailUrl: bannerUrl,
        sourceUrl: 'https://whatsapp.com/channel/0029Vb7h1qC65yDEhghegc2O'
      }
    }
  }
}


const waMsg = generateWAMessageFromContent(m.chat, content, { userJid: conn.user?.id, quoted: m })
await conn.relayMessage(m.chat, waMsg.message, { messageId: waMsg.key.id })



await conn.sendMessage(m.chat, {
  poll: {
    name: '📂 Elige una categoría de arriba:',
    values: ['Info', 'Descargas', 'Útilidades', 'Juegos'],
    selectableCount: 1
  }
})

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
