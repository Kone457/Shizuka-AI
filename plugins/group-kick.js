var handler = async (m, { conn }) => {
  let texto = Array.isArray(m.mentionedJid) ? m.mentionedJid : []
  let user = texto.length > 0 ? texto[0] : (m.quoted ? m.quoted.sender : false)
  if (!user) {
    return conn.reply(m.chat, `《✧》 *لازم تعمل منشن للمستخدم اللي عايز تطرده.*`, m)
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
    return conn.reply(m.chat, `❏ *مش تقدر تطرد نفسك.*\n> اعمل منشن لمستخدم تاني.`, m)
  }
  if (normalize(user) === normalize(conn.user.jid)) {
    return conn.reply(m.chat, `❏ *مش أقدر أطرد نفسي من الجروب.*`, m)
  }
  if (normalize(user) === normalize(ownerGroup)) {
    return conn.reply(m.chat, `❏ *مش أقدر أطرد مالك الجروب.*`, m)
  }
  if (normalize(user) === normalize(ownerBot)) {
    return conn.reply(m.chat, `❏ *مش أقدر أطرد صاحب البوت.*`, m)
  }
  if (protectedOwners.some(owner => normalize(owner) === normalize(user))) {
    return conn.reply(m.chat, `❏ *مش أقدر أطرد مطور البوت.*`, m)
  }
  if (!participant) {
    const dbUser = globalThis.db?.data?.users?.[user] || globalThis.db?.data?.users?.[`${normalize(user)}@s.whatsapp.net`]
    return conn.reply(m.chat, `✿ *المستخدم* ${dbUser?.name ||`@${normalize(user)}`} *مبقاش في الجروب.*`, m)
  }
  await conn.groupParticipantsUpdate(m.chat, [user], 'remove')
  const dbUser = globalThis.db?.data?.users?.[user] || globalThis.db?.data?.users?.[`${normalize(user)}@s.whatsapp.net`]
  await conn.reply(m.chat, `✿ *المستخدم* ${dbUser?.name ||`@${normalize(user)}`} *اتطرد من الجروب بنجاح.*\n> الباب اتقفل وراه.`, m)
}
handler.help = ['kick']
handler.tags = ['grupo']
handler.command = ['kick']
handler.admin = true
handler.botAdmin = true
export default handler