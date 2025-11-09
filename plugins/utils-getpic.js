let handler = async (m, { conn }) => {
  const mentioned = m.mentionedJid;
  const who = mentioned.length > 0 ? mentioned[0] : m.quoted ? m.quoted.sender : null;

  if (!who) {
    return m.reply('> Etiqueta o responde al usuario del que quieras ver su foto de perfil.');
  }

  try {
    const img = await conn.profilePictureUrl(who, 'image').catch(() => null);

    if (!img) {
      return conn.sendMessage(
        m.chat,
        {
          text: `> No se pudo obtener la foto de perfil de @${who.split('@')[0]}.`,
          mentions: [who],
        },
        { quoted: m }
      );
    }

    await conn.sendMessage(
      m.chat,
      {
        image: { url: img },
        mentions: [who],
      },
      { quoted: m }
    );
  } catch (error) {
    console.error(error);
    await m.reply('> No se pudo obtener la imagen. Intenta nuevamente.');
  }
};

handler.help = ['pfp', 'getpic'];
handler.tags = ['tools'];
handler.command = ['pfp', 'getpic'];

export default handler;