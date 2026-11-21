import { getUser, ensureUser } from '../lib/userdb.js'
import { getBotConfig } from '../lib/botconfig.js'
let handler = async (m, { conn, usedPrefix, command }) => {
const currency = getBotConfig(conn, 'currency')
if (!global.db.data.chats[m.chat].economy && m.isGroup) {
return m.reply(`《✦》أوامر *الاقتصاد* متقفلة في الجروب ده.\n\n*المشرف* يقدر يفتحها بالأمر:\n`)
}
let user = getUser(global.db.data.users, m.sender)
if (!user) {
ensureUser(global.db.data.users, m.sender, { exp: 0, coin: 0, health: 100, lastHunt: 0 })
user = getUser(global.db.data.users, m.sender)
}
user.coin = user.coin || 0
user.exp = user.exp || 0
user.health = user.health || 100
user.lastHunt = user.lastHunt || 0  
if (user.health < 5)
return conn.reply(m.chat, `✿ صحتك مش كفاية عشان تروح *تصطاد* تاني.\n> استخدم *"${usedPrefix}heal"* عشان تتعالج.`, m)
const cooldown = 15 * 60 * 1000
const now = Date.now()
if (now < user.lastHunt) {
const restante = user.lastHunt - now
return conn.reply(m.chat, `✿ لازم تستنى *${formatTime(restante)}* عشان تستخدم *${usedPrefix + command}* تاني.`, m)
}
user.lastHunt = now + cooldown
const evento = pickRandom(eventos)
let monedas, experiencia, salud
if (evento.tipo === 'victoria') {
monedas = Math.floor(Math.random() * 10001) + 1000
experiencia = Math.floor(Math.random() * 91) + 30
salud = Math.floor(Math.random() * 5) + 3
user.coin += monedas
user.exp += experiencia
user.health -= salud
} else {
monedas = Math.floor(Math.random() * 2001) + 4000
experiencia = Math.floor(Math.random() * 41) + 30
salud = Math.floor(Math.random() * 5) + 3
user.coin -= monedas
user.exp -= experiencia
user.health -= salud
if (user.coin < 0) user.coin = 0
if (user.exp < 0) user.exp = 0
}
if (user.health < 0) user.health = 0
conn.reply(m.chat, `✿ ${evento.mensaje} *${monedas.toLocaleString()} ${currency}*`, m)
}

handler.tags = ['rpg']
handler.help = ['cazar', 'hunt']
handler.command = ['cazar', 'hunt']
handler.group = true

export default handler

function formatTime(ms) {
const totalSec = Math.ceil(ms / 1000)
const min = Math.floor((totalSec % 3600) / 60)
const sec = totalSec % 60
const parts = []
if (min > 0) parts.push(`${min} minuto${min !== 1 ? 's' : ''}`)
parts.push(`${sec} segundo${sec !== 1 ? 's' : ''}`)
return parts.join(' ')
}
function pickRandom(list) {
return list[Math.floor(Math.random() * list.length)]
}
const eventos = [
{ tipo: 'victoria', mensaje: 'بشجاعة كبيرة قدرت تصطاد دب! الصيد كان جامد بس مهارتك وصّلتك للفوز، كسبت.' },
{ tipo: 'victoria', mensaje: 'صطدت نمر شرس! بعد مطاردة مثيرة، كسبت.' },
{ tipo: 'victoria', mensaje: 'صطدت فيل بذكاء وإصرار. كان تحدي بس عملتها، كسبت.' },
{ tipo: 'victoria', mensaje: 'صطدت باندا! الصيد كان هادي بس ناجح، كسبت.' },
{ tipo: 'victoria', mensaje: 'صطدت خنزير بري بعد تتبع مثير. شغل عالي! كسبت.' },
{ tipo: 'victoria', mensaje: 'بمهارة كبيرة مسكت تمساح. إنجاز مبهر! كسبت.' },
{ tipo: 'victoria', mensaje: 'صطدت ديك! مكانتش صعبة بس برضه فوز، كسبت.' },
{ tipo: 'victoria', mensaje: 'بصبر قدرت تصطاد حصان. عاش! كسبت.' },
{ tipo: 'victoria', mensaje: 'لقيت مجموعة غزلان ومسكت أقواهم. تصويبك كان مثالي، كسبت.' },
{ tipo: 'victoria', mensaje: 'دخلت ضباب الغابة وصطدت تعلب فضي محدش قدر يمسكه، كسبت.' },
{ tipo: 'derrota', mensaje: 'الفريسة هربت ومصطدتش حاجة المرة دي، خسرت.' },
{ tipo: 'derrota', mensaje: 'اتعثرت وانت بتصوّب والفريسة هربت. تعبك راح هدر، خسرت.' },
{ tipo: 'derrota', mensaje: 'زئير شتّتك ومقدرتش تصيب الهدف، خسرت.' },
{ tipo: 'derrota', mensaje: 'قوسك اتكسر في اللحظة الحرجة. من غير سلاح، فشلت، خسرت.' },
{ tipo: 'derrota', mensaje: 'مطرة مفاجئة خرّبت طريق الصيد. رجعت من غير مكافأة، خسرت.' }
]