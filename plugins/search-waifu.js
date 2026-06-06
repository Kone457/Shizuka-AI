import fetch from 'node-fetch';

let handler = async (m, { conn, text }) => {
  try {
    const sender = m.sender;
    const senderName = await conn.getName(sender);


    const imageUrl = `${api.url}/random/waifu?apikey=${api.key}`;

    const caption = `✿ _¡Tu waifu ha llegado! ${senderName} (ﾉ◕ヮ◕)ﾉ*:･ﾟ✧_  `;

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
    m.reply('❏ *Error al obtener la imagen.* Intenta nuevamente más tarde.');
  }
};

handler.help = ['waifu'];
handler.tags = ['buscadores'];
handler.command = ['waifu'];

export default handler;