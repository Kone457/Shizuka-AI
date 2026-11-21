let handler = async (m, { conn, usedPrefix, command }) => {

if (!m.quoted) return conn.reply(m.chat, `《✧》 اعمل رد على الرسالة اللي عايز تحذفها.`, m)
try {
let delet = m.message.extendedTextMessage.contextInfo.participant
let bang = m.message.extendedTextMessage.contextInfo.stanzaId
return conn.sendMessage(m.chat, { delete: { remoteJid: m.chat, fromMe: false, id: bang, participant: delet }})
} catch {
return conn.sendMessage(m.chat, { delete: m.quoted.vM.key })
}}

handler.help = ['حذف']
handler.tags = ['group']
handler.command = ['del','delete', 'امسح', 'حذف']
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler