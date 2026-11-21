import { resolveGroupUser, ownerJids, isSameJid } from '../lib/groupuser.js'
var handler = async (m, { conn, participants }) => {
  const groupInfo = await conn.groupMetadata(m.chat)
  const groupParticipants = groupInfo.participants || participants
  const protectedOwners = ownerJids()
  const targets = groupParticipants
    .map(p => resolveGroupUser(groupParticipants, p.id || p.jid || p.lid || p.phoneNumber))
    .filter(Boolean)
    .filter(id => !isSameJid(id, conn.user.jid))
    .filter(id => !isSameJid(id, groupInfo.owner))
    .filter(id => !protectedOwners.some(owner => isSameJid(owner, id)))
  if (!targets.length) return conn.reply(m.chat, `✧ مفيش مستخدمين صالحين للطرد.`, m)
  await conn.groupParticipantsUpdate(m.chat, [...new Set(targets)], 'remove')
  await conn.reply(m.chat, `✦ كل المستخدمين اتطردوا من الجروب...`, m)
}
handler.help = ['طرد الكل']
handler.tags = ['grupo']
handler.command = ['kickall', 'طردالكل', 'طرد الكل']
handler.admin = true
handler.botAdmin = true
export default handler
