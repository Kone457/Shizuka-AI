const handler = async (m, { conn, participants, isAdmin }) => {
  const texto = (m.text || '').toLowerCase().trim();
  if (texto !== 'ritual de invocación') return;

  if (!m.isGroup) return conn.reply(m.chat, '🌀 *Este ritual solo puede realizarse en círculos grupales.*', m);
  if (!isAdmin) return conn.reply(m.chat, '🔮 *Solo el chamán puede iniciar el ritual.*', m);

  const menciones = participants
    .map(p => p.id)
    .filter(id => id !== conn.user.jid);

  const nombresDecorados = menciones
    .map(id => `🔔 Invocado: @${id.split('@')[0]}`)
    .join('\n');

  const textoInicial = `🌑 *El círculo se forma. Las sombras se agitan...*\n\n🧙‍♂️ *El chamán extiende sus manos hacia los espíritus dormidos...*`;
  const textoInvocacion = `📜 *Lista de invocados:*\n\n${nombresDecorados}\n\n🔥 *¡Que se eleven las voces! El ritual ha comenzado.*`;

  await conn.sendMessage(m.chat, {
    text: textoInicial,
    mentions: menciones
  }, { quoted: m });

  await new Promise(r => setTimeout(r, 1200));

  await conn.sendMessage(m.chat, {
    text: textoInvocacion,
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