const handler = async (m, { conn, participants, groupMetadata, args }) => {
  const pp = await conn.profilePictureUrl(m.chat, 'image').catch(() => null) || './src/catalogo.jpg';
  const groupAdmins = participants.filter((p) => p.admin);
  const listAdmin = groupAdmins.length > 0 
    ? groupAdmins.map((v, i) => `${i + 1}. @${v.id.split('@')[0]}`).join('\n')
    : 'No hay administradores detectados.';
  const owner = groupMetadata.owner 
    || groupAdmins.find((p) => p.admin === 'superadmin')?.id 
    || (m.chat.split`-`[0] + '@s.whatsapp.net');
  const pesan = args.join(' ');
  const oi = pesan ? `» ${pesan}` : '» Sin mensaje adicional';
  const emoji = '📢';

  const text = `『✦』Admins del grupo:  

${listAdmin}

${emoji} Mensaje: ${oi}

『✦』Evita usar este comando con otras intenciones o serás *eliminado* o *baneado* del Bot.`.trim();

  await conn.sendFile(
    m.chat,
    pp,
    'admins.jpg',
    text,
    m,
    false,
    { mentions: [...groupAdmins.map((v) => v.id), owner] }
  );
};

handler.help = ['admins <texto>'];
handler.tags = ['group'];
handler.customPrefix = /a|@/i;
handler.command = /^(admins|@admins|dmins)$/i;
handler.group = true;

export default handler;