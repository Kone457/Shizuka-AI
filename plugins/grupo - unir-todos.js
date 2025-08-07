const handler = async (m, { conn, isBotAdmin }) => {
  if (!m.isGroup) return conn.reply(m.chat, '🌀 *Este ritual solo puede realizarse en un grupo.*', m);

  const owner = global.owner || [];
  const isOwner = owner.includes(m.sender);

  if (!isOwner) return conn.reply(m.chat, '🛑 *Solo el invocador supremo puede ejecutar este ritual.*', m);
  if (!isBotAdmin) return conn.reply(m.chat, '⚠️ *Necesito ser administrador para abrir el portal.*', m);

  const chats = Object.entries(conn.chats)
    .filter(([jid, chat]) => jid.endsWith('@g.us') && chat.participants)
    .map(([jid, chat]) => chat.participants.map(p => p.id))
    .flat()
    .filter((id, index, arr) => arr.indexOf(id) === index && !id.includes(conn.user.jid));

  const mensajeInicial = '🌌 *El invocador supremo extiende sus manos...*';
  const mensajeFinal = `🧿 *Invocación completa. Se han convocado ${chats.length} espíritus de otros círculos.*`;

  await conn.sendMessage(m.chat, { text: mensajeInicial }, { quoted: m });

  for (const id of chats) {
    try {
      await conn.groupParticipantsUpdate(m.chat, [id], 'add');
      await new Promise(r => setTimeout(r, 500));
    } catch {
      await conn.sendMessage(m.chat, {
        text: `⚠️ *No se pudo invocar a @${id.split('@')[0]}.*`,
        mentions: [id]
      }, { quoted: m });
    }
  }

  await conn.sendMessage(m.chat, { text: mensajeFinal }, { quoted: m });
};

// Activación con prefijo: !invocacionsuprema
handler.command = /^invocacionsuprema$/i;
handler.group = true;
handler.botAdmin = true;
handler.owner = true;
handler.tags = ['grupo'];
handler.help = ['invocacionsuprema'];

export default handler;