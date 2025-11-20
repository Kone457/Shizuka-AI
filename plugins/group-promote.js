const handler = async (m, { conn }) => {
  try {
    let texto = await m.mentionedJid;
    let who = texto.length > 0 ? texto[0] : (m.quoted ? await m.quoted.sender : false);

    if (!who) {
      return m.reply(
        `⚠️👤 *Debes mencionar al usuario que deseas promover.*\n> Usa: .promote @usuario`,
        m
      );
    }

    const groupMetadata = await conn.groupMetadata(m.chat);
    const participant = groupMetadata.participants.find(p => p.jid === who);

    if (participant && participant.admin) {
      return conn.reply(
        m.chat,
        `👑✨ *@${who.split('@')[0]}* ya es administrador del grupo.`,
        m,
        { mentions: [who] }
      );
    }

    await conn.groupParticipantsUpdate(m.chat, [who], 'promote');

    await conn.reply(
      m.chat,
      `🎉👑 *@${who.split('@')[0]}* ha sido promovido a administrador.\n> ¡La corona ha sido entregada con honor y celebración! 🥂`,
      m,
      { mentions: [who] }
    );
  } catch (e) {
    await m.reply(
      `💥⚠️ *Error al ejecutar la acción.*\n> ${e.message}`
    );
  }
};

handler.help = ['promote'];
handler.tags = ['grupo'];
handler.command = ['promote'];
handler.admin = true;
handler.botAdmin = true;

export default handler;