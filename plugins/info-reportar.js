import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) {
        return conn.reply(m.chat, `╭─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╮
╭╼☁️ 𝐑𝐄𝐏𝐎𝐑𝐓𝐄 𝐃𝐄 𝐄𝐑𝐑𝐎𝐑 ☁️╮
┃֪࣪
├ׁ̟̇❍✎ ✖️ USO DEL COMANDO
├ׁ̟̇❍✎ ${usedPrefix + command} <mensaje>
┃֪࣪
├ׁ̟̇❍✎ Este comando sirve para reportar
├ׁ̟̇❍✎ errores o fallos del bot
╰─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╯`, m)
    }

    if (text.length < 10)
        return conn.reply(m.chat, "⚠️ El reporte debe tener mínimo 10 caracteres.", m)

    if (text.length > 1000)
        return conn.reply(m.chat, "⚠️ El reporte no puede superar los 1000 caracteres.", m)

    const payload = {
        numero: `wa.me/${m.sender.split('@')[0]}`,
        usuario: m.pushName || 'Anónimo',
        mensaje: text,
        cita: m.quoted ? m.quoted.text : null
    }

    try {
        const res = await fetch(`${api.url}/reportar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
        const json = await res.json()

        m.reply(`╭─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╮
╭╼☁️ 𝐑𝐄𝐏𝐎𝐑𝐓𝐄 𝐄𝐍𝐕𝐈𝐀𝐃𝐎 ☁️╮
┃֪࣪
├ׁ̟̇❍✎ 📨 Tu mensaje fue enviado
├ׁ̟̇❍✎ al servidor de reportes
┃֪࣪
├ׁ̟̇❍✎ ✅ Estado: ${json.status || 'OK'}
╰─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╯`)
    } catch (e) {
        m.reply("❌ Error enviando el reporte al servidor.")
    }
}

handler.help = ['reportar']
handler.tags = ['info']
handler.command = ['reporte', 'report', 'reportar', 'bug', 'error']

export default handler