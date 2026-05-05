import fetch from 'node-fetch';

let handler = async (m, { conn }) => {
    const thumbUrl = `https://raw.githubusercontent.com/Kone457/Nexus/refs/heads/main/Anime/18a2f50ee4.jpg` 
    const thumbBuffer = await fetch(thumbUrl).then(res => res.buffer());

    let mensaje = `
╭─❏ ✿ *Creador del Bot*
┊ 👤 *Nombre:* Carlos
┊ 🌐 *Github:* github.com/Kone457
┊ 📱 *Telegram:* t.me/Carlosx200
┊ 📞 *WhatsApp:* No disponible
╰─❏ ✿`;

    await conn.sendMessage(m.chat, {
        text: mensaje,
        contextInfo: {
            externalAdReply: {
                title: "Creador del Bot",
                body: "Información de contacto",
                thumbnail: thumbBuffer,
                sourceUrl: `xvideos.com` 
            }
        }
    }, { quoted: m })
}

handler.help = ['creador']
handler.tags = ['info']
handler.command = ['creador', 'owner']
handler.owner = false

export default handler