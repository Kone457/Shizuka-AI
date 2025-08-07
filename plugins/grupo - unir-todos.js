const handler = async (m, { conn, isBotAdmin }) => {
  if (!m.isGroup) return conn.reply(m.chat, '🌀 *Este ritual solo puede realizarse en un grupo.*', m);

  // Verificación robusta de owner
  const sender = m.sender.replace(/[^0-9]/g, '');
  const owners = (global.owner || []).map(o => Array.isArray(o) ? o[0] : o);
  const isOwner = owners.some(o => o.replace(/[^0-9]/g, '') === sender);

  if (!isOwner) return conn.reply(m.chat, '🛑 *Solo el invocador supremo puede ejecutar este ritual.*', m);
  if (!isBotAdmin) return conn.reply(m.chat, '⚠️ *Necesito ser administrador para abrir el portal.*', m);

  // Reunir todos los usuarios únicos de otros grupos
  const chats = Object.entries(conn.chats)
    .filter(([jid, chat]) => jid.endsWith('@g.us') && chat.participants)
    .map(([jid, chat]) => chat.participants.map(p => p.id))
    .flat()
    .filter((id, index, arr) =>
      arr.indexOf(id) === index &&
      !id.includes(conn.user.jid) &&
      !m.chat.includes(id) // evitar duplicados en el grupo actual
    );

  const mensajeInicial = '🌌 *El invocador supremo extiende sus manos...*';
  await conn.sendMessage(m.chat, { text: mensajeInicial }, { quoted: m });

  let exitosos = 0;
  let fallidos = [];

  for (const id of chats) {
    try {
      await conn.groupParticipantsUpdate(m.chat, [id], 'add');
      exitosos++;
      await new Promise(r => setTimeout(r, 500));
    } catch {
      const nombre = id.includes('@') ? '@' + id.split('@')[0] : '👤 [Desconocido]';
      fallidos.push(nombre);
      await conn.sendMessage(m.chat, {
        text: `⚠️ *No se pudo invocar a ${nombre}.*`,
        mentions: [id]
      }, { quoted: m });
    }
  }

  const mensajeFinal = `🧿 *Invocación completa.*\n\n✅ *Espíritus convocados:* ${exitosos}\n❌ *Fallos:* ${fallidos.length}`;
  await conn.sendMessage(m.chat, { text: mensajeFinal }, { quoted: m });

  if (fallidos.length > 0) {
    const listaFallidos = fallidos.join('\n');
    await conn.sendMessage(m.chat, {
      text: `📜 *Lista de espíritus que resistieron la invocación:*\n\n${listaFallidos}`,
      mentions: fallidos.map(n => n.replace('@', '') + '@s.whatsapp.net')
    }, { quoted: m });
  }
};

// Activación con prefijo: !invocacionsuprema
handler.command = /^invocacionsuprema$/i;
handler.group = true;
handler.botAdmin = true;
handler.owner = true;
handler.tags = ['grupo'];
handler.help = ['invocacionsuprema'];

export default handler;