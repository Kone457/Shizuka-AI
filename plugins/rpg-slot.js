import { getUser } from '../lib/userdb.js'
import { getBotConfig } from '../lib/botconfig.js'
import { delay } from "@whiskeysockets/baileys"

const handler = async (m, { args, usedPrefix, command, conn }) => {
const currency = getBotConfig(conn, 'currency')
if (!db.data.chats[m.chat].economy && m.isGroup) {
return m.reply(`《✦》أوامر *الاقتصاد* متقفلة في الجروب ده.\n\n*المشرف* يقدر يفتحها بالأمر:\n`)
}
const users = getUser(global.db.data.users, m.sender)
if (!args[0] || isNaN(args[0]) || parseInt(args[0]) <= 0) {
return m.reply(`✿ من فضلك اكتب المبلغ اللي عايز تراهن بيه.`)
}
const apuesta = parseInt(args[0])
if (Date.now() - users.lastslot < 10000) {
const restante = users.lastslot + 10000 - Date.now()
return m.reply(`✿ لازم تستنى *${formatTime(restante)}* عشان تستخدم *${usedPrefix + command}* تاني.`)
}
if (apuesta < 100) return m.reply(`✿ أقل رهان 100 *${currency}*.`)
if (users.coin < apuesta) return m.reply(`✿ *${currency}* بتاعتك مش كفاية للرهان ده.`)
const emojis = ['✾', '❃', '✿']
const getRandomEmojis = () => {
const x = Array.from({ length: 3 }, () => emojis[Math.floor(Math.random() * emojis.length)])
const y = Array.from({ length: 3 }, () => emojis[Math.floor(Math.random() * emojis.length)])
const z = Array.from({ length: 3 }, () => emojis[Math.floor(Math.random() * emojis.length)])
return { x, y, z }
}
const initialText = '「✿」| *SLOTS* \n────────\n'
let { key } = await conn.sendMessage(m.chat, { text: initialText }, { quoted: m })
const animateSlots = async () => {
for (let i = 0; i < 5; i++) {
const { x, y, z } = getRandomEmojis()
const animationText = `「✿」| *SLOTS* 
────────
${x[0]} : ${y[0]} : ${z[0]}
${x[1]} : ${y[1]} : ${z[1]}
${x[2]} : ${y[2]} : ${z[2]}
────────`
await conn.sendMessage(m.chat, { text: animationText, edit: key }, { quoted: m })
await delay(300)
}}
await animateSlots()
const { x, y, z } = getRandomEmojis()
let resultado
if (x[0] === y[0] && y[0] === z[0]) {
resultado = `✿ كسبت! *${(apuesta * 2).toLocaleString()} ${currency}*.`
users.coin += apuesta
} else if (x[0] === y[0] || x[0] === z[0] || y[0] === z[0]) {
resultado = `✿ كدت تنجح. *خد 10 ${currency}* على المحاولة.`
users.coin += 10
} else {
resultado = `✿ خسرت *${apuesta.toLocaleString()} ${currency}*.`
users.coin -= apuesta
}
users.lastslot = Date.now()
const finalText = `「✿」| *ماكينة الحظ* \n────────\n${x[0]} : ${y[0]} : ${z[0]}\n${x[1]} : ${y[1]} : ${z[1]}\n${x[2]} : ${y[2]} : ${z[2]}\n────────\n${resultado}`
await conn.sendMessage(m.chat, { text: finalText, edit: key }, { quoted: m })
}

handler.help = ['سلوت']
handler.tags = ['rpg']
handler.command = ['slot', 'سلوت']
handler.group = true

export default handler

function formatTime(ms) {
const totalSec = Math.ceil(ms / 1000)
const minutes = Math.floor((totalSec % 3600) / 60)
const seconds = totalSec % 60
const parts = []
if (minutes > 0) parts.push(`${minutes} minuto${minutes !== 1 ? 's' : ''}`)
  parts.push(`${seconds} segundo${seconds !== 1 ? 's' : ''}`)
return parts.join(' ')
}