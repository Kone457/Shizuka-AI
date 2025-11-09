import fetch from 'node-fetch';

const GEMINI_API_KEY = 'AIzaSyDRdEvBR4_9bj3159KsDlgJxux9R-5CMwA';
const GEMINI_MODEL = 'gemini-2.5-flash-lite';
const GEMINI_PATH = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

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

    const res = await fetch(GEMINI_PATH, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text }] }]
      })
    });

    const json = await res.json();

    const response = json?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!response) {
      return conn.reply(m.chat, '> No se pudo obtener una *respuesta* válida.');
    }

    await conn.sendMessage(m.chat, { text: response.trim(), edit: key });
  } catch (error) {
    console.error(error);
    await m.reply('️> Ocurrió un error al procesar tu solicitud.');
  }
};

handler.help = ['ia', 'gemini'];
handler.tags = ['ia'];
handler.command = ['ia', 'gemini'];

export default handler;