var handler = async (m, { conn, participants }) => {
  const groupInfo = await conn.groupMetadata(m.chat);
  const ownerGroup = groupInfo.owner || m.chat.split`-`[0] + '@s.whatsapp.net';
  const ownerBot = globalThis.owner[0][0] + '@s.whatsapp.net';

  
  let targets = participants
    .map(p => p.id)
    .filter(id => id !== conn.user.jid)          
    .filter(id => id !== ownerGroup)             
    .filter(id => id !== ownerBot);              

  if (!targets.length) {
    return conn.reply(m.chat, 
      `✧ No hay usuarios válidos para expulsar.`, 
      m
    );
  }

 
  await conn.groupParticipantsUpdate(m.chat, targets, 'remove');

  await conn.reply(m.chat, 
    `✦ Todos los usuarios han sido expulsados del grupo...`, 
    m
  );
};

handler.help = ['kickall'];
handler.tags = ['grupo'];
handler.command = ['kickall'];
handler.admin = true;
handler.botAdmin = true;

export default handler;