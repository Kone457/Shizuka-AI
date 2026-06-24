let handler = async (m, { conn }) => {
    let user = m.mentionedJid?.[0] || m.quoted?.sender || m.sender

    let users = global.db.data.users
    if (!users[user]) users[user] = {}

    users[user].warn = users[user].warn || 0

    conn.reply(
        m.chat,
        `📋 Advertencias de @${user.split('@')[0]}\n\n> ✦ Total: *${users[user].warn}*`,
        m,
        { mentions: [user] }
    )
}

handler.help = ['warnings']
handler.tags = ['grupo']
handler.command = ['warnings']
handler.group = true

export default handler