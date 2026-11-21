import { getUser } from '../lib/userdb.js'
import { getBotConfig } from '../lib/botconfig.js'
async function handler(m, { conn, args, usedPrefix, command }) {
const currency = getBotConfig(conn, 'currency')
if (!db.data.chats[m.chat].economy && m.isGroup) {
return m.reply(`《✦》أوامر *الاقتصاد* متقفلة في الجروب ده.\n\n*المشرف* يقدر يفتحها بالأمر:\n`)
}
let mentionedJid = await m.mentionedJid
const who = m.quoted ? await m.quoted.sender : (mentionedJid && mentionedJid[0]) || (args[1] ? (args[1].replace(/[@ .+-]/g, '') + '@s.whatsapp.net') : '')   
if (!args[0]) return m.reply(`✿ لازم تعمل منشن للي عايز تهديه *${currency}*.\n> مثال » *${usedPrefix + command} 25000 @منشن*`)
if (!isNumber(args[0]) && args[0].startsWith('@')) return m.reply(`✿ الأول اكتب الكمية اللي عايز تحوّلها، وبعدها الشخص.\nمثال: *${usedPrefix + command} 1000 @mencion*`)
if (!who) return m.reply(`✿ لازم تعمل منشن لحد عشان تحوّل *${currency}*.`)
let user = getUser(global.db.data.users, m.sender)
let recipient = getUser(global.db.data.users, who)
if (!recipient) return m.reply(`✿ المستخدم مش موجود في قاعدة البيانات.`)
if (!user) return m.reply(`✿ انت مش موجود في قاعدة البيانات.`)
let count = Math.min(Number.MAX_SAFE_INTEGER, Math.max(10, (isNumber(args[0]) ? parseInt(args[0]) : 10)))
if (typeof user.bank !== 'number') user.bank = 0
if (user.bank < count) return m.reply(`✿ معندكش *${currency}* كفاية في البنك للتحويل.`)
user.bank -= count
if (typeof recipient.bank !== 'number') recipient.bank = 0
recipient.bank += count   
if (isNaN(user.bank)) user.bank = 0
let name = typeof recipient.name === 'string' && recipient.name.trim() && recipient.name.trim() !== '[object Promise]' ? recipient.name.trim() : ''
if (!name) { try { const n = await conn.getName(who); name = typeof n === 'string' && n.trim() ? n.trim() : who.split('@')[0] } catch { name = who.split('@')[0] } }
m.reply(`✿ حوّلت *${count.toLocaleString()} ${currency}* لـ *${name}*\n> دلوقتي عندك *${user.bank.toLocaleString()} ${currency}* إجمالي في البنك.`, null, { mentions: [who] })
}

handler.help = ['pay']
handler.tags = ['rpg']
handler.command = ['pay', 'coinsgive', 'givecoins']
handler.group = true

export default handler

function isNumber(x) {
return !isNaN(x)
}