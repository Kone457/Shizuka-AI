let handler = async (m, { conn }) => {
    let user = m.mentionedJid?.[0] || m.quoted?.sender

    if (!user) {
        return conn.reply(m.chat, '《✧》Debes mencionar o responder al usuario.', m)
    }

    let users = global.db.data.users
    if (!users[user]) users[user] = {}

    users[user].warn = users[user].warn || 0

    if (users[user].warn <= 0) {
        return conn.reply(m.chat, '❏ Ese usuario no tiene advertencias.', m)
    }

    users[user].warn--

    conn.reply(
        m.chat,
        `✅ Se eliminó una advertencia a @${user.split('@')[0]}\n> ✦ Advertencias actuales: *${users[user].warn}*`,
        m,
        { mentions: [user] }
    )
}

handler.help = ['unwarn']
handler.tags = ['grupo']
handler.command = ['unwarn']
handler.group = true
handler.admin = true

export default handler