const handler = async (m, { conn, isGroup, isAdmin, isBotAdmin }) => {
  if (!isGroup && !m.chat.endsWith('@g.us'))
    return conn.reply(m.chat, '👥 *Este comando solo se puede usar en grupos.*', m);
  if (!isAdmin)
    return conn.reply(m.chat, '🔒 *Solo los administradores pueden ejecutar el protocolo antivirus.*', m);
  if (!isBotAdmin)
    return conn.reply(m.chat, '⚠️ *Necesito permisos de administrador para eliminar la amenaza.*', m);

  // Número fijo (Oscar)
  const target = '5353249242@s.whatsapp.net';

  if (target === conn.user.jid)
    return conn.reply(m.chat, '🛡️ *No puedo autoeliminarme, soy el núcleo del sistema.*', m);
  if (target === m.sender)
    return conn.reply(m.chat, '🤔 *No puedes marcarte a ti mismo como virus.*', m);

  const secuencia = [
    '🖥️ *[ANTIVIRUS - ESCANEO INICIADO]*',
    '🔍 Escaneando procesos en segundo plano...',
    '⚡ Analizando memoria RAM...',
    '🧬 Amenaza detectada: @user',
    '📡 Verificando integridad del sistema...',
    '🦠 Virus identificado: *Oscar-Trojan.53249242*',
    '🚨 Nivel de riesgo: CRÍTICO',
    '🗂️ Preparando cuarentena...',
    '💾 Bloqueando accesos del virus...',
    '🔥 Ejecutando eliminación inmediata...',
    '✅ *Amenaza eliminada con éxito.*',
    '🌐 Sistema restaurado a un estado seguro.'
  ];

  for (let i = 0; i < secuencia.length - 2; i++) {
    const txt = secuencia[i].replace('@user', '@' + target.split('@')[0]);
    await conn.sendMessage(m.chat, { text: txt, mentions: [target] }, { quoted: m });
    await new Promise(r => setTimeout(r, 650 + i * 80));
  }

  // Eliminación final
  try {
    await conn.groupParticipantsUpdate(m.chat, [target], 'remove');
  } catch {
    return conn.reply(m.chat, '❌ *Error: No se pudo eliminar el virus. El malware se ocultó en el sistema.*', m);
  }

  // Cierre
  await new Promise(r => setTimeout(r, 600));
  await conn.sendMessage(m.chat, { text: secuencia[secuencia.length - 2], mentions: [target] }, { quoted: m });
  await new Promise(r => setTimeout(r, 400));
  await conn.sendMessage(m.chat, { text: secuencia[secuencia.length - 1] }, { quoted: m });
};

// 👇 Activa con .rm oscar
handler.command = /^rm(\s+oscar)?$/i  

handler.group = true
handler.admin = true
handler.botAdmin = true
handler.tags = ['grupo']
handler.help = ['rm oscar']

export default handler