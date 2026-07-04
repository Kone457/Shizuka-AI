let handler = async (m, { conn, text }) => {
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

    let users = global.db.data.users
    let chats = global.db.data.chats

    if (!users[user]) users[user] = {}
    if (!chats[m.chat]) chats[m.chat] = {}

    users[user].warn = users[user].warn || 0
    users[user].warnHistory = users[user].warnHistory || []

    chats[m.chat].maxWarns = chats[m.chat].maxWarns || 3

    const groupInfo = await conn.groupMetadata(m.chat)
    const ownerGroup = groupInfo.owner || m.chat.split('-')[0] + '@s.whatsapp.net'
    const ownerBot = global.owner[0][0] + '@s.whatsapp.net'

    if (user === m.sender) {
        return conn.reply(
            m.chat,
            '❏ No puedes advertirte a ti mismo.',
            m
        )
    }

    if (user === conn.user.jid || user === ownerGroup || user === ownerBot) {
        return conn.reply(
            m.chat,
            '❏ No puedes advertir a ese usuario.',
            m
        )
    }

    let reason = text.replace(/@\d+/g, '').trim() || 'Sin razón'

    users[user].warn++

    users[user].warnHistory.push({
        by: m.sender,
        reason,
        date: new Date().toLocaleString('es-ES')
    })

    let max = chats[m.chat].maxWarns

    if (users[user].warn >= max) {
        await conn.reply(
            m.chat,
            `⚠️ @${user.split('@')[0]} alcanzó *${max}/${max}* advertencias y será expulsado.\n\n✦ Razón: ${reason}`,
            m,
            { mentions: [user] }
        )

        await conn.groupParticipantsUpdate(m.chat, [user], 'remove')
        users[user].warn = 0
    } else {
        await conn.reply(
            m.chat,
            `⚠️ Advertencia para @${user.split('@')[0]}\n\n✦ Razón: ${reason}\n✦ Advertencias: *${users[user].warn}/${max}*`,
            m,
            { mentions: [user] }
        )
    }
}

handler.help = ['warn']
handler.tags = ['grupo']
handler.command = ['warn']
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler