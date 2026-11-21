import { getUser, ensureUser } from '../lib/userdb.js'
import { getBotConfig } from '../lib/botconfig.js'
let handler = async (m, { conn, command, usedPrefix }) => {
const currency = getBotConfig(conn, 'currency')
if (!global.db.data.chats[m.chat].economy && m.isGroup) {
return m.reply(`《✦》أوامر *الاقتصاد* متقفلة في الجروب ده.\n\n*المشرف* يقدر يفتحها بالأمر:\n`)
}
let user = getUser(global.db.data.users, m.sender)
if (!user) user = ensureUser(global.db.data.users, m.sender, { coin: 0, exp: 0, lastFish: 0 })
const cooldown = 12 * 60 * 1000
const ahora = Date.now()
if (ahora < user.lastFish) {
const restante = user.lastFish - ahora
const wait = formatTimeMs(restante)
return conn.reply(m.chat, `✿ لازم تستنى *${wait}* عشان تستخدم *${usedPrefix + command}* تاني.`, m)
}
user.lastFish = ahora + cooldown
const evento = pickRandom(eventos)
let monedas, experiencia
if (evento.tipo === 'victoria') {
monedas = Math.floor(Math.random() * 2001) + 11000
experiencia = Math.floor(Math.random() * 61) + 30
user.coin += monedas
user.exp += experiencia
} else {
monedas = Math.floor(Math.random() * 2001) + 5000
experiencia = Math.floor(Math.random() * 31) + 30
user.coin -= monedas
user.exp -= experiencia
if (user.exp < 0) user.exp = 0
if (user.coin < 0) user.coin = 0
}
const resultado = `❀ ${evento.mensaje} *${monedas.toLocaleString()} ${currency}*`
await conn.reply(m.chat, resultado, m)
await global.db.write()
}

handler.tags = ['rpg']
handler.help = ['صيد']
handler.command = ['pescar', 'fish', 'صيد', 'صيد_سمك']
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
{ tipo: 'victoria', mensaje: 'صطدت سلمون! طعمه تحفة، كسبت.' },
{ tipo: 'victoria', mensaje: 'صطدت تروتة! طازة جدًا، كسبت.' },
{ tipo: 'victoria', mensaje: 'مسكت قرش! كانت معركة جامدة، كسبت.' },
{ tipo: 'victoria', mensaje: 'جامد! صطدت حوت. تجربة مش هتتكرر، كسبت.' },
{ tipo: 'victoria', mensaje: 'مسكت سمكة مهرج! مليانة ألوان ومشاغبة، كسبت.' },
{ tipo: 'victoria', mensaje: 'مسكت ثعبان بحر دهبي! نادر وغالي، كسبت.' },
{ tipo: 'victoria', mensaje: 'صطدت هامور عملاق! التعب كان يستاهل، كسبت.' },
{ tipo: 'victoria', mensaje: 'مسكت أخطبوط حبره أزرق! شاطر بس بقى بتاعك، كسبت.' },
{ tipo: 'victoria', mensaje: 'طلّعت كارب ملكي! وزنه مبهر، كسبت.' },
{ tipo: 'victoria', mensaje: 'جبت سمكة تنين! مخلوق أسطوري، كسبت.' },
{ tipo: 'derrota', mensaje: 'طلّعت زبالة: كيس بلاستيك، خسرت.' },
{ tipo: 'derrota', mensaje: 'طلّعت زبالة: علبة قديمة، خسرت.' },
{ tipo: 'derrota', mensaje: 'مصطدتش حاجة المرة دي. المية كانت هادية، خسرت.' },
{ tipo: 'derrota', mensaje: 'الخيط اتقطع وانت بتمسك حاجة ضخمة، خسرت.' },
{ tipo: 'derrota', mensaje: 'السمكة هربت أول ما طلعت على السطح، خسرت.' }
]