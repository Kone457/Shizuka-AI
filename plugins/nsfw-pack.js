import fetch from 'node-fetch';

let handler = async (m, { conn, text }) => {
  try {
    const sender = m.sender;
    const senderName = await conn.getName(sender);

m.react('🤭');
    
    const imageUrl = 'https://api.delirius.store/nsfw/girls';

    const caption = `🎭 Aquí tienes ${senderName} ✨`;

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

handler.help = ['pack'];
handler.tags = ['nsfw'];
handler.command = ['pack'];

export default handler;