let handler = async (m, { conn, text, isAdmin, isOwner, command }) => {
    if (!m.isGroup) return m.reply('✿ *Este comando solo se puede usar en grupos*')
    if (!isAdmin && !isOwner) return m.reply('✿ *Solo administradores pueden usar este comando*')

    let mentioned = await m.mentionedJid
    let who = mentioned.length > 0
        ? mentioned[0]
        : m.quoted
        ? m.quoted.sender
        : text
        ? text.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
        : false

    if (!who) {
        return m.reply('✿ *Etiqueta o responde al mensaje del usuario que deseas silenciar*')
    }

    let chat = global.db.data.chats[m.chat]
    if (!chat.mutedUsers) chat.mutedUsers = []

    if (/^(mute|silenciar)$/i.test(command)) {
        if (chat.mutedUsers.includes(who)) {
            return m.reply('✿ *Este usuario ya está silenciado en este grupo*')
        }

        chat.mutedUsers.push(who)

        await conn.reply(
            m.chat,
            `✿ *@${who.split('@')[0]} ha sido silenciado.*\n> *Todos sus mensajes serán eliminados automáticamente.*`,
            m,
            { mentions: [who] }
        )
    } else {
        if (!chat.mutedUsers.includes(who)) {
            return m.reply('✿ *Este usuario no está silenciado en este grupo*')
        }

        chat.mutedUsers = chat.mutedUsers.filter(u => u !== who)

        await conn.reply(
            m.chat,
            `✿ *@${who.split('@')[0]} ha sido desilenciado.*`,
            m,
            { mentions: [who] }
        )
    }
}

handler.before = async function (m, { conn, chat, isBotAdmin }) {
    if (!m.isGroup || m.fromMe) return false
    if (!isBotAdmin) return false

    if (!chat.mutedUsers || !Array.isArray(chat.mutedUsers)) return false

    if (chat.mutedUsers.includes(m.sender)) {
        try {
            await conn.sendMessage(m.chat, {
                delete: m.key
            })
        } catch (e) {
            console.error(e)
        }
        return true
    }

    return false
}

handler.help = ['mute @user', 'unmute @user']
handler.tags = ['grupo']
handler.command = /^(mute|silenciar|unmute|desilenciar)$/i
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler