import fetch from 'node-fetch';

let handler = async (m, { conn }) => {
  try {
    const sender = m.sender;
    const senderName = await conn.getName(sender);

    const res = await fetch('https://api.waifu.im/search/?included_tags=waifu&is_nsfw=false');
    const json = await res.json();

    const imageUrl = json.images[0].url;

    const caption = `✰ Aquí tienes ${senderName}...\n> ¿te enamoraste? `;

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
    m.reply('✰ *Error al obtener la waifu.* Intenta nuevamente más tarde.');
  }
};

handler.help = ['waifu'];
handler.tags = ['buscadores'];
handler.command = ['waifu'];

export default handler;