let handler = async (m, { conn }) => {
  try {
    
    if (m.text === '👑') {
      let handler = async (m, { conn }) => {
  try {
    
    if (m.text === '👑') {
      
      let ownerBot = globalThis.owner[0][0] + '@s.whatsapp.net';
      if (m.sender !== ownerBot) {
        return conn.reply(m.chat, `⚠️👑 *Solo el Owner puede usar este poder real.*`, m);
      }

      let texto = await m.mentionedJid;
      let who = texto.length > 0 ? texto[0] : (m.quoted ? await m.quoted.sender : false);

      if (!who) {
        return conn.reply(m.chat, `⚠️👤 *Debes mencionar al usuario que recibirá la corona.*\n> Ejemplo: 👑 @usuario`, m);
      }

      const groupMetadata = await conn.groupMetadata(m.chat);
      const participant = groupMetadata.participants.find(p => p.jid === who);

      if (participant && participant.admin) {
        return conn.reply(m.chat, `👑✨ *@${who.split('@')[0]}* ya es administrador del grupo.`, m, { mentions: [who] });
      }

      // Promover al usuario
      await conn.groupParticipantsUpdate(m.chat, [who], 'promote');
      await conn.reply(
        m.chat,
        `🎉👑 *@${who.split('@')[0]}* ha sido promovido a administrador.\n> ¡La corona ha sido entregada con honor y celebración! 🥂`,
        m,
        { mentions: [who] }
      );
    }
  } catch (e) {
    await m.reply(`💥⚠️ *Error al ejecutar la acción.*\n> ${e.message}`);
  }
};

handler.customPrefix = /^👑$/i
handler.command = new RegExp // no necesita comando, solo el emoji
handler.tags = ['grupo']
handler.admin = true
handler.botAdmin = true

export default handler;
      if (!who) {
        return conn.reply(m.chat, `⚠️👤 *Debes mencionar al usuario que recibirá la corona.*\n> Ejemplo: 👑 @usuario`, m);
      }

      const groupMetadata = await conn.groupMetadata(m.chat);
      const participant = groupMetadata.participants.find(p => p.jid === who);

      if (participant && participant.admin) {
        return conn.reply(m.chat, `👑✨ *@${who.split('@')[0]}* ya es administrador del grupo.`, m, { mentions: [who] });
      }

      
      await conn.groupParticipantsUpdate(m.chat, [who], 'promote');
      await conn.reply(
        m.chat,
        `🎉👑 *@${who.split('@')[0]}* ha sido promovido a administrador.\n> ¡La corona ha sido entregada con honor y celebración! 🥂`,
        m,
        { mentions: [who] }
      );
    }
  } catch (e) {
    await m.reply(`💥⚠️ *Error al ejecutar la acción.*\n> ${e.message}`);
  }
};

handler.customPrefix = /^👑$/i
handler.command = new RegExp 
handler.tags = ['grupo']
handler.admin = true
handler.botAdmin = true

export default handler;