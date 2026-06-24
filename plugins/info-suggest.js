import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) {
        return conn.reply(
            m.chat,
            `╭─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╮
╭╼💡 𝐒𝐔𝐆𝐄𝐑𝐄𝐍𝐂𝐈𝐀𝐒 💡╮
┃֪࣪
├ׁ̟̇❍✎ ✖️ USO DEL COMANDO
├ׁ̟̇❍✎ ${usedPrefix + command}
┃֪࣪
├ׁ̟̇❍✎ Este comando sirve para enviar
├ׁ̟̇❍✎ sugerencias o ideas para el bot
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
├ׁ̟̇❍✎ Explica mejor tu sugerencia
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

    const teks = `╭─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╮
╭╼💡 𝐍𝐔𝐄𝐕𝐀 𝐒𝐔𝐆𝐄𝐑𝐄𝐍𝐂𝐈𝐀 💡╮
┃֪࣪
├ׁ̟̇❍✎ 📱 Número:
├ׁ̟̇❍✎ wa.me/${m.sender.split('@')[0]}
┃֪࣪
├ׁ̟̇❍✎ 👤 Usuario:
├ׁ̟̇❍✎ ${m.pushName || 'Anónimo'}
┃֪࣪
├ׁ̟̇❍✎ 💬 Sugerencia:
├ׁ̟̇❍✎ ${text}
╰─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╯`

    try {
        await fetch('https://discord.com/api/webhooks/1482041314701738066/CfeGZsaaEEzOYPWS0xFWqiN2yQqEYbpnszIB1x2Vc9GrDTN_Q2huKCdTgq2ozkyBhi0w', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                embeds: [{
                    description: teks,
                    color: 0x00AEEF
                }]
            })
        })

        m.reply(
`╭─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╮
╭╼💡 𝐒𝐔𝐆𝐄𝐑𝐄𝐍𝐂𝐈𝐀 𝐄𝐍𝐕𝐈𝐀𝐃𝐀 💡╮
┃֪࣪
├ׁ̟̇❍✎ 📨 Tu sugerencia fue enviada
├ׁ̟̇❍✎ correctamente al desarrollador
┃֪࣪
├ׁ̟̇❍✎ ✨ Gracias por ayudar
├ׁ̟̇❍✎ a mejorar el bot
╰─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╯`
        )
    } catch (e) {
        console.error(e)

        m.reply(
`╭─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╮
├ׁ̟̇❍✎ ❌ ERROR
├ׁ̟̇❍✎ No se pudo enviar
├ׁ̟̇❍✎ la sugerencia
╰─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╯`
        )
    }
}

handler.help = ['suggest', 'sugerencia']
handler.tags = ['info']
handler.command = ['suggest', 'suggestion', 'sugerencia', 'sugerir']

export default handler