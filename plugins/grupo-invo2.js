const handler = async (m, { conn, participants, isAdmin }) => {
  const texto = (m.text || '').toLowerCase().trim();
  if (texto !== 'ritual de invocación') return;

  if (!m.isGroup) return conn.reply(m.chat, '🌀 *Este ritual solo puede realizarse en círculos grupales.*', m);
  if (!isAdmin) return conn.reply(m.chat, '🔮 *Solo el chamán puede iniciar el ritual.*', m);

  const menciones = participants
    .map(p => p.id)
    .filter(id => id !== conn.user.jid);

  // Mapa de prefijos a banderas
  const banderas = {
    '1': '🇺🇸', // USA, Canadá
    '44': '🇬🇧',
    '34': '🇪🇸',
    '52': '🇲🇽',
    '54': '🇦🇷',
    '55': '🇧🇷',
    '57': '🇨🇴',
    '58': '🇻🇪',
    '91': '🇮🇳',
    '81': '🇯🇵',
    '82': '🇰🇷',
    '86': '🇨🇳',
    '53': '🇨🇺',
    '49': '🇩🇪',
    '33': '🇫🇷',
    '39': '🇮🇹',
    '7': '🇷🇺',
    '351': '🇵🇹',
    '56': '🇨🇱',
    '593': '🇪🇨',
    '595': '🇵🇾',
    '598': '🇺🇾',
    '505': '🇳🇮',
    '507': '🇵🇦',
    '502': '🇬🇹',
    '506': '🇨🇷',
    '51': '🇵🇪'
  };

  const nombresDecorados = menciones.map(id => {
    const numero = id.split('@')[0];
    const prefijo = numero.replace(/[^0-9]/g, '').slice(0, 3); // Tomamos los primeros 2–3 dígitos
    const bandera = Object.entries(banderas).find(([codigo]) => prefijo.startsWith(codigo))?.[1] || '🏳️';
    return `🔔 Invocado: ${bandera} @${numero}`;
  }).join('\n');

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

handler.customPrefix = /^despierten$/i;
handler.command = new RegExp();
handler.group = true;
handler.admin = true;
handler.tags = ['grupo'];
handler.help = ['ritual de invocación'];

export default handler;