export const normalizeJid = jid => {
    if (!jid) return ''
    if (typeof jid === 'object') jid = jid.id || jid.jid || jid.phoneNumber || jid.lid || ''
    jid = String(jid)
    return jid.split(':')[0]
}
export const normalizeNum = jid => normalizeJid(jid).split('@')[0]
export const isPnJid = jid => typeof jid === 'string' && jid.endsWith('@s.whatsapp.net')
export const participantIds = p => [p?.id, p?.jid, p?.phoneNumber, p?.lid].filter(Boolean)
export const findParticipant = (participants = [], jid) => {
    const num = normalizeNum(jid)
    if (!num) return null
    return participants.find(p => participantIds(p).some(id => normalizeNum(id) === num)) || null
}
export const resolveGroupUser = (participants = [], jid) => {
    if (!jid) return null
    const participant = findParticipant(participants, jid)
    if (!participant) return normalizeJid(jid)
    const pn = participantIds(participant).find(id => isPnJid(normalizeJid(id)))
    if (pn) return normalizeJid(pn)
    return normalizeJid(participant.id || participant.jid || participant.phoneNumber || participant.lid || jid)
}
export const ownerJids = () => (globalThis.owner || []).map(o => {
    const n = Array.isArray(o) ? o[0] : o
    const num = String(n || '').replace(/[^0-9]/g, '')
    return num ? `${num}@s.whatsapp.net` : null
}).filter(Boolean)
export const isSameJid = (a, b) => normalizeNum(a) !== '' && normalizeNum(a) === normalizeNum(b)
export const getMentionTarget = (m, participants = []) => {
    const mentioned = Array.isArray(m?.mentionedJid) ? m.mentionedJid : []
    const raw = mentioned[0] || m?.quoted?.sender || null
    return raw ? resolveGroupUser(participants, raw) : null
}
