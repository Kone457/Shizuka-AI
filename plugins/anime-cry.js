import fetch from 'node-fetch';

let handler = async (m, { conn, text }) => {
  try {
    const sender = m.sender;
    const senderName = await conn.getName(sender);

    let mentioned = m.mentionedJid?.[0];
    if (!mentioned && text.includes('@')) {
      const mentionFallback = conn.parseMention(text)?.[0];
      if (mentionFallback) mentioned = mentionFallback;
    }

    const res = await fetch('https://api.waifu.pics/sfw/cry');
    const json = await res.json();
    const imageUrl = json.url;

    let caption;
    if (!mentioned || mentioned === sender) {
      caption = `😢 ${senderName} está llorando solo... dale un abrazo 🫂`;
    } else {
      let targetName = await conn.getName(mentioned);
      if (!targetName) targetName = '@' + mentioned.split('@')[0];
      caption = `😭 ${senderName} está llorando por culpa de ${targetName} 💔`;
    }

    await conn.sendMessage(
      m.chat,
      {
        image: { url: imageUrl },
        caption,
        mentions: mentioned ? [mentioned] : []
      },
      { quoted: m }
    );

  } catch (error) {
    console.error(error);
    m.reply('> *Error al obtener la imagen.* Intenta nuevamente más tarde.');
  }
};

handler.help = ['cry'];
handler.tags = ['anime'];
handler.command = ['cry'];

export default handler;