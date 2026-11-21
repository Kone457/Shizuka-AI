import { getUser } from '../lib/userdb.js'
import { getBotConfig } from '../lib/botconfig.js'
var handler = async (m, { conn, usedPrefix }) => {
const currency = getBotConfig(conn, 'currency')
if (!db.data.chats[m.chat].economy && m.isGroup) return m.reply(`《✦》أوامر *الاقتصاد* متقفلة في الجروب ده.\n\n*المشرف* يقدر يفتحها بالأمر:\n`)
let user = getUser(global.db.data.users, m.sender)
let now = Date.now()
let gap = 86400000
let maxStreak = 200
user.streak = user.streak || 0
user.lastDailyGlobal = user.lastDailyGlobal || 0
user.coin = user.coin || 0
user.exp = user.exp || 0
user.lastDaily = user.lastDaily || 0
if (now < user.lastDaily) {
let wait = formatTime(Math.floor((user.lastDaily - now) / 1000))
return conn.reply(m.chat, `✿ استلمت *اليومي* بتاعك النهاردة.\n> تقدر تستلمه تاني بعد *${wait}*`, m)
}
let lost = user.streak >= 1 && now - user.lastDailyGlobal > gap * 1.5
if (lost) user.streak = 0
let canClaimGlobal = now - user.lastDailyGlobal >= gap
if (canClaimGlobal) {
user.streak = Math.min(user.streak + 1, maxStreak)
user.lastDailyGlobal = now
}
let reward = Math.min(20000 + (user.streak - 1) * 5000, 1015000)
let expRandom = Math.floor(Math.random() * (100 - 20 + 1)) + 20
user.coin += reward
user.exp += expRandom
user.lastDaily = now + gap
let nextReward = Math.min(20000 + user.streak * 5000, 1015000).toLocaleString()
let msg = `> اليوم *${user.streak + 1}* » *+${nextReward}*`
if (lost) msg += `\n> ☆ خسرت سلسلة الأيام بتاعتك!`
conn.reply(m.chat, `✿ استلمت مكافأتك اليومية *${reward.toLocaleString()} ${currency}*! (اليوم *${user.streak}*)\n${msg}`, m)
}

handler.help = ['يومي']
handler.tags = ['rpg']
handler.command = ['daily', 'diario', 'يومي', 'اليومية']
handler.group = true

export default handler

function formatTime(t) {
const h = Math.floor(t / 3600)
const m = Math.floor((t % 3600) / 60)
const s = t % 60
const parts = []
if (h) parts.push(`${h} hora${h !== 1 ? 's' : ''}`)
if (m || h) parts.push(`${m} minuto${m !== 1 ? 's' : ''}`)
parts.push(`${s} segundo${s !== 1 ? 's' : ''}`)
return parts.join(' ')
}