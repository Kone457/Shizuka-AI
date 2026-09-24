import { resolveGroupUser, findParticipant, ownerJids, isSameJid } from '../lib/groupuser.js'
let handler = async (m, { conn, text, isAdmin, isOwner, command, participants }) => {
    if (!m.isGroup) return m.reply('✿ *Este comando solo se puede usar en grupos*')
    if (!isAdmin && !isOwner) return m.reply('✿ *Solo administradores pueden usar este comando*')
    const groupInfo = await conn.groupMetadata(m.chat)
    const groupParticipants = groupInfo.participants || participants
    let raw = m.mentionedJid?.[0] || m.quoted?.sender || (text ? text.replace(/[^0-9]/g, '') + '@s.whatsapp.net' : false)
    let who = raw ? resolveGroupUser(groupParticipants, raw) : false
    if (!who) return m.reply('✿ *Etiqueta o responde al mensaje del usuario que deseas silenciar*')
    const participant = findParticipant(groupParticipants, who)
    if (!participant) return m.reply('✿ *El usuario no pertenece al grupo.*')
    const ownerGroup = groupInfo.owner || m.chat.split('-')[0] + '@s.whatsapp.net'
    const protectedOwners = ownerJids()
    if (isSameJid(who, conn.user.jid) || isSameJid(who, ownerGroup) || protectedOwners.some(x => isSameJid(x, who))) {
        return m.reply('❏ No puedes usar este comando con mi creador.')
    }
    let chat = global.db.data.chats[m.chat]
    if (!chat.mutedUsers) chat.mutedUsers = []
    if (/^(mute|silenciar)$/i.test(command)) {
        if (chat.mutedUsers.some(x => isSameJid(x, who))) return m.reply('✿ *Este usuario ya está silenciado en este grupo*')
        chat.mutedUsers.push(who)
        await conn.reply(m.chat, `✿ *@${who.split('@')[0]} ha sido silenciado.*
> *Todos sus mensajes serán eliminados automáticamente.*`, m, { mentions: [who] })
    } else {
        if (!chat.mutedUsers.some(x => isSameJid(x, who))) return m.reply('✿ *Este usuario no está silenciado en este grupo*')
        chat.mutedUsers = chat.mutedUsers.filter(u => !isSameJid(u, who))
        await conn.reply(m.chat, `✿ *@${who.split('@')[0]} ha sido desilenciado.*`, m, { mentions: [who] })
    }
}
handler.before = async function (m, { conn, chat, isBotAdmin }) {
    if (!m.isGroup || m.fromMe || !isBotAdmin) return false
    if (!chat.mutedUsers || !Array.isArray(chat.mutedUsers)) return false
    if (chat.mutedUsers.some(x => isSameJid(x, m.sender))) {
        try { await conn.sendMessage(m.chat, { delete: m.key }) } catch (e) { console.error(e) }
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
