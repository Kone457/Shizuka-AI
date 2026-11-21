import { getUser } from '../lib/userdb.js'
import { getBotConfig } from '../lib/botconfig.js'
const handler = async (m, { conn, text, command, usedPrefix }) => {
const currency = getBotConfig(conn, 'currency')
if (!db.data.chats[m.chat].economy && m.isGroup) return conn.reply(m.chat, `《✦》أوامر *الاقتصاد* متقفلة في الجروب ده.\n\n*المشرف* يقدر يفتحها بالأمر:\n`, m)
const user = getUser(global.db.data.users, m.sender)
if (!text) return conn.reply(m.chat, `✿ لازم تراهن بمبلغ صحيح.\n> مثال » *${usedPrefix + command} 150 (وجه/كتابة).*`, m)
const args = text.trim().split(/\s+/)
if (!args[0] || !args[1]) return conn.reply(m.chat, `✿ الصيغة غلط، اكتب المبلغ وبعده وجه/كتابة.\n> مثال » *${usedPrefix + command} 150 كتابة*`, m)
const cantidad = parseFloat(args[0])
const eleccion = args[1].toLowerCase()
if (isNaN(cantidad)) return conn.reply(m.chat, `✿ مبلغ غير صحيح، اكتب رقم صحيح.\n> مثال » *${usedPrefix + command} 200 كتابة*`, m)
if (Math.abs(cantidad) < 100) return conn.reply(m.chat, `✿ أقل مبلغ للرهان *100 ${currency}*.`, m)
if (!['cara', 'cruz'].includes(eleccion)) return conn.reply(m.chat, `✿ اختيار غير صحيح. المسموح *وجه* أو *كتابة*.\n> مثال » *${usedPrefix + command} 200 وجه*`, m)
if (cantidad > user.coin) return conn.reply(m.chat, `✿ معندكش *${currency}* كفاية للرهان، معاك *${user.coin.toLocaleString()} ${currency}*.`, m)
const resultado = Math.random() < 0.5 ? 'cara' : 'cruz'
const acierto = resultado === eleccion
const cambio = acierto ? cantidad : -cantidad
user.coin += cambio
if (user.coin < 0) user.coin = 0
const mensaje = `✿ العملة طلعت *${capitalize(resultado)}* و${acierto ? 'كسبت' : 'خسرت'} *${Math.abs(cambio).toLocaleString()} ${currency}*!\n> اختيارك كان *${capitalize(eleccion)}*`
return conn.reply(m.chat, mensaje, m)
}

handler.help = ['cf']
handler.tags = ['rpg']
handler.command = ['cf', 'suerte', 'coinflip', 'flip']
handler.group = true

export default handler

function capitalize(txt) {
return txt.charAt(0).toUpperCase() + txt.slice(1)
}