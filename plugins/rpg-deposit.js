import { getUser } from '../lib/userdb.js'
import { getBotConfig } from '../lib/botconfig.js'
let handler = async (m, { conn, args, usedPrefix, command }) => {
const currency = getBotConfig(conn, 'currency')
if (!db.data.chats[m.chat].economy && m.isGroup) {
return m.reply(`《✦》أوامر *الاقتصاد* متقفلة في الجروب ده.\n\n*المشرف* يقدر يفتحها بالأمر:\n`)
}
let user = getUser(global.db.data.users, m.sender)
if (!args[0]) return m.reply(`✿ اكتب كمية *${currency}* اللي عايز تودّعها.`)
if ((args[0]) < 1) return m.reply(`✿ اكتب كمية صحيحة من *${currency}*.`)
if (args[0] == 'all') {
let count = parseInt(user.coin)
user.coin -= count * 1
user.bank += count * 1
await m.reply(`✿ ودّعت *${count.toLocaleString()} ${currency}* في البنك، محدش يقدر يسرقهم.`)
return !0
}
if (!Number(args[0])) return m.reply(`✿ لازم تودّع كمية صحيحة.\n> مثال 1 » *${usedPrefix}d 25000*\n> مثال 2 » *${usedPrefix}d all*`)
let count = parseInt(args[0])
if (!user.coin) return m.reply(`✿ معندكش *${currency}* كفاية في المحفظة.`)
if (user.coin < count) return m.reply(`✧ معاك بس *${user.coin.toLocaleString()} ${currency}* في المحفظة.`)
user.coin -= count * 1
user.bank += count * 1
await m.reply(`✿ ودّعت *${count.toLocaleString()} ${currency}* في البنك، محدش يقدر يسرقهم.`)}

handler.help = ['depositar']
handler.tags = ['rpg']
handler.command = ['deposit', 'depositar', 'd', 'dep']
handler.group = true

export default handler