let handler = async (m, { conn }) => {
    let mentioned = await m.mentionedJid
    let user = mentioned.length > 0
        ? mentioned[0]
        : (m.quoted ? m.quoted.sender : false)

    if (!user) {
        return conn.reply(
            m.chat,
            '《✧》 Debes mencionar o responder al usuario.',
            m
        )
    }

    let data = global.db.data.users[user]

    if (!data?.warnHistory?.length) {
        return conn.reply(
            m.chat,
            '❏ Sin historial de advertencias.',
            m
        )
    }

    let txt = `📋 Historial de @${user.split('@')[0]}\n\n`

    for (let w of data.warnHistory) {
        txt += `➥ Moderador: @${w.by.split('@')[0]}\n`
        txt += `➥ Fecha: ${w.date}\n`
        txt += `➥ Razón: ${w.reason}\n\n`
    }

    await conn.reply(
        m.chat,
        txt.trim(),
        m,
        {
            mentions: [
                user,
                ...data.warnHistory.map(v => v.by)
            ]
        }
    )
}

handler.help = ['warnhistory']
handler.tags = ['grupo']
handler.command = ['warnhistory']
handler.group = true
handler.admin = true

export default handler