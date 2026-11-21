let { downloadContentFromMessage } = (await import('@whiskeysockets/baileys'));

let handler = async (m, { conn }) => {
if (!m.quoted) return conn.reply(m.chat, `《✧》 رد على صورة ViewOnce.`, m)
if (!m?.quoted || !m?.quoted?.viewOnce) return conn.reply(m.chat, `《✧》 رد على صورة ViewOnce.`, m)
let buffer = await m.quoted.download(false);
if (/videoMessage/.test(m.quoted.mtype)) {
return conn.sendFile(m.chat, buffer, 'media.mp4', m.quoted.caption || '', m)
} else if (/imageMessage/.test(m.quoted.mtype)) {
return conn.sendFile(m.chat, buffer, 'media.jpg', m.quoted?.caption || '', m)
}}
handler.help = ['شوف']
handler.tags = ['tools']
handler.command = ['readviewonce', 'read', 'ver', 'مرةواحدة', 'اقرا', 'شوف'] 
handler.register = true 

export default handler