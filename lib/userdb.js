export const normalizeUserJid = jid => {
  if (!jid) return ''
  return String(jid).split('@')[0].split(':')[0]
}
export const getUserKey = (users, jid) => {
  if (!users || !jid) return null
  if (users[jid]) return jid
  const num = normalizeUserJid(jid)
  if (!num) return null
  const direct = `${num}@s.whatsapp.net`
  if (users[direct]) return direct
  for (const key of Object.keys(users)) {
    if (normalizeUserJid(key) === num) return key
  }
  return null
}
export const getUser = (users, jid) => {
  const key = getUserKey(users, jid)
  return key ? users[key] : null
}
export const ensureUser = (users, jid, defaults = {}) => {
  const key = getUserKey(users, jid) || (String(jid).endsWith('@s.whatsapp.net') ? String(jid).split(':')[0] : `${normalizeUserJid(jid)}@s.whatsapp.net`)
  if (!users[key]) users[key] = { ...defaults }
  return users[key]
}
