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
  if (!targets.length) return conn.reply(m.chat, `✧ No hay usuarios válidos para expulsar.`, m)
  await conn.groupParticipantsUpdate(m.chat, [...new Set(targets)], 'remove')
  await conn.reply(m.chat, `✦ Todos los usuarios han sido expulsados del grupo...`, m)
}
handler.help = ['kickall']
handler.tags = ['grupo']
handler.command = ['kickall']
handler.admin = true
handler.botAdmin = true
export default handler
