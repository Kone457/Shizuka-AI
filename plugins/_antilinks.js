const linkRegex = /(chat\.whatsapp\.com\/[0-9A-Za-z]{20,24})|(z?https:\/\/whatsapp\.com\/channel\/[0-9A-Za-z]{20,24})/i
const allowedLinks = ['https://whatsapp.com/channel/0029VbAVMtj2f3EFmXmrzt0v']

export async function before(m, { conn, isAdmin, isBotAdmin, isModeration }) {
if (!m.isGroup) return

const chat = globalThis?.db?.data?.chats[m.chat]
const [command] = m.text.split(' ')
const isGroupLink = linkRegex.test(m.text)

const hasAllowedLink = allowedLinks.some(link => m.text.includes(link))
if (hasAllowedLink) return

if (chat.antilinks && isGroupLink && !isAdmin && isBotAdmin && !isModeration && m.key.participant !== botId) {
await conn.sendMessage(m.chat, { delete: { remoteJid: m.chat, fromMe: false, id: m.key.id, participant: m.key.participant }})
await conn.reply(m.chat, `*${globalThis.db.data.users[m.key.participant].name}* eliminado por \`Anti-Link\``, m)
await conn.groupParticipantsUpdate(m.chat, [m.key.participant], 'remove')
}}