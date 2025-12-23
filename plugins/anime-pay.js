let handler = async (m, { conn, text }) => {
  try {
    const sender = m.sender;
    const senderName = await conn.getName(sender);

    let mentioned = m.mentionedJid?.[0];
    if (!mentioned && text.includes('@')) {
      const mentionFallback = conn.parseMention(text)?.[0];
      if (mentionFallback) mentioned = mentionFallback;
    }

    const imageUrl = "https://files.catbox.moe/do10tm.jpg";

    let caption;
    if (!mentioned || mentioned === sender) {
      caption = `🤑 ${senderName} se acaba de pagar a sí mismo... ¿todo bien? 🤔`;
    } else {
      let targetName = await conn.getName(mentioned);
      if (!targetName) targetName = '@' + mentioned.split('@')[0];
      caption = `💸 ${senderName} le acaba de pagar a ${targetName} dándole un vergazo 💰👊`;
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
    m.reply('> *Error al enviar la imagen.* Intenta nuevamente más tarde.');
  }
};

handler.help = ['pagar'];
handler.tags = ['anime'];
handler.command = ['pagar','pay'];

export default handler;