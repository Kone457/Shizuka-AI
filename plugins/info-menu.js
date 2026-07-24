import moment from 'moment-timezone'
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

await conn.sendMessage(m.chat, {  
  image: { url: getBotConfig(conn, 'banner2') },  
  caption: menuTexto.trim()  
}, { quoted: m })

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
