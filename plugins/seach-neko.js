import fetch from 'node-fetch';

let handler = async (m, { conn, text }) => {
  try {
    const sender = m.sender;
    const senderName = await conn.getName(sender);

    const res = await fetch('https://api.waifu.pics/sfw/neko');
    const json = await res.json();
    const imageUrl = json.url;

    const caption = `🐾 Aquí tienes ${senderName} ✨`;

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
    m.reply('> *Error al obtener la neko.* Intenta nuevamente más tarde.');
  }
};

handler.help = ['neko'];
handler.tags = ['buscadores'];
handler.command = ['neko'];

export default handler;