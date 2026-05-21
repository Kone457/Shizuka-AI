import fetch from 'node-fetch';

let handler = async (m, { conn }) => {
  try {
    const sender = m.sender;
    const senderName = await conn.getName(sender);

    const res = await fetch('https://api.waifu.im/search/?included_tags=neko&is_nsfw=false');
    const json = await res.json();

    const imageUrl = json.images[0].url;

    const caption = `✿ Aquí tienes ${senderName} `;

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
    m.reply('❏ *Error al obtener la neko.* Intenta nuevamente más tarde.');
  }
};

handler.help = ['neko'];
handler.tags = ['buscadores'];
handler.command = ['neko'];
handler.nsfw = true; 

export default handler;