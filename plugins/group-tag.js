import { generateWAMessageFromContent } from '@whiskeysockets/baileys'
import { resolveGroupUser } from '../lib/groupuser.js'
var handler = async (m, { conn, text, participants }) => {
if (!m.quoted && !text) return conn.reply(m.chat, `《✧》 Por favor, ingresa un texto o cita un mensaje.`, m)
try {
let users = [...new Set(participants.map(u => resolveGroupUser(participants, u.id || u.jid || u.lid || u.phoneNumber)).filter(Boolean))]
let q = m.quoted ? m.quoted : m || m.text || m.sender
let c = m.quoted ? await m.getQuotedObj() : m.msg || m.text || m.sender
let msg = conn.cMod(m.chat, generateWAMessageFromContent(m.chat, { [m.quoted ? q.mtype : 'extendedTextMessage']: m.quoted ? c.message[q.mtype] : { text: '' || c }}, { quoted: null, userJid: conn.user.id }), text || q.text, conn.user.jid, { mentions: users })
await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
} catch {
let users = [...new Set(participants.map(u => resolveGroupUser(participants, u.id || u.jid || u.lid || u.phoneNumber)).filter(Boolean))]
let quoted = m.quoted ? m.quoted : m
let mime = (quoted.msg || quoted).mimetype || ''
let isMedia = /image|video|sticker|audio/.test(mime)
let htextos = `${text ? text : ''}`
if ((isMedia && quoted.mtype === 'imageMessage') && htextos) {
var mediax = await quoted.download?.()
conn.sendMessage(m.chat, { image: mediax, mentions: users, caption: htextos }, { quoted: null })
} else if ((isMedia && quoted.mtype === 'videoMessage') && htextos) {
var mediax = await quoted.download?.()
conn.sendMessage(m.chat, { video: mediax, mentions: users, mimetype: 'video/mp4', caption: htextos }, { quoted: null })
} else if ((isMedia && quoted.mtype === 'audioMessage') && htextos) {
var mediax = await quoted.download?.()
conn.sendMessage(m.chat, { audio: mediax, mentions: users, mimetype: 'audio/mp4', fileName: `Hidetag.mp3` }, { quoted: null })
} else if ((isMedia && quoted.mtype === 'stickerMessage') && htextos) {
var mediax = await quoted.download?.()
conn.sendMessage(m.chat, { sticker: mediax, mentions: users }, { quoted: null })
} else {
await conn.reply(m.chat, htextos, null, { mentions: users })
}}}
handler.help = ['hidetag', 'tag']
handler.tags = ['grupo']
handler.command = ['hidetag', 'tag', 'n']
handler.admin = true
export default handler
