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

    const res = await fetch('https://api.waifu.pics/sfw/bite');
    const json = await res.json();
    const imageUrl = json.url;

    // Descargar la imagen como buffer
    const imgBuffer = await fetch(imageUrl).then(res => res.buffer());

    let caption;
    if (!mentioned || mentioned === sender) {
      caption = `😬 ${senderName} se mordió solo... ¿todo bien? 🫣`;
    } else {
      let targetName = await conn.getName(mentioned);
      if (!targetName) targetName = '@' + mentioned.split('@')[0];
      caption = `🦷 ${senderName} le dio una mordida a ${targetName} ¡ouch! 🍓`;
    }

    // Enviar la imagen
    await conn.sendMessage(
      m.chat,
      {
        image: imgBuffer,
        caption,
        mentions: mentioned ? [mentioned] : []
      },
      { quoted: m }
    );

    // Enviar el bloque estilo Git como texto aparte
    await conn.sendMessage(
      m.chat,
      {
        text: `\`\`\`git\n${caption}\nImagen enviada arriba\n\`\`\``,
        mentions: mentioned ? [mentioned] : []
      },
      { quoted: m }
    );

  } catch (error) {
    console.error(error);
    m.reply('> *Error al obtener la imagen.* Intenta nuevamente más tarde.');
  }
};

handler.help = ['bite'];
handler.tags = ['anime'];
handler.command = ['bite'];

export default handler;