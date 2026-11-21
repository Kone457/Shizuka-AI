import { getMentionTarget, ownerJids, isSameJid } from '../lib/groupuser.js'
let handler = async (m, { conn, text, participants }) => {
    let user = getMentionTarget(m, participants)
    if (!user) return conn.reply(m.chat, '《✧》لازم تعمل منشن أو ترد على المستخدم.', m)
    let users = global.db.data.users
    let chats = global.db.data.chats
    if (!users[user]) users[user] = {}
    if (!chats[m.chat]) chats[m.chat] = {}
    users[user].warn = users[user].warn || 0
    users[user].warnHistory = users[user].warnHistory || []
    chats[m.chat].maxWarns = chats[m.chat].maxWarns || 3
    const groupInfo = await conn.groupMetadata(m.chat)
    const groupOwner = groupInfo.owner || m.chat.split('-')[0] + '@s.whatsapp.net'
    const protectedOwners = ownerJids()
    if (isSameJid(user, m.sender)) return conn.reply(m.chat, '❏ مش تقدر تنذر نفسك.', m)
    if (isSameJid(user, conn.user.jid) || isSameJid(user, groupOwner) || protectedOwners.some(x => isSameJid(x, user))) {
        return conn.reply(m.chat, '❏ مش تقدر تنذر المستخدم ده.', m)
    }
    let reason = text.replace(/@\d+/g, '').trim() || 'بدون سبب'
    users[user].warn++
    users[user].warnHistory.push({ by: m.sender, reason, date: new Date().toLocaleString('ar-EG') })
    let max = chats[m.chat].maxWarns
    if (users[user].warn >= max) {
        await conn.reply(m.chat, `⚠️ @${user.split('@')[0]} وصل *${max}/${max}* إنذارات وهيتطرد.\n\n✦ السبب: ${reason}`, m, { mentions: [user] })
        await conn.groupParticipantsUpdate(m.chat, [user], 'remove')
        users[user].warn = 0
    } else {
        await conn.reply(m.chat, `⚠️ إنذار لـ @${user.split('@')[0]}\n\n✦ السبب: ${reason}\n✦ الإنذارات: *${users[user].warn}/${max}*`, m, { mentions: [user] })
    }
}
handler.help = ['انذار']
handler.tags = ['grupo']
handler.command = ['warn', 'انذار']
handler.group = true
handler.admin = true
handler.botAdmin = true
export default handler
