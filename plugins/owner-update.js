import { execSync } from 'child_process'

var handler = async (m, { conn, text }) => {

try {

const stdout = execSync('git pull' + (m.fromMe && text ? ' ' + text : ''));
let messager = stdout.toString()

if (messager.includes('《✧》 أنا محدّث بالفعل.')) messager = '《✧》 أنا محدّث لآخر إصدار بالفعل.'

if (messager.includes('ⴵ Actualizando.')) messager = 'ⴵ بجهّز، استنى لحظة وأنا بتحدّث.\n\n' + stdout.toString()
conn.reply(m.chat, messager, m)

} catch { 
try {

const status = execSync('git status --porcelain')

if (status.length > 0) {
const conflictedFiles = status.toString().split('\n').filter(line => line.trim() !== '').map(line => {
if (line.includes('.npm/') || line.includes('.cache/') || line.includes('tmp/') || line.includes("lib/datos.json") || line.includes('database.json') || line.includes('sessions/') || line.includes('npm-debug.log')) {
return null
}
return '*→ ' + line.slice(3) + '*'}).filter(Boolean)
if (conflictedFiles.length > 0) {
const errorMessage = `❏ مش ممكن التحديث.`
await conn.reply(m.chat, errorMessage, m)
}
}
} catch (error) {
console.error(error)
let errorMessage2 = '❏ حصل خطأ غير متوقع.'
if (error.message) {
errorMessage2 += '\n❏ رسالة الخطأ:' + error.message;
}
await conn.reply(m.chat, errorMessage2, m)
}
}

}

handler.help = ['تحديث_البوت'];
handler.tags = ['owner'];
handler.command = ['update', 'actualizar', 'up', 'تحديث_البوت', 'تحديث']
handler.owner = true

export default handler