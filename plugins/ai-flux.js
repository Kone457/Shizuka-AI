import fetch from 'node-fetch';

let handler = async (m, { conn, args }) => {
  const prompt = args.join(' ').trim();

  if (!prompt) {
    return m.reply('《✧》 Ingresa un *prompt* para que *Flux* genere tu imagen.');
  }

  try {
    const { key } = await conn.sendMessage(
      m.chat,
      { text: 'ⴵ *Flux* está creando tu imagen...' },
      { quoted: m }
    );

    const url = `${api.url}/ai/flux?prompt=${encodeURIComponent(prompt)}&apikey=${api.key}`;

    await conn.sendMessage(
      m.chat,
      {
        image: { url },
        caption: `🖼️ *Prompt:* ${prompt}`
      },
      { quoted: m, edit: key }
    );
  } catch (error) {
    console.error(error);
    await m.reply('❏ Ocurrió un error al procesar tu solicitud.');
  }
};

handler.help = ['flux'];
handler.tags = ['ai'];
handler.command = ['flux'];

export default handler;