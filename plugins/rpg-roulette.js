import { getUser } from '../lib/userdb.js'
import { getBotConfig } from '../lib/botconfig.js'
const handler = async (m, { conn, text, command, usedPrefix }) => {
const currency = getBotConfig(conn, 'currency')
if (!db.data.chats[m.chat].economy && m.isGroup) {
return m.reply(`《✦》أوامر *الاقتصاد* متقفلة في الجروب ده.\n\n*المشرف* يقدر يفتحها بالأمر:\n`)
}
const users = getUser(global.db.data.users, m.sender)
if (!text) return conn.reply(m.chat, `✿ اكتب كمية *${currency}* واراهن على لون.\n> مثال: *${usedPrefix + command} 2500 red*`, m)
let args = text.trim().split(" ")
if (args.length !== 2) return conn.reply(m.chat, `✿ الصيغة غلط. اكتب كمية *${currency}* واراهن على لون.\n> مثال: *${usedPrefix + command} 2500 red*`, m)
let coin = parseInt(args[0])
let color = args[1].toLowerCase()
if (isNaN(coin) || coin <= 0) return conn.reply(m.chat, `✿ من فضلك اكتب مبلغ صحيح للرهان.`, m)
if (!(color === 'black' || color === 'red')) return conn.reply(m.chat, `ꕥ لازم تراهن على لون صحيح: *black* أو *red*.`, m)
if (coin > users.coin) return conn.reply(m.chat, `✿ معندكش *${currency}* كفاية للرهان ده.`, m)
const resultColor = Math.random() < 0.5 ? 'black' : 'red'
const win = color === resultColor
if (win) {
users.coin += coin
conn.reply(m.chat, `✿ الروليت طلع *${resultColor}* وكسبت *${coin.toLocaleString()} ${currency}*!`, m)
} else {
users.coin -= coin
conn.reply(m.chat, `✿ الروليت طلع *${resultColor}* وخسرت *${coin.toLocaleString()} ${currency}*!`, m)
}}

handler.tags = ['rpg']
handler.help = ['ruleta']
handler.command = ['ruleta', 'roulette', 'rt']
handler.group = true

export default handler