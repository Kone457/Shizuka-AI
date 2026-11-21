import { getUser, ensureUser } from '../lib/userdb.js'
import { getBotConfig } from '../lib/botconfig.js'
let handler = async (m, { conn, command, usedPrefix }) => {
const currency = getBotConfig(conn, 'currency')
if (!global.db.data.chats[m.chat].economy && m.isGroup) {
return m.reply(`《✦》أوامر *الاقتصاد* متقفلة في الجروب ده.\n\n*المشرف* يقدر يفتحها بالأمر:\n`)
}
let user = getUser(global.db.data.users, m.sender)
if (!user) user = ensureUser(global.db.data.users, m.sender, { coin: 0, exp: 0, health: 100, lastAdventure: 0 })
if (user.coin == null) user.coin = 0
if (user.exp == null) user.exp = 0
if (user.health == null) user.health = 100
if (user.lastAdventure == null) user.lastAdventure = 0
if (user.health < 5)
return conn.reply(m.chat, `✿ صحتك مش كفاية عشان تروح *مغامرة* تاني.\n> استخدم *"${usedPrefix}heal"* عشان تتعالج.`, m)
const cooldown = 20 * 60 * 1000
const now = Date.now()
if (now < user.lastAdventure) {
const restante = user.lastAdventure - now
const wait = formatTime(restante)
return conn.reply(m.chat, `✿ لازم تستنى *${wait}* عشان تستخدم *${usedPrefix + command}* تاني.`, m)
}
user.lastAdventure = now + cooldown
const evento = pickRandom(aventuras)
let monedas, experiencia, salud
if (evento.tipo === 'victoria') {
monedas = Math.floor(Math.random() * 3001) + 15000
experiencia = Math.floor(Math.random() * 81) + 40
salud = Math.floor(Math.random() * 6) + 10
user.coin += monedas
user.exp += experiencia
user.health -= salud
} else if (evento.tipo === 'derrota') {
monedas = Math.floor(Math.random() * 2001) + 7000
experiencia = Math.floor(Math.random() * 41) + 40
salud = Math.floor(Math.random() * 6) + 10
user.coin -= monedas
user.exp -= experiencia
user.health -= salud
if (user.coin < 0) user.coin = 0
if (user.exp < 0) user.exp = 0
} else {
experiencia = Math.floor(Math.random() * 61) + 30
user.exp += experiencia
}
if (user.health < 0) user.health = 0
const resultado = `✿ ${evento.mensaje} ${evento.tipo === 'neutro' ? '' : evento.tipo === 'victoria' ? `ganaste. *${monedas.toLocaleString()} ${currency}*` : `perdiste. *${monedas.toLocaleString()} ${currency}*`}`
await conn.reply(m.chat, resultado, m)
await global.db.write()
}

handler.tags = ['rpg']
handler.help = ['مغامرة', 'رحلة']
handler.command = ['adventure', 'aventura', 'مغامرة', 'رحلة']
handler.group = true

export default handler

function formatTime(ms) {
const totalSec = Math.ceil(ms / 1000)
const min = Math.floor((totalSec % 3600) / 60)
const sec = totalSec % 60
const txt = []
if (min > 0) txt.push(`${min} minuto${min !== 1 ? 's' : ''}`)
txt.push(`${sec} segundo${sec !== 1 ? 's' : ''}`)
return txt.join(' ')
}
function pickRandom(list) {
return list[Math.floor(Math.random() * list.length)]
}
const aventuras = [
{ tipo: 'victoria', mensaje: 'غلبت غول كان مستخبي بين شجر دراكونيا،' },
{ tipo: 'victoria', mensaje: 'بقيت بطل بطولة المصارعين في فالوريا،' },
{ tipo: 'victoria', mensaje: 'أنقذت كتاب سحري من مذبح الهمسات،' },
{ tipo: 'victoria', mensaje: 'حرّرت قرويين محبوسين في مناجم أولديران بعد ما غلبت التروولز،' },
{ tipo: 'victoria', mensaje: 'غلبت تنين صغير على جروف فلاميار،' },
{ tipo: 'victoria', mensaje: 'لقيت أثر مقدس في أطلال إسكاريا وحميته من الناهبين،' },
{ tipo: 'victoria', mensaje: 'كسبت المبارزة ضد فارس إنفاليون الفاسد،' },
{ tipo: 'victoria', mensaje: 'فتحت قلعة الظلال الحمرا الملعونة من غير خساير،' },
{ tipo: 'victoria', mensaje: 'دخلت معبد الفراغ ورجّعت كريستالة التوازن،' },
{ tipo: 'victoria', mensaje: 'حلّيت لغز المقبرة الأبدية وخدت كنز أسطوري،' },
{ tipo: 'derrota', mensaje: 'الساحر المظلم عمل عليك تعويذة وهربت وخسرت موارد،' },
{ tipo: 'derrota', mensaje: 'تهت في غابة زاركيليا وقطاع طرق هجموا عليك،' },
{ tipo: 'derrota', mensaje: 'بازيليسك خبطك وهربت مصاب من غير غنيمة،' },
{ tipo: 'derrota', mensaje: 'فشلت محاولتك تدخل برج التلج لما وقعت في فخ سحري،' },
{ tipo: 'derrota', mensaje: 'ضعت بين بوابات غابة المرايا وخلصت من غير مكافأة،' },
{ tipo: 'neutro', mensaje: 'Exploras ruinas antiguas y aprendes secretos ocultos sin hallar tesoros.' },
{ tipo: 'neutro', mensaje: 'تتبعت أثر شبح بس اختفى في الضباب.' },
{ tipo: 'neutro', mensaje: 'رافقت أميرة في صحاري ثالوريا من غير مشاكل.' }
]