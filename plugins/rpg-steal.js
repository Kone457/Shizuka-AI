import { getUser } from '../lib/userdb.js'
import { getBotConfig } from '../lib/botconfig.js'
const handler = async (m, { conn, usedPrefix, command }) => {
const currency = getBotConfig(conn, 'currency')
if (!db.data.chats[m.chat].economy && m.isGroup) {
return m.reply(`《✦》أوامر *الاقتصاد* متقفلة في الجروب ده.\n\n*المشرف* يقدر يفتحها بالأمر:\n`)
}
const user = getUser(global.db.data.users, m.sender)
user.lastrob = user.lastrob || 0
if (Date.now() < user.lastrob) {
const restante = user.lastrob - Date.now()
return conn.reply(m.chat, `✿ لازم تستنى *${formatTime(restante)}* عشان تستخدم *${usedPrefix + command}* تاني.`, m)
}
let mentionedJid = await m.mentionedJid
let who = mentionedJid && mentionedJid.length ? mentionedJid[0] : m.quoted && await m.quoted.sender ? await m.quoted.sender : null
if (!who) return conn.reply(m.chat, `✿ لازم تعمل منشن لحد عشان تحاول تسرقه.`, m)
const target = getUser(global.db.data.users, who)
if (!target) {
return conn.reply(m.chat, `✿ المستخدم مش موجود في قاعدة البيانات.`, m)
}
let name = typeof target.name === 'string' && target.name.trim() && target.name.trim() !== '[object Promise]' ? target.name.trim() : ''
if (!name) { try { const n = await conn.getName(who); name = typeof n === 'string' && n.trim() ? n.trim() : who.split('@')[0] } catch { name = who.split('@')[0] } }
const tiempoInactivo = Date.now() - (target.lastwork || 0)
if (tiempoInactivo < 3600000) {
return conn.reply(m.chat, `✿ تقدر تسرق *${currency}* من مستخدم بس لو كان غايب أكتر من ساعة.`, m)
}
const rob = Math.floor(Math.random() * 1001) + 2000
if (target.coin < rob) {
return conn.reply(m.chat, `✿ *${name}* معندوش *${currency}* كفاية برا البنك عشان يستاهل تحاول تسرقه.`, m, { mentions: [who] })
}
user.coin += rob
target.coin -= rob
user.lastrob = Date.now() + 7200000
conn.reply(m.chat, `✿ Le robaste *${rob.toLocaleString()} ${currency}* a *${name}*`, m, { mentions: [who] })
}

handler.help = ['سرقة']
handler.tags = ['rpg']
handler.command = ['robar', 'steal', 'rob', 'اسرق', 'اسرقستيكر', 'سرق', 'اسرق ستيكر', 'اسرق_ستيكر', 'سرقة']
handler.group = true

export default handler

function formatTime(ms) {
const totalSec = Math.ceil(ms / 1000)
const hours = Math.floor(totalSec / 3600)
const minutes = Math.floor((totalSec % 3600) / 60)
const seconds = totalSec % 60
const parts = []
if (hours) parts.push(`${hours} hora${hours !== 1 ? 's' : ''}`)
if (minutes) parts.push(`${minutes} minuto${minutes !== 1 ? 's' : ''}`)
parts.push(`${seconds} segundo${seconds !== 1 ? 's' : ''}`)
return parts.join(' ')
}