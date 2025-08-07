const handler = async (m, { conn, participants, isAdmin }) => {
  const texto = (m.text || '').toLowerCase().trim();
  if (texto !== 'ritual de invocación') return;

  if (!m.isGroup) return conn.reply(m.chat, '🌀 *Este ritual solo puede realizarse en círculos grupales.*', m);
  if (!isAdmin) return conn.reply(m.chat, '🔮 *Solo el chamán puede iniciar el ritual.*', m);

  const menciones = participants
    .map(p => p.id)
    .filter(id => id !== conn.user.jid);

  const nombres = menciones.map(id => '@' + id.split('@')[0]).join(', ');

  await conn.sendMessage(m.chat, {
    text: `🌑 *El círculo se forma. Las sombras se agitan...*\n\n🧙‍♂️ *El chamán extiende sus manos hacia:* ${nombres}`,
    mentions: menciones
  }, { quoted: m });

  await new Promise(r => setTimeout(r, 1000));

  await conn.sendMessage(m.chat, {
    text: `🗣️ *¡Espíritus invocados! Que se eleven las voces de:* ${nombres}\n\n🔥 *El ritual ha comenzado.*`,
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