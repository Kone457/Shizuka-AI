const handler = async (m, { conn, isBotAdmin }) => {
  if (!m.isGroup) return conn.reply(m.chat, '🌀 *Este ritual solo puede realizarse en un grupo.*', m);

  // Verificación robusta de owner
  const sender = m.sender.replace(/[^0-9]/g, '');
  const owners = (global.owner || []).map(o => Array.isArray(o) ? o[0] : o);
  const isOwner = owners.some(o => o.replace(/[^0-9]/g, '') === sender);

  if (!isOwner) return conn.reply(m.chat, '🛑 *Solo el invocador supremo puede ejecutar este ritual.*', m);
  if (!isBotAdmin) return conn.reply(m.chat, '⚠️ *Necesito ser administrador para abrir el portal.*', m);

  // Obtener IDs del grupo actual
  const actuales = (await conn.groupMetadata(m.chat)).participants.map(p => p.id);

  // Reunir todos los usuarios únicos de otros grupos
  const otrosUsuarios = Object.entries(conn.chats)
    .filter(([jid, chat]) => jid.endsWith('@g.us') && chat.participants)
    .flatMap(([jid, chat]) => chat.participants.map(p => p.id))
    .filter((id, index, arr) =>
      arr.indexOf(id) === index &&
      !id.includes(conn.user.jid) &&
      !actuales.includes(id)
    );

  const mensajeInicial = '🌌 *El invocador supremo extiende sus manos...*';
  await conn.sendMessage(m.chat, { text: mensajeInicial }, { quoted: m });

  let exitosos = 0;
  let fallidos = [];

  for (const id of otrosUsuarios) {
    try {
      await conn.groupParticipantsUpdate(m.chat, [id], 'add');
      exitosos++;
      await new Promise(r => setTimeout(r, 500));
    } catch {
      const nombre = id.includes('@') ? '@' + id.split('@')[0] : '👤 [Desconocido]';
      fallidos.push(nombre);
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

handler.command = /^invocacionsuprema$/i;
handler.group = true;
handler.botAdmin = true;
handler.owner = true;
handler.tags = ['grupo'];
handler.help = ['invocacionsuprema'];

export default handler;