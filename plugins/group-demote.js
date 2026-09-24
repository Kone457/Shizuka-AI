import { resolveGroupUser, findParticipant, ownerJids, isSameJid } from '../lib/groupuser.js'
const handler = async (m, { conn, command, participants }) => {
  try {
    let who = resolveGroupUser(participants, m.mentionedJid?.[0] || m.msg?.contextInfo?.mentionedJid?.[0] || m.quoted?.sender)
    if (!who) return conn.sendMessage(m.chat, { react: { text: '⚠️', key: m.key } })
    const groupMetadata = await conn.groupMetadata(m.chat)
    const groupParticipants = groupMetadata.participants || participants
    const participant = findParticipant(groupParticipants, who)
    if (!participant) return conn.sendMessage(m.chat, { react: { text: '⚠️', key: m.key } })
    who = resolveGroupUser(groupParticipants, who)
    const isPromote = command === 'promote'
    const protectedOwners = ownerJids()
    if (isPromote) {
      if (participant.admin) return conn.sendMessage(m.chat, { react: { text: '⚠️', key: m.key } })
      await conn.groupParticipantsUpdate(m.chat, [who], 'promote')
      return conn.sendMessage(m.chat, { react: { text: '👍', key: m.key } })
    }
    if (protectedOwners.some(x => isSameJid(x, who)) || isSameJid(who, groupMetadata.owner) || isSameJid(who, conn.user.jid)) {
      return conn.sendMessage(m.chat, { react: { text: '⛔', key: m.key } })
    }
    if (!participant.admin) return conn.sendMessage(m.chat, { react: { text: '⚠️', key: m.key } })
    await conn.groupParticipantsUpdate(m.chat, [who], 'demote')
    return conn.sendMessage(m.chat, { react: { text: '👍', key: m.key } })
  } catch {
    conn.sendMessage(m.chat, { react: { text: '⛔', key: m.key } })
  }
}
handler.help = ['promote', 'demote']
handler.tags = ['grupo']
handler.command = ['promote', 'demote']
handler.admin = true
handler.botAdmin = true
export default handler
