import ws from 'ws'

let handler = async (m, { conn }) => {
  let results = []

  const getGroupInfo = async (c, jid) => {
    try {
      const meta = await c.groupMetadata(jid)
      const code = await c.groupInviteCode(jid)
      return {
        name: meta.subject || 'Sin nombre',
        members: meta.participants?.length || 0,
        desc: meta.desc || 'Sin descripción',
        link: `https://chat.whatsapp.com/${code}`,
        jid: jid,
        bot: c.user?.id || 'Bot'
      }
    } catch {
      return null
    }
  }

  for (const jid of Object.keys(conn.chats || {})) {
    if (!jid.endsWith('@g.us')) continue
    const info = await getGroupInfo(conn, jid)
    if (info) results.push(info)
  }

  if (global.conns && Array.isArray(global.conns)) {
    for (const sub of global.conns) {
      if (!sub?.ws?.socket || sub.ws.socket.readyState === ws.CLOSED) continue
      for (const jid of Object.keys(sub.chats || {})) {
        if (!jid.endsWith('@g.us')) continue
        const info = await getGroupInfo(sub, jid)
        if (info) results.push(info)
      }
    }
  }

  if (!results.length) return m.reply('⚠️ No se encontraron grupos.')

  let txt = `╭─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╮
🌐 GRUPOS 🌐
Total: *${results.length}*
╰─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╯\n`

  for (const g of results) {
    txt += `\n📌 *${g.name}*
👥 Miembros: ${g.members}
📝 Descripción: ${g.desc.slice(0, 100)}${g.desc.length > 100 ? '...' : ''}
🔗 Link: ${g.link}
🤖 Bot: ${g.bot}\n`
  }

  await conn.sendMessage(m.chat, { text: txt.trim() }, { quoted: m })
}

handler.tags = ['serbot']
handler.command = ['slink']

export default handler