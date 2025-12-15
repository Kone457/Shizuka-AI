import fetch from 'node-fetch';

let handler = async (m, { conn, text }) => {
  try {
    const sender = m.sender;
    const senderName = await conn.getName(sender);

    const imageUrl = 'https://kurumi-apiz.vercel.app/random/nsfw';

    const caption = `📸 Aquí tienes ${senderName} ✨`;

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
    m.reply('> *Error al obtener la imagen.* Intenta nuevamente más tarde.');
  }
};

handler.help = ['nsfw'];
handler.tags = ['buscadores'];
handler.command = ['nsfw'];

export default handler;