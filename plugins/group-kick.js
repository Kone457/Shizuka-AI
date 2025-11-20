var handler = async (m, { conn, participants, usedPrefix, command }) => {
  let texto = await m.mentionedJid;
  let user = texto.length > 0 ? texto[0] : (m.quoted ? await m.quoted.sender : false);

  if (!user) {
    return conn.reply(m.chat, 
      `⚠️👤 *Debes mencionar al usuario que quieras expulsar.*\n> Usa: ${usedPrefix + command} @usuario`, 
      m
    );
  }

  const groupInfo = await conn.groupMetadata(m.chat);
  const ownerGroup = groupInfo.owner || m.chat.split`-`[0] + '@s.whatsapp.net';
  const ownerBot = globalThis.owner[0][0] + '@s.whatsapp.net';

  if (user === m.sender) {
    return conn.reply(m.chat, 
      `🙅‍♂️❌ *No puedes expulsarte a ti mismo.*\n> Menciona a otro usuario.`, 
      m
    );
  }

  if (user === conn.user.jid) {
    return conn.reply(m.chat, 
      `🤖❌ *No puedo autoeliminarme del grupo.*`, 
      m
    );
  }

  if (user === ownerGroup) {
    return conn.reply(m.chat, 
      `👑⚠️ *No puedo expulsar al propietario del grupo.*`, 
      m
    );
  }

  if (user === ownerBot) {
    return conn.reply(m.chat, 
      `🛡️⚠️ *No puedo expulsar al propietario del bot.*`, 
      m
    );
  }

  const participant = groupInfo.participants.find(p => p.jid === user);

  if (!participant) {
    return conn.reply(m.chat, 
      `📭 *El usuario* ${globalThis.db.data.users[user].name} *ya no está en el grupo.*`, 
      m
    );
  }

  await conn.groupParticipantsUpdate(m.chat, [user], 'remove');

  await conn.reply(m.chat, 
    `🚪👋 *El usuario* ${globalThis.db.data.users[user].name} *ha sido expulsado del grupo correctamente.*\n> La puerta se cerró tras su salida.`, 
    m
  );
};

handler.help = ['kick'];
handler.tags = ['grupo'];
handler.command = ['kick'];
handler.admin = true;
handler.botAdmin = true;

export default handler;