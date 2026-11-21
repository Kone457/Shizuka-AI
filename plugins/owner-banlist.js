let handler = async (m, { conn }) => {
  const users = globalThis.db?.data?.users || {}
  const banned = Object.entries(users)
    .filter(([, u]) => u?.banned)
    .map(([jid]) => jid)

  if (!banned.length) return m.reply('✅ مفيش أي مستخدم محظور.')

  const shown = banned.slice(0, 30)
  const lines = shown.map((jid, i) => `├❍ ${i + 1}. +${jid.split('@')[0]}${users[jid]?.name ? ` — ${users[jid].name}` : ''}`)
  const more = banned.length > shown.length ? `\n> وفيه ${banned.length - shown.length} كمان...` : ''

  await conn.sendMessage(
    m.chat,
    {
      text: `╭─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╮
├❍ 🚫 *المحظورين:* ${banned.length}
├❍
${lines.join('\n')}
╰─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╯${more}`,
      contextInfo: { mentionedJid: shown }
    },
    { quoted: m }
  )
}

handler.help = ['المبندين']
handler.tags = ['owner']
handler.command = ['banlist', 'المبندين', 'المحظورين']
handler.owner = true

export default handler
