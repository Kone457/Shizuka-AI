import { WAMessageStubType } from '@whiskeysockets/baileys'
export async function before(m, { conn, participants, groupMetadata }) {
  if (!m.messageStubType || !m.isGroup) return true
  const chat = globalThis.db.data.chats[m.chat] ||= {}
  if (!chat.welcome) return true
  const rawParameter = m.messageStubParameters?.[0]
  if (!rawParameter) return true
  const parseParameter = value => {
    if (!value) return null
    if (typeof value === 'object') return value
    if (typeof value !== 'string') return null
    try {
      const parsed = JSON.parse(value)
      if (parsed && typeof parsed === 'object') return parsed
    } catch {}
    return { id: value }
  }
  const targetData = parseParameter(rawParameter) || {}
  const targetIds = [
    targetData.id,
    targetData.jid,
    targetData.lid,
    targetData.phoneNumber,
    targetData.pn
  ].filter(Boolean).map(String)
  const rawTarget = targetIds[0] || String(rawParameter)
  const normalizeJid = value => {
    if (!value) return null
    let jid = String(value).trim()
    if (!jid) return null
    if (!jid.includes('@')) jid += '@s.whatsapp.net'
    return jid
  }
  const getNumber = value => {
    if (!value) return ''
    return String(value).split('@')[0].replace(/\D/g, '')
  }
  const sameUser = (a, b) => {
    if (!a || !b) return false
    const aa = String(a)
    const bb = String(b)
    if (aa === bb) return true
    const na = getNumber(aa)
    const nb = getNumber(bb)
    return !!na && !!nb && na === nb
  }
  const findParticipant = values => {
    const ids = values.filter(Boolean).map(String)
    return (participants || []).find(p => {
      const fields = [
        p?.id,
        p?.jid,
        p?.lid,
        p?.phoneNumber,
        p?.pn
      ].filter(Boolean)
      return fields.some(field =>
        ids.some(id => sameUser(field, id))
      )
    }) || null
  }
  const resolveJid = async (values, participant = null) => {
    const candidates = [
      ...(values || []),
      participant?.phoneNumber,
      participant?.pn,
      participant?.jid,
      participant?.id,
      participant?.lid
    ].filter(Boolean).map(String)
    for (const value of candidates) {
      if (value.endsWith('@s.whatsapp.net')) return value
    }
    for (const value of candidates) {
      if (!value.endsWith('@lid')) continue
      try {
        const pn = await conn.signalRepository?.lidMapping?.getPNForLID?.(value)
        if (typeof pn === 'string' && pn.endsWith('@s.whatsapp.net')) return pn
        if (pn?.jid?.endsWith('@s.whatsapp.net')) return pn.jid
      } catch {}
      try {
        const pn = await conn.getPnUser?.(value)
        if (typeof pn === 'string' && pn.endsWith('@s.whatsapp.net')) return pn
        if (pn?.jid?.endsWith('@s.whatsapp.net')) return pn.jid
        if (pn?.phoneNumber?.endsWith('@s.whatsapp.net')) return pn.phoneNumber
      } catch {}
    }
    for (const value of candidates) {
      try {
        const decoded = conn.decodeJid?.(value)
        if (decoded?.endsWith('@s.whatsapp.net')) return decoded
      } catch {}
    }
    for (const value of candidates) {
      const number = getNumber(value)
      if (number && number.length >= 5) return `${number}@s.whatsapp.net`
    }
    return candidates[0] || null
  }
  const participant = findParticipant(targetIds)
  const realJid = await resolveJid(targetIds, participant)
  if (!realJid) return true
  const userNumber = getNumber(realJid) || getNumber(rawTarget) || 'Usuario'
  const userKeys = [
    rawTarget,
    targetData.id,
    targetData.lid,
    targetData.phoneNumber,
    targetData.pn,
    realJid
  ].filter(Boolean)
  let userData = {}
  for (const key of userKeys) {
    if (globalThis.db.data.users?.[key]) {
      userData = globalThis.db.data.users[key]
      break
    }
  }
  let targetName =
    participant?.name ||
    participant?.notify ||
    participant?.subject ||
    userData?.name ||
    ''
  const invalidName = value => {
    if (!value) return true
    const text = String(value)
    return text.includes('@lid') ||
      text.includes('@s.whatsapp.net') ||
      /^\d+$/.test(text)
  }
  if (invalidName(targetName)) {
    try {
      const name = await conn.getName(realJid)
      if (name && !invalidName(name)) targetName = name
    } catch {}
  }
  if (invalidName(targetName) && rawTarget) {
    try {
      const name = await conn.getName(rawTarget)
      if (name && !invalidName(name)) targetName = name
    } catch {}
  }
  if (invalidName(targetName)) targetName = userNumber
  const getActor = async () => {
    const actorValues = [
      m.participant,
      m.key?.participant,
      m.messageStubParameters?.[1]
    ].filter(Boolean)
    for (const value of actorValues) {
      const parsed = parseParameter(value)
      const values = parsed
        ? [
            parsed.id,
            parsed.jid,
            parsed.lid,
            parsed.phoneNumber,
            parsed.pn
          ].filter(Boolean)
        : [value]
      const actorParticipant = findParticipant(values)
      const jid = await resolveJid(values, actorParticipant)
      if (jid) return jid
    }
    return null
  }
  const actorJid = await getActor()
  let memberCount = Array.isArray(participants) ? participants.length : 0
  if (m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_ADD) {
    memberCount++
  }
  if (
    m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_REMOVE ||
    m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_LEAVE
  ) {
    memberCount = Math.max(0, memberCount - 1)
  }
  const actionText = {
    [WAMessageStubType.GROUP_PARTICIPANT_ADD]:
      actorJid
        ? `Agregado por @${getNumber(actorJid)}`
        : 'Se unió al grupo',
    [WAMessageStubType.GROUP_PARTICIPANT_REMOVE]:
      actorJid
        ? `Eliminado por @${getNumber(actorJid)}`
        : 'Eliminado del grupo',
    [WAMessageStubType.GROUP_PARTICIPANT_LEAVE]:
      'Salió del grupo'
  }
  const format = text => {
    return String(text)
      .replace(/@user/g, `@${userNumber}`)
      .replace(/@name/g, targetName)
      .replace(/@group/g, groupMetadata?.subject || m.chat)
      .replace(/@desc/g, groupMetadata?.desc?.toString() || 'Sin descripción')
      .replace(/%users/g, String(memberCount))
      .replace(/@action/g, actionText[m.messageStubType] || '')
      .replace(/@date/g, new Date().toLocaleString())
  }
  const defaultWelcome = `
╔═══❖•°•°•°❖•°•°•°❖═══╗
🌟 𝐁𝐈𝐄𝐍𝐕𝐄𝐍𝐈𝐃𝐎 🌟
╚═══❖•°•°•°❖•°•°•°❖═══╝

👤 Usuario: @user
🏷️ Grupo: @group

📌 @action

📜 Descripción del grupo:
@desc

👥 Miembro # %users
⚠️ Lee las reglas para evitar BAN.

╔═══❖•°•°•°❖•°•°•°❖═══╗
✦ 𝐃𝐈𝐒𝐅𝐑𝐔𝐓𝐀 𝐓𝐔 𝐄𝐒𝐓𝐀𝐍𝐂𝐈𝐀 ✦
╚═══❖•°•°•°❖•°•°•°❖═══╝
`.trim()
  const defaultBye = `
╔═══❖•°•°•°❖•°•°•°❖═══╗
💔 𝐇𝐀𝐒𝐓𝐀 𝐏𝐑𝐎𝐍𝐓𝐎 💔
╚═══❖•°•°•°❖•°•°•°❖═══╝

👤 Usuario: @user
🏷️ Grupo: @group

📌 @action

😢 Esperamos que vuelvas pronto...
👥 Miembros ahora: %users

╔═══❖•°•°•°❖•°•°•°❖═══╗
✦ 𝐕𝐔𝐄𝐋𝐕𝐄 𝐂𝐔𝐀𝐍𝐃𝐎 𝐐𝐔𝐈𝐄𝐑𝐀𝐒 ✦
╚═══❖•°•°•°❖•°•°•°❖═══╝
`.trim()
  let avatarUrl = 'https://files.evogb.win/AGCG2d.jpg'
  try {
    avatarUrl = await conn.profilePictureUrl(realJid, 'image')
  } catch {
    try {
      avatarUrl = await conn.profilePictureUrl(rawTarget, 'image')
    } catch {}
  }
  const mentions = [realJid]
  if (actorJid && !mentions.some(jid => sameUser(jid, actorJid))) {
    mentions.push(actorJid)
  }
  const context = {
    contextInfo: {
      mentionedJid: mentions,
      isForwarded: true
    }
  }
  if (m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_ADD) {
    const customText = chat.sWelcome || defaultWelcome
    await conn.sendMessage(m.chat, {
      image: { url: avatarUrl },
      caption: format(customText),
      ...context
    })
    return true
  }
  if (
    m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_LEAVE ||
    m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_REMOVE
  ) {
    const customText = chat.sBye || defaultBye
    await conn.sendMessage(m.chat, {
      image: { url: avatarUrl },
      caption: format(customText),
      ...context
    })
    return true
  }
  return true
}