import { getUser, ensureUser } from '../lib/userdb.js'
import { getBotConfig } from '../lib/botconfig.js'
let handler = async (m, { conn, command, usedPrefix }) => {
const currency = getBotConfig(conn, 'currency')
if (!global.db.data.chats[m.chat].economy && m.isGroup) {
return m.reply(`《✦》أوامر *الاقتصاد* متقفلة في الجروب ده.\n\n*المشرف* يقدر يفتحها بالأمر:\n`)
}
let user = getUser(global.db.data.users, m.sender)
if (!user) user = ensureUser(global.db.data.users, m.sender, { health: 100, coin: 0, exp: 0, lastDungeon: 0 })
if (user.health < 5)
return conn.reply(m.chat, `✿ صحتك مش كفاية عشان ترجع *الزنزانة*.\n> استخدم *"${usedPrefix}heal"* عشان تتعالج.`, m)
const cooldown = 18 * 60 * 1000
const ahora = Date.now()
if (ahora < user.lastDungeon) {
const restante = user.lastDungeon - ahora
const wait = formatTimeMs(restante)
return conn.reply(m.chat, `✿ لازم تستنى *${wait}* عشان تستخدم *${usedPrefix + command}* تاني.`, m)
}
user.lastDungeon = ahora + cooldown
const evento = pickRandom(eventos)
let monedas, experiencia, salud
if (evento.tipo === 'victoria') {
monedas = Math.floor(Math.random() * 3001) + 12000
experiencia = Math.floor(Math.random() * 71) + 30
salud = Math.floor(Math.random() * 3) + 8
user.coin += monedas
user.exp += experiencia
user.health -= salud
} else if (evento.tipo === 'derrota') {
monedas = Math.floor(Math.random() * 2001) + 6000
experiencia = Math.floor(Math.random() * 31) + 40
salud = Math.floor(Math.random() * 3) + 8
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
const resultado = `✿ ${evento.mensaje} ${evento.tipo === 'trampa' ? '' : evento.tipo === 'victoria' ? `ganaste. *${monedas.toLocaleString()} ${currency}*` : `perdiste. *${monedas.toLocaleString()} ${currency}*`}`
await conn.reply(m.chat, resultado.trim(), m)
await global.db.write()
}

handler.tags = ['rpg']
handler.help = ['dungeon', 'mazmorra']
handler.command = ['dungeon', 'mazmorra']
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
const eventos = [
{ tipo: 'victoria', mensaje: 'غلبت حارس الأطلال وخدت الكنز القديم،' },
{ tipo: 'victoria', mensaje: 'فكّيت شفرة الرموز وخدت مكافآت مخفية،' },
{ tipo: 'victoria', mensaje: 'لقيت حكيم الزنزانة وكافأك على حكمتك،' },
{ tipo: 'victoria', mensaje: 'روح الملكة القديمة باركتك بجوهرة قوة،' },
{ tipo: 'victoria', mensaje: 'عدّيت اختبار المرايا المظلمة وخدت أداة فريدة،' },
{ tipo: 'victoria', mensaje: 'غلبت جولم من الأوبسيديان وفتحت مدخل سري،' },
{ tipo: 'victoria', mensaje: 'أنقذت مجموعة مستكشفين تايهين وكافأوك،' },
{ tipo: 'victoria', mensaje: 'فتحت باب الحساب وطلّعت كورة أزلية،' },
{ tipo: 'victoria', mensaje: 'غلبت شيطان وهمي كان بيحرس الختم المفقود،' },
{ tipo: 'victoria', mensaje: 'طهّرت المذبح الفاسد وخدت بركة قديمة،' },
{ tipo: 'derrota', mensaje: 'شبح ملعون شفط طاقتك قبل ما تهرب،' },
{ tipo: 'derrota', mensaje: 'بازيليسك فاجأك في الغرفة المخفية وهربت مصاب،' },
{ tipo: 'derrota', mensaje: 'مخلوق غريب سرق جزء من غنيمتك في الضلمة،' },
{ tipo: 'derrota', mensaje: 'فشلت في استدعاء بوابة وعلقت بين الأبعاد،' },
{ tipo: 'derrota', mensaje: 'فقدت السيطرة على أثر قديم ووقعت بسببها،' },
{ tipo: 'trampa', mensaje: 'فعّلت فخ، بس قدرت تتجنب الأذى واتعلمت حاجة جديدة.' },
{ tipo: 'trampa', mensaje: 'الأوضة غيّرت شكلها وضيّعت وقتك بتلف في دايره.' },
{ tipo: 'trampa', mensaje: 'وقعت في وهم، قوّيت عقلك بس من غير فلوس.' }
]