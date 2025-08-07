const handler = async (m, { conn, participants, isAdmin, isBotAdmin }) => {
  const texto = (m.text || '').toLowerCase().trim();
  if (texto !== 'elije') return;

  if (!m.isGroup) return conn.reply(m.chat, '🧭 *Este ritual solo puede realizarse en círculos grupales.*', m);
  if (!isAdmin) return conn.reply(m.chat, '🧙‍♂️ *Solo el oráculo puede invocar la elección.*', m);
  if (!isBotAdmin) return conn.reply(m.chat, '⚠️ *Necesito ser administrador para ejecutar el destino.*', m);

  const elegibles = participants
    .filter(p => !p.admin && p.id !== conn.user.jid)
    .map(p => p.id);

  if (elegibles.length === 0) return conn.reply(m.chat, '🕊️ *No hay almas disponibles para el sacrificio.*', m);

  const elegido = elegibles[Math.floor(Math.random() * elegibles.length)];
  const nombre = '@' + elegido.split('@')[0];

  const fases = [
    '🌑 *El altar ha sido preparado...*',
    '📜 *Las runas giran, el destino se revela...*',
    `🔮 *El elegido ha sido marcado: ${nombre}*`,
    '🩸 *Que comience el sacrificio...*'
  ];

  for (const frase of fases) {
    await conn.sendMessage(m.chat, { text: frase, mentions: [elegido] }, { quoted: m });
    await new Promise(r => setTimeout(r, 1000));
  }

  try {
    await conn.groupParticipantsUpdate(m.chat, [elegido], 'remove');
    await conn.sendMessage(m.chat, {
      text: `⚰️ *${nombre} ha sido ofrecido al vacío. El equilibrio ha sido restaurado.*`,
      mentions: [elegido]
    }, { quoted: m });
  } catch {
    await conn.sendMessage(m.chat, {
      text: `⚠️ *${nombre} resistió el destino. El ritual ha fallado... por ahora.*`,
      mentions: [elegido]
    }, { quoted: m });
  }
};

handler.customPrefix = /^elije$/i;
handler.command = new RegExp();
handler.group = true;
handler.admin = true;
handler.botAdmin = true;
handler.tags = ['grupo'];
handler.help = ['elije'];

export default handler;