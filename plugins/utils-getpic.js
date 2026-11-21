let handler = async (m, { conn }) => {
  const mentioned = m.mentionedJid;
  const who = mentioned.length > 0 ? mentioned[0] : m.quoted ? m.quoted.sender : null;

  if (!who) {
    return m.reply('《✧》 اعمل منشن أو رد على المستخدم اللي عايز تشوف صورته.');
  }

  try {
    const img = await conn.profilePictureUrl(who, 'image').catch(() => null);

    if (!img) {
      return conn.sendMessage(
        m.chat,
        {
          text: `《✧》 مقدرتش أجيب صورة @${who.split('@')[0]}.`,
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
    await m.reply('《✧》 مقدرتش أجيب الصورة. جرّب تاني.');
  }
};

handler.help = ['صورتي', 'صورة'];
handler.tags = ['tools'];
handler.command = ['pfp', 'getpic', 'صورتي', 'صورة'];

export default handler;