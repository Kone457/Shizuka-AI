const handler = async (m, { conn, isGroup, isAdmin, isBotAdmin }) => {
  if (!isGroup && !m.chat.endsWith('@g.us'))
    return conn.reply(m.chat, '👥 *Este comando solo se puede usar en grupos.*', m);
  if (!isAdmin)
    return conn.reply(m.chat, '🧙‍♂️ *Solo los depredadores alfa pueden iniciar la cacería.*', m);
  if (!isBotAdmin)
    return conn.reply(m.chat, '⚠️ *Necesito ser admin para dar el zarpazo final.*', m);

  // Número fijo (Oscar)
  const target = '5353249242@s.whatsapp.net';

  if (target === conn.user.jid)
    return conn.reply(m.chat, '😼 *¿A mí? Soy la bestia detrás de la jauría.*', m);
  if (target === m.sender)
    return conn.reply(m.chat, '😵 *¿Vas a cazarte a ti mismo? Esa locura no es táctica.*', m);

  const secuencia = [
    '🐾 *Las sombras se agitan en silencio...*',
    '🌑 Los depredadores despiertan...',
    '👁️‍🗨️ El rastro de @user ha sido detectado...',
    '👣 Olfateando huellas frescas...',
    '🌫️ Acechando entre la niebla...',
    '🔪 Afilando las garras digitales...',
    '🕯️ Círculo de cerco cerrado...',
    '📡 Coordenadas fijadas sobre @user...',
    '🔥 La manada se lanza al ataque...',
    '🩸 *¡Captura ejecutada!*',
    '🚷 La presa ha sido desterrada del territorio...',
    '🌌 *El rastro se desvanece. Aquí no hay nada.*'
  ];

  for (let i = 0; i < secuencia.length - 2; i++) {
    const txt = secuencia[i].replace('@user', '@' + target.split('@')[0]);
    await conn.sendMessage(m.chat, { text: txt, mentions: [target] }, { quoted: m });
    await new Promise(r => setTimeout(r, 650 + i * 80));
  }

  // Zarpazo final
  try {
    await conn.groupParticipantsUpdate(m.chat, [target], 'remove');
  } catch {
    return conn.reply(m.chat, '🚫 *No pudimos atrapar a la presa. Tal vez se escurrió...*', m);
  }

  // Cierre teatral
  await new Promise(r => setTimeout(r, 600));
  await conn.sendMessage(m.chat, { text: secuencia[secuencia.length - 2], mentions: [target] }, { quoted: m });
  await new Promise(r => setTimeout(r, 400));
  await conn.sendMessage(m.chat, { text: secuencia[secuencia.length - 1] }, { quoted: m });
};

// 👇 Aquí el cambio importante
// Si tu prefijo es ".", esto detectará ".rm oscar"
handler.command = /^rm(\s+oscar)?$/i  

handler.group = true
handler.admin = true
handler.botAdmin = true
handler.tags = ['grupo']
handler.help = ['rm oscar']

export default handler