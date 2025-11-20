const handler = async (m, { conn }) => {
  try {
    let texto = await m.mentionedJid;
    let who = texto.length > 0 ? texto[0] : (m.quoted ? await m.quoted.sender : false);

    if (!who) {
      return m.reply(
        `⚠️👤 *Debes mencionar al usuario que deseas degradar.*\n> Usa: .demote @usuario`,
        m
      );
    }

    const groupMetadata = await conn.groupMetadata(m.chat);
    const participant = groupMetadata.participants.find(p => p.jid === who);

    if (!participant || !participant.admin) {
      return conn.reply(
        m.chat,
        `❌👑 *@${who.split('@')[0]}* no es administrador del grupo.`,
        m,
        { mentions: [who] }
      );
    }

    if (who === groupMetadata.owner) {
      return m.reply(
        `👑⚠️ *No puedes degradar al creador del grupo.*`
      );
    }

    if (who === conn.user.jid) {
      return m.reply(
        `🤖⚠️ *No puedes degradar al bot de administrador.*`
      );
    }

    await conn.groupParticipantsUpdate(m.chat, [who], 'demote');

    await conn.reply(
      m.chat,
      `📉🔻 *@${who.split('@')[0]}* ha sido degradado de administrador.\n> La corona ha sido retirada con solemnidad.`,
      m,
      { mentions: [who] }
    );
  } catch (e) {
    await m.reply(
      `💥⚠️ *Error al ejecutar la acción.*\n> ${e.message}`
    );
  }
};

handler.help = ['demote'];
handler.tags = ['grupo'];
handler.command = ['demote'];
handler.admin = true;
handler.botAdmin = true;

export default handler;