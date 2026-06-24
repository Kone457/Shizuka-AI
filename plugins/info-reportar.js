let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) {
        return conn.reply(
            m.chat,
            `╭─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╮
╭╼☁️ 𝐑𝐄𝐏𝐎𝐑𝐓𝐄 𝐃𝐄 𝐄𝐑𝐑𝐎𝐑 ☁️╮
┃֪࣪
├ׁ̟̇❍✎ ✖️ USO DEL COMANDO
├ׁ̟̇❍✎ ${usedPrefix + command}
┃֪࣪
├ׁ̟̇❍✎ Este comando sirve para reportar
├ׁ̟̇❍✎ errores o fallos del bot
╰─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╯`,
            m
        )
    }

    if (text.length < 10)
        return conn.reply(
            m.chat,
            `╭─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╮
├ׁ̟̇❍✎ ⚠️ ERROR
├ׁ̟̇❍✎ Mínimo 10 caracteres
├ׁ̟̇❍✎ Especifica mejor el problema
╰─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╯`,
            m
        )

    if (text.length > 1000)
        return conn.reply(
            m.chat,
            `╭─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╮
├ׁ̟̇❍✎ ⚠️ ERROR
├ׁ̟̇❍✎ Máximo 1000 caracteres
╰─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╯`,
            m
        )

    const teks = `   ╭─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╮
╭╼☁️ 𝐑𝐄𝐏𝐎𝐑𝐓𝐄 ☁️╮
┃֪࣪
├ׁ̟̇❍✎ 📱 Número:
├ׁ̟̇❍✎ wa.me/${m.sender.split('@')[0]}
┃֪࣪
├ׁ̟̇❍✎ 👤 Usuario:
├ׁ̟̇❍✎ ${m.pushName || 'Anónimo'}
┃֪࣪
├ׁ̟̇❍✎ 💬 Mensaje:
├ׁ̟̇❍✎ ${text}
╰─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╯`

    await conn.reply(
        '595987301197@s.whatsapp.net',
        m.quoted ? teks + '\n\n💭 RESPUESTA CITADA:\n' + m.quoted.text : teks,
        m,
        { mentions: conn.parseMention(teks) }
    )

    m.reply(
`  ╭─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╮
╭╼☁️ 𝐑𝐄𝐏𝐎𝐑𝐓𝐄 𝐄𝐍𝐕𝐈𝐀𝐃𝐎 ☁️╮
┃֪࣪
├ׁ̟̇❍✎ 📨 Tu mensaje fue enviado
├ׁ̟̇❍✎ al creador del bot
┃֪࣪
├ׁ̟̇❍✎ ⚠️ Evita reportes falsos
├ׁ̟̇❍✎ ❖ Podrías ser sancionado
╰─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╯`
    )
}

handler.help = ['reportar']
handler.tags = ['info']
handler.command = ['reporte', 'report', 'reportar', 'bug', 'error']

export default handler