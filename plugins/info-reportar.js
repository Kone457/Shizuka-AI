let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) {
        return conn.reply(
            m.chat,
            `✖️ *USO DEL COMANDO ${usedPrefix + command}* ✖️

📌 Este comando sirve para reportar errores o fallos del bot.

✅ Ejemplo:
${usedPrefix + command} El comando .menu no funciona correctamente

⚠️ Reglas:
• Mínimo 10 caracteres en el reporte.
• Máximo 1000 caracteres.
• Informes falsos pueden ocasionar *baneo*.

🌐 Mantén la comunidad segura y justa 🌐`,
            m
        )
    }

    if (text.length < 10) return conn.reply(m.chat, `${emoji} Especifique bien el error, mínimo 10 caracteres.`, m)
    if (text.length > 1000) return conn.reply(m.chat, `${emoji2} *Máximo 1000 caracteres para enviar el error.*`, m)

    const teks = `*✖️ \`R E P O R T E\` ✖️*

☁️ Número:
• Wa.me/${m.sender.split`@`[0]}

👤 Usuario: 
• ${m.pushName || 'Anónimo'}

💬 Mensaje:
• ${text}`

    await conn.reply(
        '5355699866@s.whatsapp.net',
        m.quoted ? teks + m.quoted.text : teks,
        m,
        { mentions: conn.parseMention(teks) }
    )

    m.reply(`━━━━━━━━━━━━━━━
✖️ *R E P O R T E  E N V I A D O* ✖️
━━━━━━━━━━━━━━━

📨 Tu mensaje llegó a mi creador.  
⚠️ Aviso: *informes falsos* → *baneo*.  

🌐 Mantén la comunidad segura y justa 🌐
━━━━━━━━━━━━━━━`)
}

handler.help = ['reportar']
handler.tags = ['info']
handler.command = ['reporte', 'report', 'reportar', 'bug', 'error']

export default handler