import fetch from 'node-fetch';

let handler = async (m, { conn, text }) => {
  try {
    const sender = m.sender;
    const senderName = await conn.getName(sender);

    // Detectar mención real
    let mentioned = m.mentionedJid?.[0];

    // Fallback: buscar @user en el texto si no se detectó mención
    if (!mentioned && text.includes('@')) {
      const mentionFallback = conn.parseMention(text)?.[0];
      if (mentionFallback) mentioned = mentionFallback;
    }

    const res = await fetch('https://api.waifu.pics/sfw/kiss');
    const json = await res.json();
    const imageUrl = json.url;

    let caption;
    if (!mentioned || mentioned === sender) {
      caption = `💋 ${senderName} se dio un beso a sí mismo... qué tierno 😳`;
    } else {
      const targetName = await conn.getName(mentioned);
      caption = `💞 ${senderName} le dio un beso a ${targetName} 💋`;
    }

    await conn.sendMessage(
      m.chat,
      {
        image: { url: imageUrl },
        caption
      },
      { quoted: m }
    );

  } catch (error) {
    console.error(error);
    m.reply('> *Error al obtener la imagen.* Intenta nuevamente más tarde.');
  }
};

handler.help = ['kiss @usuario'];
handler.tags = ['reacciones'];
handler.command = ['kiss'];

export default handler;