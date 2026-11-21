import { getUser } from '../lib/userdb.js'
import { getBotConfig } from '../lib/botconfig.js'
let handler = async (m, { conn, args, usedPrefix, command }) => {
const currency = getBotConfig(conn, 'currency')
if (!db.data.chats[m.chat].economy && m.isGroup) {
return m.reply(`《✦》أوامر *الاقتصاد* متقفلة في الجروب ده.\n\n*المشرف* يقدر يفتحها بالأمر:\n`)
}
let user = getUser(global.db.data.users, m.sender)
if (!args[0]) return m.reply(`✿ اكتب كمية *${currency}* اللي عايز تسحبها.`)
if (args[0] == 'all') {
let count = parseInt(user.bank)
user.bank -= count * 1
user.coin += count * 1
await m.reply(`✿ سحبت *${count.toLocaleString()} ${currency}* من البنك، دلوقتي تقدر تستخدمهم بس ممكن حد يسرقهم.`)
return !0
}
if (!Number(args[0])) return m.reply(`✿ لازم تسحب كمية صحيحة.\n> مثال 1 » *${usedPrefix + command} 25000*\n> مثال 2 » *${usedPrefix + command} all*`)
let count = parseInt(args[0])
if (!user.bank) return m.reply(`✿ معندكش *${currency}* كفاية في البنك.`)
if (user.bank < count) return m.reply(`✿ معاك بس *${user.bank.toLocaleString()} ${currency}* في البنك.`)
user.bank -= count * 1
user.coin += count * 1
await m.reply(`✿ سحبت *${count.toLocaleString()} ${currency}* من البنك، دلوقتي تقدر تستخدمهم بس ممكن حد يسرقهم.`)}

handler.help = ['اسحب']
handler.tags = ['rpg']
handler.command = ['withdraw', 'retirar', 'with', 'سحب', 'اسحب', 'مع']
handler.group = true

export default handler