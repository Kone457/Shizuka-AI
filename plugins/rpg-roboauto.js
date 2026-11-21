import { getUser } from '../lib/userdb.js'
import { getBotConfig } from '../lib/botconfig.js'
let handler = async (m, { conn, usedPrefix, command }) => {
const currency = getBotConfig(conn, 'currency')
  if (!db.data.chats[m.chat].economy && m.isGroup) {
    return m.reply(`《✦》أوامر *الاقتصاد* متقفلة في الجروب ده.\n\n*المشرف* يقدر يفتحها بـ:\n» *${usedPrefix}on economy*`)
  }
  let user = getUser(global.db.data.users, m.sender)
  user.lastroboauto = user.lastroboauto || 0
  const cooldown = 6 * 60 * 1000
  if (Date.now() < user.lastroboauto) {
    const restante = user.lastroboauto - Date.now()
    return conn.reply(m.chat, `✿ لازم تستنى *${formatTime(restante)}* عشان تستخدم *${usedPrefix + command}* تاني.`, m)
  }
  user.lastroboauto = Date.now() + cooldown
  const evento = pickRandom(roboauto)
  let cantidad = Math.floor(Math.random() * 2000) + 3000
  if (evento.tipo === 'victoria') {
    user.coin += cantidad
  } else {
    user.coin -= cantidad
    if (user.coin < 0) user.coin = 0
  }
  return conn.reply(m.chat, `✿ ${evento.mensaje} *${cantidad.toLocaleString()} ${currency}*`, m)
}

handler.help = ['roboauto']
handler.tags = ['rpg']
handler.command = ['roboauto']
handler.group = true

export default handler

function formatTime(ms) {
  const totalSec = Math.ceil(ms / 1000)
  const min = Math.floor(totalSec / 60)
  const sec = totalSec % 60
  return `${min}m ${sec}s`
}
function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)]
}

const roboauto = [
{ tipo: 'victoria', mensaje: "سرقت تانك من الحرب العالمية التانية من المتحف، كسبت." },
  { tipo: 'victoria', mensaje: "كسرت قفل عربية فخمة وهربت، كسبت." },
  { tipo: 'victoria', mensaje: "اخترقت نظام عربية كهربائية وبعتها تاني، كسبت." },
  { tipo: 'derrota', mensaje: "اتقبض عليك في الآخر، خسرت." },
  { tipo: 'derrota', mensaje: "صاحب المكان طلع في الوقت المناسب ومسكك، خسرت." },
  { tipo: 'derrota', mensaje: "الشرطة تتبعت الـGPS ووقفتك، خسرت." }
]