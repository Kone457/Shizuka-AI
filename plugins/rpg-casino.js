import { getUser } from '../lib/userdb.js'
import { getBotConfig } from '../lib/botconfig.js'
let buatall = 1
let handler = async (m, { conn, args, usedPrefix, command }) => {
const currency = getBotConfig(conn, 'currency')
const botname = getBotConfig(conn, 'botname')
if (!db.data.chats[m.chat].economy && m.isGroup) {
return m.reply(`《✦》أوامر *الاقتصاد* متقفلة في الجروب ده.\n\n*المشرف* يقدر يفتحها بالأمر:\n`)
}
const user = getUser(global.db.data.users, m.sender)
let Aku = Math.floor(Math.random() * 101)
let Kamu = Math.floor(Math.random() * 55)
let count = args[0]
let userName = typeof user.name === 'string' && user.name.trim() && user.name.trim() !== '[object Promise]' ? user.name.trim() : ''
if (!userName) { try { const n = await conn.getName(m.sender); userName = typeof n === 'string' && n.trim() ? n.trim() : m.sender.split('@')[0] } catch { userName = m.sender.split('@')[0] } }
const tiempoEspera = 15 * 1000
const ahora = Date.now()
if (user.lastApuesta && ahora - user.lastApuesta < tiempoEspera) {
const restante = user.lastApuesta + tiempoEspera - ahora
const tiempoRestante = formatTime(restante)
return conn.reply(m.chat, `✿ لازم تستنى *${tiempoRestante}* عشان تستخدم *${usedPrefix + command}* تاني.`, m)
}
user.lastApuesta = ahora
count = count ? /all/i.test(count) ? Math.floor(getUser(global.db.data.users, m.sender).limit / buatall) : parseInt(count) : args[0] ? parseInt(args[0]) : 1
count = Math.max(1, count)
if (args.length < 1) {
return conn.reply(m.chat, `✿ اكتب كمية *${currency}* اللي عايز تلعب بيها ضد *${botname}*\n> مثال: *${usedPrefix + command} 100*`, m)
}
if (user.coin >= count) {
user.coin -= count
let resultado = ''
let ganancia = 0
if (Aku > Kamu) {
resultado = `> ${userName}, *خسرت ${formatNumber(count)} ${currency}*.`
} else if (Aku < Kamu) {
ganancia = count * 2
user.coin += ganancia
resultado = `> ${userName}, *كسبت ${formatNumber(ganancia)} ${currency}*.`
} else {
ganancia = count
user.coin += ganancia
resultado = `> ${userName}, *كسبت ${formatNumber(ganancia)} ${currency}*.`
}
const replyMsg = `✿ \`يلا نشوف الأرقام!\`\n\n➠ *${botname}* : ${Aku}\n➠ *${userName}* : ${Kamu}\n\n` +
resultado
conn.reply(m.chat, replyMsg.trim(), m)
} else {
conn.reply(m.chat, `✿ معندكش *${formatNumber(count)} ${currency}* تلعب بيهم!`, m)
}}

handler.help = ['راهن']
handler.tags = ['rpg']
handler.command = ['apostar', 'casino', 'راهن', 'كازينو']
handler.group = true

export default handler

function formatNumber(number) {
return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}
function formatTime(ms) {
if (ms <= 0 || isNaN(ms)) return 'Ahora'
const totalSec = Math.ceil(ms / 1000)
const min = Math.floor(totalSec / 60)
const sec = totalSec % 60
const partes = []
if (min) partes.push(`${min} minuto${min !== 1 ? 's' : ''}`)
partes.push(`${sec} segundo${sec !== 1 ? 's' : ''}`)
return partes.join(' ')
}