let handler = async (m, { conn, participants }) => {
    let text = '╭━━〔 ⚠️ WARN LIST ⚠️ 〕━━⬣\n'
    let found = false

    for (let p of participants) {
        let u = global.db.data.users[p.id]
        if (u?.warn > 0) {
            found = true
            text += `┃ @${p.id.split('@')[0]} - ${u.warn} warns\n`
        }
    }

    text += '╰━━━━━━━━━━━━━━━━⬣'

    if (!found) {
        return conn.reply(m.chat, '✅ No hay usuarios con advertencias.', m)
    }

    conn.reply(
        m.chat,
        text,
        m,
        { mentions: participants.map(v => v.id) }
    )
}

handler.help = ['warnlist']
handler.tags = ['grupo']
handler.command = ['warnlist']
handler.group = true
handler.admin = true

export default handler