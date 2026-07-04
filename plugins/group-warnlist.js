let handler = async (m, { conn }) => {
    const group = await conn.groupMetadata(m.chat)
    const participants = group.participants

    let text = '╭━━〔 ⚠️ WARN LIST ⚠️ 〕━━⬣\n'
    let mentions = []
    let found = false

    for (const p of participants) {
        const jid = p.jid || p.id
        if (!jid) continue

        const user = global.db.data.users[jid]

        if (user?.warn > 0) {
            found = true
            mentions.push(jid)
            text += `┃ @${jid.split('@')[0]} • ${user.warn} advertencia${user.warn > 1 ? 's' : ''}\n`
        }
    }

    text += '╰━━━━━━━━━━━━━━━━⬣'

    if (!found) {
        return conn.reply(
            m.chat,
            '✅ No hay usuarios con advertencias.',
            m
        )
    }

    await conn.reply(
        m.chat,
        text,
        m,
        { mentions }
    )
}

handler.help = ['warnlist']
handler.tags = ['grupo']
handler.command = ['warnlist']
handler.group = true
handler.admin = true

export default handler