import { resolveGroupUser, findParticipant, ownerJids, isSameJid } from '../lib/groupuser.js'
let handler = async (m, { conn, text, isAdmin, isOwner, command, participants }) => {
    if (!m.isGroup) return m.reply('✿ *الأمر ده للجروبات بس*')
    if (!isAdmin && !isOwner) return m.reply('✿ *المشرفين بس اللي يقدروا يستخدموا الأمر ده*')
    const groupInfo = await conn.groupMetadata(m.chat)
    const groupParticipants = groupInfo.participants || participants
    let raw = m.mentionedJid?.[0] || m.quoted?.sender || (text ? text.replace(/[^0-9]/g, '') + '@s.whatsapp.net' : false)
    let who = raw ? resolveGroupUser(groupParticipants, raw) : false
    if (!who) return m.reply('✿ *اعمل منشن أو رد على رسالة المستخدم اللي عايز تكتمه*')
    const participant = findParticipant(groupParticipants, who)
    if (!participant) return m.reply('✿ *المستخدم مش عضو في الجروب.*')
    const ownerGroup = groupInfo.owner || m.chat.split('-')[0] + '@s.whatsapp.net'
    const protectedOwners = ownerJids()
    if (isSameJid(who, conn.user.jid) || isSameJid(who, ownerGroup) || protectedOwners.some(x => isSameJid(x, who))) {
        return m.reply('❏ مش تقدر تستخدم الأمر ده مع مطوري.')
    }
    let chat = global.db.data.chats[m.chat]
    if (!chat.mutedUsers) chat.mutedUsers = []
    if (/^(mute|silenciar)$/i.test(command)) {
        if (chat.mutedUsers.some(x => isSameJid(x, who))) return m.reply('✿ *المستخدم ده مكتوم بالفعل في الجروب*')
        chat.mutedUsers.push(who)
        await conn.reply(m.chat, `✿ *@${who.split('@')[0]} اتكتم.*\n> *كل رسائله هتتحذف تلقائيًا.*`, m, { mentions: [who] })
    } else {
        if (!chat.mutedUsers.some(x => isSameJid(x, who))) return m.reply('✿ *المستخدم ده مش مكتوم في الجروب*')
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
