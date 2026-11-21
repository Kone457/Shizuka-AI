import { getUser } from '../lib/userdb.js'
import { getBotConfig } from '../lib/botconfig.js'
let handler = async (m, { conn, usedPrefix }) => {
const currency = getBotConfig(conn, 'currency')
if (!db.data.chats[m.chat].economy && m.isGroup) {
return m.reply(`《✦》أوامر *الاقتصاد* متقفلة في الجروب ده.\n\n*المشرف* يقدر يفتحها بالأمر:\n`)
}
let mentionedJid = await m.mentionedJid
let who = mentionedJid[0] ? mentionedJid[0] : m.quoted ? await m.quoted.sender : m.sender
let user = getUser(global.db.data.users, who)
if (!user) return m.reply(`✿ المستخدم مش موجود في قاعدة البيانات.`)
let name = typeof user.name === 'string' && user.name.trim() && user.name.trim() !== '[object Promise]' ? user.name.trim() : ''
if (!name) { try { const n = await conn.getName(who); name = typeof n === 'string' && n.trim() ? n.trim() : who.split('@')[0] } catch { name = who.split('@')[0] } }
let coin = user.coin || 0
let bank = user.bank || 0
let total = (user.coin || 0) + (user.bank || 0)
const texto = `ᥫ᭡ المعلومات - الرصيد ✿
 
ᰔᩚ المستخدم » *${name}*   
⛀ المحفظة » *${coin.toLocaleString()} ${currency}*
⚿ البنك » *${bank.toLocaleString()} ${currency}*
⛁ Total » *${total.toLocaleString()} ${currency}*

> *Para proteger tu dinero, ¡depósitalo en el banco usando #deposit!*`
await conn.reply(m.chat, texto, m)
}

handler.help = ['bal']
handler.tags = ['rpg']
handler.command = ['bal', 'balance', 'bank'] 
handler.group = true 

export default handler