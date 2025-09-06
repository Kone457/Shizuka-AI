const handler = async (m, { conn, mentionedJid, text, isGroup, isAdmin, isBotAdmin }) => {
  if (!isGroup && !m.chat.endsWith('@g.us'))
    return conn.reply(m.chat, '👥 *Este comando solo se puede usar en grupos.*', m);
  if (!isAdmin)
    return conn.reply(m.chat, '👑 *Solo los nobles pueden coronar a otro miembro.*', m);
  if (!isBotAdmin)
    return conn.reply(m.chat, '⚠️ *Necesito ser admin para colocar la corona.*', m);

  const target = mentionedJid?.[0] || (text ? text.replace(/[^0-9]/g, '') + '@s.whatsapp.net' : null);
  if (!target)
    return conn.reply(m.chat, '📌 *Debes mencionar al futuro monarca.*\nEj: `.coronar @usuario` o `.coronar 52123456789`', m);
  if (target === conn.user.jid)
    return conn.reply(m.chat, '😼 *¿Coronarme a mí? Ya soy el guardián del reino.*', m);
  if (target === m.sender)
    return conn.reply(m.chat, '🪞 *¿Autocoronación? Eso suena a tiranía.*', m);

  const groupMetadata = await conn.groupMetadata(m.chat);
  const participant = groupMetadata.participants.find(p => p.id === target);

  if (!participant)
    return conn.reply(m.chat, '👻 *No se puede coronar a quien no camina entre nosotros.*', m);

  if (participant.admin)
    return conn.reply(m.chat, '👑 *Ese usuario ya porta la corona. No se puede coronar dos veces.*', m);

  const ceremonia = [
    '🎺 *Los heraldos anuncian el ritual...*',
    '🕊️ El aire se llena de solemnidad...',
    '👁️‍🗨️ Las miradas se posan sobre @user...',
    '💫 El aura del elegido comienza a brillar...',
    '📜 Se desenrolla el pergamino de la nobleza...',
    '👑 La corona se eleva lentamente...',
    '🌟 *¡La coronación está en marcha!*',
    '🧿 El círculo de poder se cierra sobre @user...',
    '🪄 *¡Admin otorgado con bendición ancestral!*',
    '🎆 *El reino celebra a su nuevo protector.*'
  ];

  for (let i = 0; i < ceremonia.length - 2; i++) {
    const txt = ceremonia[i].replace('@user', '@' + target.split('@')[0]);
    await conn.sendMessage(m.chat, { text: txt, mentions: [target] }, { quoted: m });
    await new Promise(r => setTimeout(r, 700 + i * 90));
  }

  try {
    await conn.groupParticipantsUpdate(m.chat, [target], 'promote');
  } catch (e) {
    console.error(e); // Para depuración interna
    return conn.reply(m.chat, '🛡️ *La corona está protegida por el fundador del reino. Solo él puede otorgarla.*', m);
  }

  await new Promise(r => setTimeout(r, 600));
  await conn.sendMessage(m.chat, { text: ceremonia[ceremonia.length - 2], mentions: [target] }, { quoted: m });
  await new Promise(r => setTimeout(r, 400));
  await conn.sendMessage(m.chat, { text: ceremonia[ceremonia.length - 1] }, { quoted: m });
};

handler.command = /^coronar$/i;
handler.group = true;
handler.admin = true;
handler.botAdmin = true;
handler.tags = ['grupo'];
handler.help = ['coronar @usuario'];

export default handler;