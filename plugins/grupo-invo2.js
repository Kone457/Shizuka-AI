const handler = async (m, { conn, participants, isAdmin, isBotAdmin }) => {
  const texto = (m.text || '').toLowerCase().trim();
  if (texto !== 'ritual de invocación') return;

  if (!m.isGroup) return conn.reply(m.chat, '🌀 *Este ritual solo puede realizarse en círculos grupales.*', m);
  if (!isAdmin) return conn.reply(m.chat, '🔮 *Solo el chamán puede iniciar el ritual.*', m);

  const menciones = participants.map(p => p.id).filter(id => id !== conn.user.jid);
  await conn.sendMessage(m.chat, {
    text: '🌑 *El círculo se forma. Las sombras se agitan...*',
    mentions: menciones
  }, { quoted: m });

  await new Promise(r => setTimeout(r, 1000));
  await conn.sendMessage(m.chat, {
    text: '🗣️ *¡Todos los espíritus, respondan al llamado!*',
    mentions: menciones
  }, { quoted: m });
};

handler.customPrefix = /^ritual\s+de\s+invocaci[oó]n$/i;
handler.command = new RegExp();
handler.group = true;
handler.admin = true;
handler.tags = ['grupo'];
handler.help = ['ritual de invocación'];

export default handler;