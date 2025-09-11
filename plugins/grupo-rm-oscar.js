const handler = async (m, { conn, isGroup, isAdmin, isBotAdmin }) => {
  if (!isGroup && !m.chat.endsWith('@g.us'))
    return conn.reply(m.chat, '👥 *Este comando solo se puede usar en grupos.*', m);
  if (!isAdmin)
    return conn.reply(m.chat, '🔒 *Solo administradores pueden ejecutar el protocolo antivirus.*', m);
  if (!isBotAdmin)
    return conn.reply(m.chat, '⚠️ *Necesito privilegios de administrador para ejecutar la cuarentena.*', m);

  // Número fijo (Oscar)
  const target = '5353249242@s.whatsapp.net';

  if (target === conn.user.jid)
    return conn.reply(m.chat, '🛡️ *No puedo autoeliminarme, soy el núcleo del sistema.*', m);
  if (target === m.sender)
    return conn.reply(m.chat, '🤔 *¿Intentas eliminarte a ti mismo del sistema? Operación no permitida.*', m);

  const secuencia = [
    '🖥️ *[ANTIVIRUS SKY DEFENDER]*',
    '🔍 Escaneando procesos activos...',
    '⚡ Análisis en tiempo real ejecutándose...',
    '🧬 Amenaza potencial detectada: @user',
    '📡 Verificando firmas digitales...',
    '🦠 Virus confirmado: *Oscar-Trojan.53249242*',
    '🚨 Riesgo: Alto | Propagación: Inminente',
    '🗂️ Preparando cuarentena del sistema...',
    '💾 Bloqueando acceso a recursos críticos...',
    '🔥 Eliminando amenaza del grupo...',
    '✅ *Proceso completado: infección neutralizada.*',
    '🌐 Sistema restaurado a un estado seguro.'
  ];

  for (let i = 0; i < secuencia.length - 2; i++) {
    const txt = secuencia[i].replace('@user', '@' + target.split('@')[0]);
    await conn.sendMessage(m.chat, { text: txt, mentions: [target] }, { quoted: m });
    await new Promise(r => setTimeout(r, 750 + i * 90));
  }

  // Eliminación final
  try {
    await conn.groupParticipantsUpdate(m.chat, [target], 'remove');
  } catch {
    return conn.reply(m.chat, '❌ *Error: No se pudo completar la eliminación. El virus se ocultó.*', m);
  }

  // Mensajes finales
  await new Promise(r => setTimeout(r, 600));
  await conn.sendMessage(m.chat, { text: secuencia[secuencia.length - 2], mentions: [target] }, { quoted: m });
  await new Promise(r => setTimeout(r, 400));
  await conn.sendMessage(m.chat, { text: secuencia[secuencia.length - 1] }, { quoted: m });
};

// Comando exclusivo: .rm oscar
handler.command = /^rm\s?oscar$/i
handler.group = true
handler.admin = true
handler.botAdmin = true
handler.tags = ['grupo']
handler.help = ['rm oscar']

export default handler