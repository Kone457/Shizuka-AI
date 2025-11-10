import fetch from 'node-fetch';

let handler = async (m, { conn, participants, command }) => {
  try {
    const sender = m.sender;
    const senderName = await conn.getName(sender);
    const mentioned = m.mentionedJid?.[0];

    const res = await fetch('https://api.waifu.pics/sfw/kiss');
    const json = await res.json();
    const imageUrl = json.url;

    let text;
    if (!mentioned || mentioned === sender) {
      text = `💋 ${senderName} se dio un beso a sí mismo... qué tierno 😳`;
    } else {
      const targetName = await conn.getName(mentioned);
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

handler.help = ['kiss @usuario'];
handler.tags = ['reacciones'];
handler.command = ['kiss'];

export default handler;