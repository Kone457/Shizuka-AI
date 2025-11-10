import fetch from 'node-fetch';

let handler = async (m, { conn, args, command }) => {
  try {
    const mentionedJid = m.mentionedJid?.[0];
    const sender = m.sender;
    const senderName = conn.getName(sender);
    const targetName = mentionedJid ? conn.getName(mentionedJid) : null;

    const res = await fetch('https://api.waifu.pics/sfw/kiss');
    const json = await res.json();
    const imageUrl = json.url;

    let text;
    if (!mentionedJid || mentionedJid === sender) {
      text = `💋 ${senderName} se dio un beso a sí mismo... qué tierno 😳`;
    } else {
      text = `💞 ${senderName} le dio un beso a ${targetName} 💋`;
    }

    await conn.sendMessage(
      m.chat,
      {
        image: { url: imageUrl },
        caption: text
      },
      { quoted: m }
    );

  } catch (error) {
    console.error(error);
    m.reply('> *Error al obtener la imagen.* Intenta nuevamente más tarde.');
  }
};

handler.help = ['kiss'];
handler.tags = ['anime'];
handler.command = ['kiss', 'besar'];

export default handler;