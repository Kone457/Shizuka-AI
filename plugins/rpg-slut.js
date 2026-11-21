import { getUser } from '../lib/userdb.js'
import { getBotConfig } from '../lib/botconfig.js'
let handler = async (m, { conn, usedPrefix, command }) => {
const currency = getBotConfig(conn, 'currency')
if (!db.data.chats[m.chat].economy && m.isGroup) {
return m.reply(`《✦》أوامر *الاقتصاد* متقفلة في الجروب ده.\n\n*المشرف* يقدر يفتحها بالأمر:\n`)
}
let user = getUser(global.db.data.users, m.sender)
user.lastslut = user.lastslut || 0
const cooldown = 5 * 60 * 1000
if (Date.now() < user.lastslut) {
const restante = user.lastslut - Date.now()
const tiempoRestante = formatTime(restante)
return conn.reply(m.chat, `✿ لازم تستنى *${tiempoRestante}* عشان تستخدم *${usedPrefix + command}* تاني.`, m)
}
user.lastslut = Date.now() + cooldown
const evento = pickRandom(slut)
let cantidad
if (evento.tipo === 'victoria') {
cantidad = Math.floor(Math.random() * 1501) + 4000
user.coin += cantidad
} else {
cantidad = Math.floor(Math.random() * 1001) + 3000
user.coin -= cantidad
if (user.coin < 0) user.coin = 0
}
const mensaje = `✿ ${evento.mensaje} *${cantidad.toLocaleString()} ${currency}*`
await conn.reply(m.chat, mensaje, m)
}

handler.help = ['شغل اضافي']
handler.tags = ['rpg']
handler.command = ['slut', 'protituirse', 'شغلاضافي', 'شحاته', 'شغل اضافي', 'شغل_اضافي']
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
function pickRandom(list) {
return list[Math.floor(Math.random() * list.length)]
}
const slut = [
{ tipo: 'victoria', mensaje: "خلّصت الشغلانة وطلعت منها مكسب، كسبت." },
{ tipo: 'victoria', mensaje: "الشغلانة مشيت على أحسن وجه، كسبت." },
{ tipo: 'victoria', mensaje: "قبضت حقها كامل، كسبت." },
{ tipo: 'victoria', mensaje: "اشتغلت يوم كامل واتدفعتلك، كسبت." },
{ tipo: 'victoria', mensaje: "خدت اليومية كاملة، كسبت." },
{ tipo: 'victoria', mensaje: "خلصت الطلب واستلمت حقك، كسبت." },
{ tipo: 'victoria', mensaje: "اشتغلت الشيفت وخلص على خير، كسبت." },
{ tipo: 'victoria', mensaje: "اتفقتم على السعر واستلمت فلوسك، كسبت." },
{ tipo: 'victoria', mensaje: "جالك مبلغ محترم على الشغلانة، كسبت." },
{ tipo: 'victoria', mensaje: "الحساب اتظبط وجالك اللي ليك، كسبت." },
{ tipo: 'victoria', mensaje: "خدت حق تعبك، كسبت." },
{ tipo: 'victoria', mensaje: "خدت حق تعبك، كسبت." },
{ tipo: 'victoria', mensaje: "الشغلانة كانت مربحة، كسبت." },
{ tipo: 'victoria', mensaje: "خلصت اليوم وانت كسبان، كسبت." },
{ tipo: 'victoria', mensaje: "الطلب عجب الزبون ودفعلك زيادة، كسبت." },
{ tipo: 'victoria', mensaje: "الكل راضي عن شغلك، كسبت." },
{ tipo: 'victoria', mensaje: "اشتغلت بجد واستلمت حقك، كسبت." },
{ tipo: 'victoria', mensaje: "خلصت الاتفاق وجالك المبلغ، كسبت." },
{ tipo: 'victoria', mensaje: "جالك مبلغ حلو على الشغلانة، كسبت." },
{ tipo: 'derrota', mensaje: "حسبت الزبون الغلط وحد بلّغ عليك، خسرت." },
{ tipo: 'derrota', mensaje: "الزبون مشي من غير ما يدفع، خسرت." },
{ tipo: 'derrota', mensaje: "اشتغلت ببلاش ومحدش دفعلك، خسرت." },
{ tipo: 'derrota', mensaje: "الشغلانة ضاعت من إيدك، خسرت." },
{ tipo: 'derrota', mensaje: "حد خد حاجتك قبل الموعد، خسرت." },
{ tipo: 'derrota', mensaje: "اشتغلت ومحدش دفعلك حاجة، خسرت." },
{ tipo: 'derrota', mensaje: "الزبون رجع في كلامه في آخر لحظة، خسرت." },
{ tipo: 'derrota', mensaje: "رجعت من الشغلانة بخفي حنين، خسرت." }
]
