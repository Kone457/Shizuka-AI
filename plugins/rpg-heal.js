import { getUser } from '../lib/userdb.js'
import { getBotConfig } from '../lib/botconfig.js'
let handler = async (m, { conn, usedPrefix, command }) => {
const currency = getBotConfig(conn, 'currency')
if (!db.data.chats[m.chat].economy && m.isGroup) {
return m.reply(`《✦》أوامر *الاقتصاد* متقفلة في الجروب ده.\n\n*المشرف* يقدر يفتحها بالأمر:\n`)
}
let user = getUser(global.db.data.users, m.sender)
if (!user) return conn.reply(m.chat, `✿ المستخدم مش موجود في قاعدة البيانات.`, m)
if (user.health >= 100) return conn.reply(m.chat, `✿ صحتك كاملة بالفعل.`, m)
if (user.coin <= 0) return conn.reply(m.chat, `✿ معندكش ${currency} كفاية عشان تتعالج.`, m)
const faltante = 100 - user.health
const disponible = Math.floor(user.coin / 50)
const curable = Math.min(faltante, disponible)
user.health += curable
user.coin -= curable * 50
user.lastHeal = Date.now()
const info = `✿ اتعالجت ${curable} نقطة صحة.\n⛁ ${currency} المتبقي: ${user.coin.toLocaleString()}\n♡ الصحة الحالية: ${user.health}`
await conn.sendMessage(m.chat, { text: info }, { quoted: m })
}

handler.help = ['heal']
handler.tags = ['rpg']
handler.command = ['heal', 'curar']
handler.group = true

export default handler