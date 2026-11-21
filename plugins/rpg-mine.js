import { getUser } from '../lib/userdb.js'
import { getBotConfig } from '../lib/botconfig.js'
var handler = async (m, { conn, usedPrefix, command }) => {
const currency = getBotConfig(conn, 'currency')
if (!db.data.chats[m.chat].economy && m.isGroup) {
return m.reply(`《✦》أوامر *الاقتصاد* متقفلة في الجروب ده.\n\n*المشرف* يقدر يفتحها بالأمر:\n`)
}
const user = getUser(global.db.data.users, m.sender)
if (!user) return
user.lastmine = user.lastmine || 0
user.coin = user.coin || 0
user.exp = user.exp || 0
user.health = user.health || 100
user.pickaxedurability = user.pickaxedurability || 100
if (user.health < 5)
return conn.reply(m.chat, `✿ صحتك مش كفاية عشان تنزل *تحفر* تاني.\n> استخدم *"${usedPrefix}heal"* عشان تتعالج.`, m)
const gap = 10 * 60 * 1000
const now = Date.now()
if (now < user.lastmine) {
const restante = user.lastmine - now
return conn.reply(m.chat, `✿ لازم تستنى *${formatTime(restante)}* عشان تستخدم *${usedPrefix + command}* تاني.`, m)
}
user.lastmine = now + gap
const evento = pickRandom(eventos)
let monedas, experiencia, salud
if (evento.tipo === 'victoria') {
monedas = Math.floor(Math.random() * 2001) + 7000
experiencia = Math.floor(Math.random() * 91) + 10
salud = Math.floor(Math.random() * 3) + 1
user.coin += monedas
user.exp += experiencia
user.health -= salud
} else {
monedas = Math.floor(Math.random() * 2001) + 3000
experiencia = Math.floor(Math.random() * 41) + 10
salud = Math.floor(Math.random() * 5) + 1
user.coin -= monedas
user.exp -= experiencia
user.health -= salud
if (user.coin < 0) user.coin = 0
if (user.exp < 0) user.exp = 0
}
if (user.health < 0) user.health = 0
const mensaje = `✿ ${evento.mensaje} *${monedas.toLocaleString()} ${currency}*`
await conn.reply(m.chat, mensaje, m)
}

handler.help = ['minar']
handler.tags = ['economy']
handler.command = ['minar', 'miming', 'mine']
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
const eventos = [
{ tipo: 'victoria', mensaje: 'كشفت عرق دهب بين صخور متزحزحة وقدرت تستخرجه بنجاح، كسبت.' },
{ tipo: 'victoria', mensaje: 'لقيت غرفة سرية فيها جواهر مدفونة لقرون. كسبت.' },
{ tipo: 'victoria', mensaje: 'قابلت عامل منجم كبير شاركك أدوات ومعرفة غالية، كسبت.' },
{ tipo: 'victoria', mensaje: 'حفرت نفق منسي ولقيت صندوق معادن نادرة، كسبت.' },
{ tipo: 'victoria', mensaje: 'لقيت كهف منوّر بكريستالات طبيعية بتكشف كنز مخفي. كسبت.' },
{ tipo: 'victoria', mensaje: 'جولم حجر سمحلك تدخل غرفة زمرد بعد ما حلّيت لغزه، كسبت.' },
{ tipo: 'victoria', mensaje: 'اشتغلت مع مستكشفين تانيين وشاركوك أرباح نبع سحري، كسبت.' },
{ tipo: 'victoria', mensaje: 'بعد ساعات حفر لقيت غرفة مقفولة مليانة أحجار قمرية، كسبت.' },
{ tipo: 'victoria', mensaje: 'الفأس خبط سطح معدني: كان صندوق عملات قديمة غالية، كسبت.' },
{ tipo: 'victoria', mensaje: 'مشيت على خريطة متهالكة ولقيت تجويف مليان ياقوت، كسبت.' },
{ tipo: 'derrota', mensaje: 'أدواتك اتكسرت قبل ما تكتشف عرق غالي. سحبت بإيدك فاضية، خسرت.' },
{ tipo: 'derrota', mensaje: 'انفجار غاز فاجأك وخلاك تخسر جزء من الغنيمة وانت بتهرب، خسرت.' },
{ tipo: 'derrota', mensaje: 'الكهف انهار جزئيًا ومعادنك اتدفنت، خسرت.' },
{ tipo: 'derrota', mensaje: 'خفافيش عمياء هجمت عليك وطلعت مصاب من غير ما تكمّل الجمع. خسرت.' },
{ tipo: 'derrota', mensaje: 'فخ قديم اشتغل وبوّظ شنطتك وضيّعت جواهر، خسرت.' }
]