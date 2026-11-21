let handler = async (m, { conn, args }) => {
    let num = parseInt(args[0])

    if (!num || num < 1) {
        return conn.reply(m.chat, '《✧》Usa: #setwarns 5', m)
    }

    let chats = global.db.data.chats
    if (!chats[m.chat]) chats[m.chat] = {}

    chats[m.chat].maxWarns = num

    conn.reply(
        m.chat,
        `✅ حد الإنذارات اتظبط على *${num}*.`,
        m
    )
}

handler.help = ['حد الانذارات']
handler.tags = ['grupo']
handler.command = ['setwarns', 'حدالانذار', 'حد الانذارات']
handler.group = true
handler.admin = true

export default handler