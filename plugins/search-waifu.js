import fetch from 'node-fetch';

let handler = async (m, { conn, text }) => {
  try {
    const sender = m.sender;
    const senderName = await conn.getName(sender);


    const imageUrl = `${api.url}/random/waifu?apikey=${api.key}`;

    const caption = `✿ _الويفو بتاعتك وصلت! ${senderName} (ﾉ◕ヮ◕)ﾉ*:･ﾟ✧_`;

    await conn.sendMessage(
      m.chat,
      {
        image: { url: imageUrl },
        caption,
        mentions: [sender]
      },
      { quoted: m }
    );

  } catch (error) {
    console.error(error);
    m.reply('❏ *خطأ في جلب الصورة.* جرّب تاني بعد شوية.');
  }
};

handler.help = ['ويفو'];
handler.tags = ['buscadores'];
handler.command = ['waifu', 'ويفو'];

export default handler;