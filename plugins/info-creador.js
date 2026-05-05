import fetch from 'node-fetch';

let handler = async (m, { conn }) => {
    const thumbUrl = `${banner}` 
    const thumbBuffer = await fetch(thumbUrl).then(res => res.buffer());

    let mensaje = `
╭─❏ ✿ *Creador del Bot*
│
┊ 👤 *Nombre:* Carlos
┊ 🌐 *Github:* https://github.com/Kone457
┊ 📱 *Telegram:* https://t.me/Carlosx200
┊ 📞 *WhatsApp:* No disponible
│
╰─❏ ✿`;

    await conn.sendMessage(m.chat, {
        text: mensaje,
        contextInfo: {
            externalAdReply: {
                title: "Creador del Bot",
                body: "Información de contacto",
                thumbnail: thumbBuffer,
                sourceUrl: `${web}` 
            }
        }
    }, { quoted: m })
}

handler.help = ['creador']
handler.tags = ['info']
handler.command = ['creador', 'owner']
handler.owner = false

export default handler