
import fetch from 'node-fetch';

let handler = async (m, { conn, args }) => {
  const text = args.join(' ').trim();

  if (!text) {
    return m.reply('《✧》 Escribe una *petición* para que *ChatGPT* te responda.');
  }

  try {
    const { key } = await conn.sendMessage(
      m.chat,
      { text: 'ⴵ *ChatGPT* está procesando tu respuesta...' },
      { quoted: m }
    );

    
    const res = await fetch(`${api.url2}/ia/chatgpt?q=${encodeURIComponent(text)}`);
    const json = await res.json();

    const response = json?.data;

    if (!response) {
      return conn.reply(m.chat, '❏ No se pudo obtener una *respuesta* válida.');
    }

    await conn.sendMessage(m.chat, { text: response.trim(), edit: key });
  } catch (error) {
    console.error(error);
    await m.reply('❏ Ocurrió un error al procesar tu solicitud.');
  }
};

handler.help = ['chatgpt'];
handler.tags = ['ia'];
handler.command = ['chatgpt', 'gpt'];

export default handler;