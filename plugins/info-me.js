const show = value => {
  if (value === undefined) return 'undefined'
  if (value === null) return 'null'
  if (typeof value === 'string') return value || '(فاضي)'
  try { return JSON.stringify(value) } catch { return String(value) }
}

const phoneFromJid = jid => {
  if (typeof jid !== 'string') return 'غير متوفر'
  const clean = jid.replace(/:\d+(?=@|$)/g, '')
  if (clean.endsWith('@s.whatsapp.net')) return clean.split('@')[0]
  return 'مش رقم PN؛ يمكن LID أو معرّف تاني'
}

const findContextInfo = value => {
  if (!value || typeof value !== 'object') return null
  if (value.contextInfo?.quotedMessage) return value.contextInfo
  for (const child of Object.values(value)) {
    if (child && typeof child === 'object') {
      const found = findContextInfo(child)
      if (found) return found
    }
  }
  return null
}

const resolveLid = async (conn, jid) => {
  if (typeof jid !== 'string' || !jid.endsWith('@lid')) return null
  try {
    const result = await conn.signalRepository?.lidMapping?.getPNForLID?.(jid)
    return result || null
  } catch {
    return null
  }
}

const handler = async (m, { conn }) => {
  const key = m.key || {}
  const senderRaw = key.participant || m.participant || key.remoteJid || m.sender || ''
  const senderAlt = key.participantAlt || key.remoteJidAlt || m.senderPn || null
  const context = findContextInfo(m.message)
  const quoted = m.quoted || null
  const quotedRaw = context?.participant || quoted?.sender || null
  const quotedAlt = context?.participantAlt || null

  const senderMapped = await resolveLid(conn, senderRaw)
  const quotedMapped = await resolveLid(conn, quotedRaw)

  const lines = [
    '乂 *تشخيص الـJID*',
    '',
    '❖ *المستخدم اللي بينفّذ الأمر*',
    `• m.sender: ${show(m.sender)}`,
    `• m.key.participant: ${show(key.participant)}`,
    `• m.participant: ${show(m.participant)}`,
    `• m.key.remoteJid: ${show(key.remoteJid)}`,
    `• m.key.participantAlt: ${show(key.participantAlt)}`,
    `• m.key.remoteJidAlt: ${show(key.remoteJidAlt)}`,
    `• m.senderPn: ${show(m.senderPn)}`,
    `• m.senderLid: ${show(m.senderLid)}`,
    `• Identificador principal: ${show(senderRaw)}`,
    `• Identificador alternativo: ${show(senderAlt)}`,
    `• رقم PN اللي اتحدد: ${phoneFromJid(senderAlt || senderRaw)}`,
    `• PN resuelto desde LID: ${show(senderMapped)}`,
    '',
    '❖ *الرسالة المردود عليها*',
    `• ردّ على حد؟: ${context?.quotedMessage || quoted ? 'نعم' : 'لا'}`,
    `• m.quoted.sender: ${show(quoted?.sender)}`,
    `• contextInfo.participant: ${show(context?.participant)}`,
    `• contextInfo.participantAlt: ${show(context?.participantAlt)}`,
    `• contextInfo.remoteJid: ${show(context?.remoteJid)}`,
    `• contextInfo.stanzaId: ${show(context?.stanzaId)}`,
    `• Identificador citado: ${show(quotedRaw)}`,
    `• رقم PN المذكور: ${phoneFromJid(quotedAlt || quotedRaw)}`,
    `• PN citado resuelto desde LID: ${show(quotedMapped)}`,
    '',
    '❖ *CONTEXTO*',
    `• m.chat: ${show(m.chat)}`,
    `• m.isGroup: ${show(m.isGroup)}`,
    `• m.key.fromMe: ${show(key.fromMe)}`,
    `• m.key.addressingMode: ${show(key.addressingMode)}`
  ]

  await conn.sendMessage(m.chat, { text: lines.join('\n') }, { quoted: m })
}

handler.help = ['me']
handler.tags = ['info']
handler.command = ['me']

export default handler
