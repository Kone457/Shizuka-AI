import { getUser } from '../lib/userdb.js'
let handler = async (m, { conn, usedPrefix, command, args }) => {
  if (!db.data.chats[m.chat].economy && m.isGroup) {
    return m.reply(`《✦》أوامر *الاقتصاد* متقفلة في الجروب ده.\n\n*المشرف* يقدر يفتحها بـ:\n» *${usedPrefix}on economy*`)
  }
  if (!m.quoted) return m.reply("✿ لازم ترد على رسالة المستخدم اللي عايز تتبرع له.")
  let target = m.quoted.sender
  if (!target) return m.reply("✿ مقدرتش أحدد المستخدم اللي رديت عليه.")
  if (!args[0]) return m.reply(`✿ الطريقة الصح:\n» *${usedPrefix + command} الكمية* مع رد على المستخدم`)
  let cantidad = parseInt(args[0])
  if (isNaN(cantidad) || cantidad <= 0) return m.reply("✿ اكتب كمية صحيحة.")
  let user = getUser(global.db.data.users, m.sender)
  let receptor = getUser(global.db.data.users, target)
  if (!receptor) return m.reply("✿ المستخدم مش مسجل في قاعدة البيانات.")
  if (user.coin < cantidad) return m.reply("✿ معندكش كوينز كفاية للتبرع بالمبلغ ده.")
  user.coin -= cantidad
  receptor.coin += cantidad
  conn.reply(m.chat, `✿ Has donado *${cantidad.toLocaleString()} Coins* a @${target.split("@")[0]}`, m, { mentions: [target] })
}

handler.help = ['تبرع']
handler.tags = ['rpg']
handler.command = ['donar', 'تبرع']
handler.group = true

export default handler