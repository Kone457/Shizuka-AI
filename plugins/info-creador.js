let handler = async (m, { conn }) => {
    let mensaje = `
👥 *Equipo de รɧıʑนʞศ*

wa.me/5355699866 (Carlos)

wa.me/595975677765 (David)

🌟 *Gracias por usar la bot* 🌟
    `.trim();

    await conn.sendMessage(m.chat, {
        image: { url: 'https://ik.imagekit.io/ybi6xmp5g/Dev.png' },
        caption: mensaje
    }, { quoted: m });
}

handler.help = ['creador']
handler.tags = ['info']
handler.command = ['team', 'creador', 'owner']

export default handler