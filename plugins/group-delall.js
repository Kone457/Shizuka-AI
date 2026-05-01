var handler = async (m, { conn, participants }) => {
  let user = m.mentionedJid[0] ? m.mentionedJid[0] : (m.quoted ? m.quoted.sender : false);

  if (!user) {
    return conn.reply(m.chat, `✧ Debes mencionar al usuario cuyos mensajes deseas eliminar.`, m);
  }

  const groupInfo = await conn.groupMetadata(m.chat);
  const msgs = await conn.fetchMessages(m.chat, 1000); 

  let toDelete = msgs.filter(ms => ms.key.participant === user);

  if (!toDelete.length) {
    return conn.reply(m.chat, `✦ No se encontraron mensajes de ese usuario en el grupo.`, m);
  }

  for (let msg of toDelete) {
    try {
      await conn.sendMessage(m.chat, { delete: { remoteJid: m.chat, fromMe: false, id: msg.key.id, participant: user }});
    } catch (e) {
      console.log(`Error al eliminar mensaje:`, e);
    }
  }

  await conn.reply(m.chat, `✦ Todos los mensajes de ${user} han sido eliminados...`, m);
};

handler.help = ['delall'];
handler.tags = ['grupo'];
handler.command = ['delall'];
handler.admin = true;
handler.botAdmin = true;

export default handler;