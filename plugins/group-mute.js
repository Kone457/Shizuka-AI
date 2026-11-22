import { resolveGroupUser, findParticipant, ownerJids, isSameJid } from '../lib/groupuser.js'

const UNMUTE_CMDS = new Set(['unmute', 'desilenciar', 'فك_كتم', 'فك_الكتم'])

const save = async () => {
    try { await global.db?.write?.() } catch {}
}

let handler = async (m, { conn, text, isAdmin, isOwner, command, participants, groupMetadata }) => {
    if (!m.isGroup) return m.reply('✿ *الأمر ده للجروبات بس*')
    if (!isAdmin && !isOwner) return m.reply('✿ *المشرفين بس اللي يقدروا يستخدموا الأمر ده*')

    const info = groupMetadata || await conn.groupMetadata(m.chat)
    const members = info?.participants || participants || []

    const mentioned = m.mentionedJid?.[0] || m.quoted?.sender
    const digits = String(text || '').replace(/[^0-9]/g, '')
    const raw = mentioned || (digits.length >= 6 ? `${digits}@s.whatsapp.net` : '')
    const who = raw ? resolveGroupUser(members, raw) : null
    if (!who) return m.reply('✿ *اعمل منشن أو رد على رسالة المستخدم اللي عايز تكتمه*')

    if (!findParticipant(members, who)) return m.reply('✿ *المستخدم مش عضو في الجروب.*')

    const ownerGroup = info?.owner || `${m.chat.split('-')[0]}@s.whatsapp.net`
    const protectedJids = [conn.user?.jid, ownerGroup, ...ownerJids()]
    if (protectedJids.filter(Boolean).some(x => isSameJid(x, who))) {
        return m.reply('✿ *مش تقدر تكتم المطور أو البوت نفسه.*')
    }

    const chat = (global.db.data.chats[m.chat] ||= {})
    if (!Array.isArray(chat.mutedUsers)) chat.mutedUsers = []

    const target = who.split('@')[0]
    const isMuted = chat.mutedUsers.some(x => isSameJid(x, who))

    if (UNMUTE_CMDS.has(String(command).toLowerCase())) {
        if (!isMuted) return m.reply('✿ *المستخدم ده مش مكتوم في الجروب*')
        chat.mutedUsers = chat.mutedUsers.filter(u => !isSameJid(u, who))
        await save()
        return conn.reply(m.chat, `✿ *@${target} اتفك كتمه.*`, m, { mentions: [who] })
    }

    if (isMuted) return m.reply('✿ *المستخدم ده مكتوم بالفعل في الجروب*')
    chat.mutedUsers.push(who)
    await save()
    return conn.reply(
        m.chat,
        `✿ *@${target} اتكتم.*\n> *كل رسائله هتتحذف تلقائيًا.*\n> *لفك الكتم:* .فك_كتم @${target}`,
        m,
        { mentions: [who] }
    )
}

handler.before = async function (m, { conn, chat, isBotAdmin }) {
    if (!m.isGroup || m.fromMe || !isBotAdmin) return false
    const muted = chat?.mutedUsers
    if (!Array.isArray(muted) || !muted.length) return false
    if (!muted.some(x => isSameJid(x, m.sender))) return false
    try {
        await conn.sendMessage(m.chat, { delete: m.key })
    } catch (e) {
        console.error('mute-delete:', e?.message || e)
    }
    return true
}

handler.help = ['كتم']
handler.tags = ['grupo']
handler.command = ['mute', 'silenciar', 'unmute', 'desilenciar', 'كتم', 'فك_كتم', 'فك_الكتم']
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler
