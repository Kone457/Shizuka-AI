import { getUser } from '../lib/userdb.js'
import { getBotConfig } from '../lib/botconfig.js'
let handler = async (m, { conn, usedPrefix, command }) => {
const currency = getBotConfig(conn, 'currency')
if (!db.data.chats[m.chat].economy && m.isGroup) {
return m.reply(`《✦》أوامر *الاقتصاد* متقفلة في الجروب ده.\n\n*المشرف* يقدر يفتحها بالأمر:\n`)
}
let user = getUser(global.db.data.users, m.sender)
user.lastcrime = user.lastcrime || 0
user.coin = user.coin || 0
const cooldown = 8 * 60 * 1000
const ahora = Date.now()
if (ahora < user.lastcrime) {
const restante = user.lastcrime - ahora
const wait = formatTimeMs(restante)
return conn.reply(m.chat, `✿ لازم تستنى *${wait}* عشان تستخدم *${usedPrefix + command}* تاني.`, m)
}
user.lastcrime = ahora + cooldown
const evento = pickRandom(crimen)
let cantidad
if (evento.tipo === 'victoria') {
cantidad = Math.floor(Math.random() * 1501) + 6000
user.coin += cantidad
} else {
cantidad = Math.floor(Math.random() * 1501) + 4000
user.coin -= cantidad
if (user.coin < 0) user.coin = 0
}
await conn.reply(m.chat, `✿ ${evento.mensaje} *${cantidad.toLocaleString()} ${currency}*`, m)
}

handler.tags = ['rpg']
handler.help = ['crimen']
handler.command = ['crimen', 'crime']
handler.group = true

export default handler

function formatTimeMs(ms) {
const totalSec = Math.ceil(ms / 1000)
const min = Math.floor(totalSec / 60)
const sec = totalSec % 60
const partes = []
if (min) partes.push(`${min} minuto${min !== 1 ? 's' : ''}`)
partes.push(`${sec} segundo${sec !== 1 ? 's' : ''}`)
return partes.join(' ')
}
function pickRandom(list) {
return list[Math.floor(Math.random() * list.length)]
}
const crimen = [
{ tipo: 'victoria', mensaje: "اخترقت ماكينة ATM بثغرة في النظام وسحبت كاش من غير تنبيه، كسبت." },
{ tipo: 'victoria', mensaje: "دخلت فيلا بشكل فني وسرقت جواهر وانت بتفحص الشبكة، كسبت." },
{ tipo: 'victoria', mensaje: "عملت تحويل بنكي مزور وخدت الفلوس قبل ما يلغوا العملية، كسبت." },
{ tipo: 'victoria', mensaje: "اعترضت طرد فخم في استقبال شركة وبعته تاني، كسبت." },
{ tipo: 'victoria', mensaje: "فضّيت محفظة منسية في مطعم من غير ما حد ياخد باله، كسبت." },
{ tipo: 'victoria', mensaje: "دخلت سيرفر متجر أونلاين وعملت خصومات وهمية وخدت منتجات ببلاش، كسبت." },
{ tipo: 'victoria', mensaje: "اتنكرت في شكل دليفري وخدت طرد كولكشن من غير شكوك، كسبت." },
{ tipo: 'victoria', mensaje: "نسخت المفتاح الرئيسي لمعرض فنون وبعت تمثال من غير تسجيل، كسبت." },
{ tipo: 'victoria', mensaje: "عملت موقع تبرعات مزيف وخليت مئات الناس تتبرع، كسبت." },
{ tipo: 'victoria', mensaje: "تلاعبت في قارئ كروت في محل وفضّيت حسابات ناس، كسبت." },
{ tipo: 'victoria', mensaje: "زوّرت تذاكر VIP لفعالية ودخلت منطقة فيها حاجات حصرية، كسبت." },
{ tipo: 'victoria', mensaje: "نصبت على جامع تحف وبعتله نسخة على إنها أصلية، كسبت." },
{ tipo: 'victoria', mensaje: "صوّرت باسورد رجل أعمال في كافيه وحوّلت فلوس لحسابك، كسبت." },
{ tipo: 'victoria', mensaje: "أقنعت راجل كبير باستثمار وهمي وخدت مدخراته، كسبت." },
{ tipo: 'derrota', mensaje: "حاولت تبيع ساعة مقلدة، بس الشاري كشف الخدعة وبلّغ عليك، خسرت." },
{ tipo: 'derrota', mensaje: "اخترقت حساب بنكي، بس نسيت تخفي الـIP واتتبعت، خسرت." },
{ tipo: 'derrota', mensaje: "سرقت شنطة في فعالية، بس كاميرا مخفية صوّرت كل حاجة، خسرت." },
{ tipo: 'derrota', mensaje: "دخلت محل فخم، بس نظام الإنذار الصامت اشتغل، خسرت." },
{ tipo: 'derrota', mensaje: "اتنكرت في شكل فني في فيلا، بس صاحبها عرفك ونده الأمن، خسرت." },
{ tipo: 'derrota', mensaje: "حاولت تبيع ورق سري، بس كان مزور ومحدش اشتراه، خسرت." }
]