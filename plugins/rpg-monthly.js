import { getUser } from '../lib/userdb.js'
import { getBotConfig } from '../lib/botconfig.js'
var handler = async (m, { conn, usedPrefix }) => {
const currency = getBotConfig(conn, 'currency')
if (!db.data.chats[m.chat].economy && m.isGroup) return m.reply(`《✦》أوامر *الاقتصاد* متقفلة في الجروب ده.\n\n*المشرف* يقدر يفتحها بالأمر:\n`)
let user = getUser(global.db.data.users, m.sender)
const gap = 2592000000
const now = Date.now()
user.monthlyStreak = user.monthlyStreak || 0
user.lastMonthlyGlobal = user.lastMonthlyGlobal || 0
user.coin = user.coin || 0
user.exp = user.exp || 0
user.lastmonthly = user.lastmonthly || 0
if (now < user.lastmonthly) {
const wait = formatTime(Math.floor((user.lastmonthly - now) / 1000))
return conn.reply(m.chat, `✿ استلمت مكافأتك الشهرية.\n> تقدر تستلمها تاني بعد *${wait}*`, m)
}
const lost = user.monthlyStreak >= 1 && now - user.lastMonthlyGlobal > gap * 1.5
if (lost) user.monthlyStreak = 0
const canClaimGlobal = now - user.lastMonthlyGlobal >= gap
if (canClaimGlobal) {
user.monthlyStreak = Math.min(user.monthlyStreak + 1, 8)
user.lastMonthlyGlobal = now
}
const coins = Math.min(60000 + (user.monthlyStreak - 1) * 5000, 95000)
const expRandom = Math.floor(Math.random() * (500 - 100 + 1)) + 100
user.coin += coins
user.exp += expRandom
user.lastmonthly = now + gap
let next = Math.min(60000 + user.monthlyStreak * 5000, 95000).toLocaleString()
let msg = `> Mes *${user.monthlyStreak + 1}* » *+${next}*`
if (lost) msg += `\n> ☆ خسرت سلسلة الشهور بتاعتك!`
conn.reply(m.chat, `✿ استلمت مكافأتك الشهرية *+${coins.toLocaleString()} ${currency}* (الشهر *${user.monthlyStreak}*)\n${msg}`, m)
}

handler.help = ['الشهري', 'شهري']
handler.tags = ['rpg']
handler.command = ['monthly', 'mensual', 'الشهري', 'شهري']
handler.group = true

export default handler

function formatTime(t) {
const d = Math.floor(t / 86400)
const h = Math.floor((t % 86400) / 3600)
const m = Math.floor((t % 3600) / 60)
const s = t % 60
if (d) return `${d} يوم ${h} ساعة ${m} دقيقة`
if (h) return `${h} hora${h !== 1 ? 's' : ''} ${m} minuto${m !== 1 ? 's' : ''} ${s} segundo${s !== 1 ? 's' : ''}`
if (m) return `${m} minuto${m !== 1 ? 's' : ''} ${s} segundo${s !== 1 ? 's' : ''}`
return `${s} segundo${s !== 1 ? 's' : ''}`
}