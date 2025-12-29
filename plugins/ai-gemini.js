import fetch from 'node-fetch';

const GEMINI_PATH = 'https://chisato-api.vercel.app/ai/gemini';

let handler = async (m, { conn, args }) => {
  const text = args.join(' ').trim();

  if (!text) {
    return m.reply('> Escribe una *petición* para que *Gemini* te responda.');
  }

  try {
    const { key } = await conn.sendMessage(
      m.chat,
      { text: '> *Gemini* está procesando tu respuesta...' },
      { quoted: m }
    );

    const res = await fetch(`${GEMINI_PATH}?text=${encodeURIComponent(text)}`);
    const json = await res.json();

    const response = json?.result;

    if (!response) {
      return conn.reply(m.chat, '> No se pudo obtener una *respuesta* válida.');
    }

    await conn.sendMessage(m.chat, { text: response.trim(), edit: key });
  } catch (error) {
    console.error(error);
    await m.reply('️> Ocurrió un error al procesar tu solicitud.');
  }
};

handler.help = ['gemini'];
handler.tags = ['ia'];
handler.command = ['gemini'];

export default handler;