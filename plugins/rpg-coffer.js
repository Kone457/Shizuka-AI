import { getUser } from '../lib/userdb.js'
import { getBotConfig } from '../lib/botconfig.js'
var handler = async (m, { conn, usedPrefix, command }) => {
const currency = getBotConfig(conn, 'currency')
if (!db.data.chats[m.chat].economy && m.isGroup) {
return m.reply(`《✦》أوامر *الاقتصاد* متقفلة في الجروب ده.\n\n*المشرف* يقدر يفتحها بالأمر:\n`)
}
let user = getUser(global.db.data.users, m.sender)
let now = Date.now()
let gap = 86400000
user.lastcofre = user.lastcofre || 0
user.coin = user.coin || 0
user.exp = user.exp || 0
if (now < user.lastcofre) {
let wait = formatTime(Math.floor((user.lastcofre - now) / 1000))
return conn.reply(m.chat, `✿ لازم تستنى *${wait}* عشان تستخدم *${usedPrefix + command}* تاني.`, m)
}
let reward = Math.floor(Math.random() * (60000 - 40000 + 1)) + 40000
let expGain = Math.floor(Math.random() * (111)) + 50
user.coin += reward
user.exp += expGain
user.lastcofre = now + gap
conn.reply(m.chat, `「✿」 ${pickRandom(cofres)}\n> Has recibido *${reward.toLocaleString()} ${currency}*.`, m)
}

handler.help = ['كنز']
handler.tags = ['rpg']
handler.command = ['coffer', 'cofre', 'abrircofre', 'cofreabrir', 'كنز', 'صندوق', 'صندوقي']
handler.group = true

export default handler

function formatTime(totalSec) {
const h = Math.floor(totalSec / 3600)
const m = Math.floor((totalSec % 3600) / 60)
const s = totalSec % 60
const txt = []
if (h > 0) txt.push(`${h} hora${h !== 1 ? 's' : ''}`)
if (m > 0 || h > 0) txt.push(`${m} minuto${m !== 1 ? 's' : ''}`)
txt.push(`${s} segundo${s !== 1 ? 's' : ''}`)
return txt.join(' ')
}
function pickRandom(list) {
return list[Math.floor(Math.random() * list.length)]
}
const cofres = [
"لقيت صندوق قديم في سفينة غرقانة.",
"كشفت صندوق منقوش بنقوش معقدة في جزيرة مهجورة.",
"صادفت صندوق سحري بيتفتح بكلمة سرية.",
"لقيت صندوق خشب متهالك مليان عملات دهب.",
"طلّعت صندوق مغطى بنبات متسلق في غابة كثيفة.",
"دخلت كهف ولقيت صندوق مليان جواهر لامعة.",
"ظهر صندوق غامض على الشاطئ مليان كنوز من زمن تاني.",
"كشفت صندوق مخبّي ورا شلال مليان أحجار كريمة.",
"صادفت صندوق مسحور بيحفظ حكايات مغامرين قدام.",
"لقيت صندوق حديد مطروق بيحرسه تنين عجوز.",
"طلّعت صندوق من مقبرة قديمة فيه آثار مقدسة.",
"لقيت صندوق لما فتحته طلّع سحابة تراب دهبي.",
"لقيت صندوق في قاع بحيرة مغطى طحالب وأسرار.",
"صادفت صندوق بينوّر نور سحري في الضلمة.",
"كشفت صندوق كريستال محفور مليان أدوات قوة.",
"لقيت صندوق في دور متهالك مليان جوابات وذكريات.",
"دخلت قلعة ولقيت صندوق مليان أسلحة قديمة.",
"طلّعت صندوق من ساحة معركة فيه كنوز محاربين سقطوا.",
"صادفت صندوق بيتفتح بس لما تحل لغز.",
"لقيت صندوق خشب نفيس مليان جواهر من حضارات ضاعت."
]