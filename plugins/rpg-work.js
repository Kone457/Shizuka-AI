import { getUser } from '../lib/userdb.js'
import { getBotConfig } from '../lib/botconfig.js'
let handler = async (m, { conn, usedPrefix, command }) => {
const currency = getBotConfig(conn, 'currency')
if (!db.data.chats[m.chat].economy && m.isGroup) {
return m.reply(`《✦》أوامر *الاقتصاد* متقفلة في الجروب ده.\n\n*المشرف* يقدر يفتحها بالأمر:\n`)
}
let user = getUser(global.db.data.users, m.sender)
const cooldown = 2 * 60 * 1000
user.lastwork = user.lastwork || 0
if (Date.now() < user.lastwork) {
const tiempoRestante = formatTime(user.lastwork - Date.now())
return conn.reply(m.chat, `✿ لازم تستنى *${tiempoRestante}* عشان تستخدم *${usedPrefix + command}* تاني.`, m)
}
user.lastwork = Date.now() + cooldown
let rsl = Math.floor(Math.random() * 1501) + 2000
await conn.reply(m.chat, `✿ ${pickRandom(trabajo)} *${rsl.toLocaleString()} ${currency}*.`, m)
user.coin += rsl
}

handler.help = ['trabajar']
handler.tags = ['economy']
handler.command = ['w', 'work', 'chambear', 'chamba', 'trabajar']
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
return list[Math.floor(list.length * Math.random())]
}
const trabajo = [
"اشتغلت تقطيع بسكويت وكسبت",
"اشتغلت مع شركة عسكرية خاصة وكسبت",
"نظّمت حفلة تذوق عصاير وخدت",
"نضّفت المدخنة ولقيت",
"طوّرت ألعاب عشان تعيش وكسبت",
"اشتغلت أوفر تايم في المكتب وكسبت",
"اشتغلت في خطف العرايس وكسبت",
"حد جه مثّل مسرحية، وانت اتفرجت وخدت",
"اشتريت وبعت حاجات وكسبت",
"اشتغلت طباخة في مطعم تيتة وكسبت",
"اشتغلت 10 دقايق في بيتزا هت وكسبت",
"كتبت حظاظات البسكويت وكسبت",
"بصيت في شنطتك وبعت حاجات مش محتاجها، وطلعت تساوي",
"طوّرت ألعاب عشان تعيش وكسبت",
"اشتغلت اليوم كله في الشركة وكسبت",
"صمّمت لوجو لشركة وخدت",
"اشتغلت بأحسن ما تقدر في مطبعة وكانت بتوظّف وخدت اللي يستاهله!",
"اشتغلت تقليم شجر وكسبت",
"اشتغلت صوت لسبونج بوب وكسبت",
"كنت بتزرع وكسبت",
"اشتغلت بناء قلع رمل وكسبت",
"Trabajas como artista callejera y ganas",
"عملت شغل اجتماعي لقضية كويسة! وخدت",
"صلّحت تانك T-60 باظ في أفغانستان. الطاقم دفعلك",
"اشتغلت حارس ثعابين بحر وكسبت",
"اشتغلت في ديزني لاند لبست بدلة باندا وكسبت",
"صلّحت ماكينات الأركيد وخدت",
"عملت شغلانة يوم في المدينة وكسبت",
"نضّفت عفن سام من التهوية وكسبت",
"حلّيت لغز انتشار الكوليرا والحكومة كافأتك بمبلغ",
"اشتغلت زولوجي وكسبت",
"بعت سندوتشات سمك وخدت",
"صلّحت ماكينات الأركيد وخدت"
]