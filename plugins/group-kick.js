var handler = async (m, { conn }) => {
  let texto = Array.isArray(m.mentionedJid) ? m.mentionedJid : []
  let user = texto.length > 0 ? texto[0] : (m.quoted ? m.quoted.sender : false)
  if (!user) {
    return conn.reply(m.chat, `《✧》 *Debes mencionar al usuario que quieras expulsar.*`, m)
  }
  const groupInfo = await conn.groupMetadata(m.chat)
  const normalize = jid => String(jid || '').split('@')[0].split(':')[0]
  const findParticipant = jid => {
    const num = normalize(jid)
    return groupInfo.participants.find(p => {
      const ids = [p.id, p.jid, p.phoneNumber, p.lid].filter(Boolean)
      return ids.some(id => normalize(id) === num)
    })
  }
  let participant = findParticipant(user)
  if (participant) {
    if (participant.phoneNumber?.endsWith('@s.whatsapp.net')) {
      user = participant.phoneNumber.split(':')[0]
    } else if (participant.id?.endsWith('@s.whatsapp.net')) {
      user = participant.id.split(':')[0]
    } else if (participant.jid?.endsWith('@s.whatsapp.net')) {
      user = participant.jid.split(':')[0]
    }
    participant = findParticipant(user) || participant
  }
  const ownerGroup = groupInfo.owner || `${m.chat.split('-')[0]}@s.whatsapp.net`
  const ownerBot = `${globalThis.owner[0][0]}@s.whatsapp.net`
  const protectedOwners = globalThis.owner.map(o => `${o[0]}@s.whatsapp.net`)
  if (normalize(user) === normalize(m.sender)) {
    return conn.reply(m.chat, `❏ *No puedes expulsarte a ti mismo.*\n> Menciona a otro usuario.`, m)
  }
  if (normalize(user) === normalize(conn.user.jid)) {
    return conn.reply(m.chat, `❏ *No puedo autoeliminarme del grupo.*`, m)
  }
  if (normalize(user) === normalize(ownerGroup)) {
    return conn.reply(m.chat, `❏ *No puedo expulsar al propietario del grupo.*`, m)
  }
  if (normalize(user) === normalize(ownerBot)) {
    return conn.reply(m.chat, `❏ *No puedo expulsar al propietario del bot.*`, m)
  }
  if (protectedOwners.some(owner => normalize(owner) === normalize(user))) {
    return conn.reply(m.chat, `❏ *No puedo expulsar a un creador del bot.*`, m)
  }
  if (!participant) {
    const dbUser = globalThis.db?.data?.users?.[user] || globalThis.db?.data?.users?.[`${normalize(user)}@s.whatsapp.net`]
    return conn.reply(m.chat, `✿ *El usuario* ${dbUser?.name || `@${normalize(user)}`} *ya no está en el grupo.*`, m)
  }
  await conn.groupParticipantsUpdate(m.chat, [user], 'remove')
  const dbUser = globalThis.db?.data?.users?.[user] || globalThis.db?.data?.users?.[`${normalize(user)}@s.whatsapp.net`]
  await conn.reply(m.chat, `✿ *El usuario* ${dbUser?.name || `@${normalize(user)}`} *ha sido expulsado del grupo correctamente.*\n> La puerta se cerró tras su salida.`, m)
}
handler.help = ['kick']
handler.tags = ['grupo']
handler.command = ['kick']
handler.admin = true
handler.botAdmin = true
export default handler