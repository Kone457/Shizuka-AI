let handler = async (m, { conn }) => {
    let user = m.mentionedJid?.[0] || m.quoted?.sender

    if (!user) {
        return conn.reply(m.chat, '《✧》Debes mencionar o responder al usuario.', m)
    }

    let users = global.db.data.users
    if (!users[user]) users[user] = {}

    users[user].warn = 0
    users[user].warnHistory = []

    conn.reply(
        m.chat,
        `✅ Todas las advertencias de @${user.split('@')[0]} han sido eliminadas.`,
        m,
        { mentions: [user] }
    )
}

handler.help = ['clearwarns']
handler.tags = ['grupo']
handler.command = ['clearwarns']
handler.group = true
handler.admin = true

export default handler