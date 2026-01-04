import fetch from 'node-fetch';

const COPILOT_PATH = 'https://api.stellarwa.xyz/ai/copilot';
const API_KEY = 'stellar-EBo93V1d';

let handler = async (m, { conn, args }) => {
  const text = args.join(' ').trim();

  if (!text) {
    return m.reply('> Escribe una *petición* para que *Copilot* te responda.');
  }

  try {
    const { key } = await conn.sendMessage(
      m.chat,
      { text: '> *Copilot* está procesando tu respuesta...' },
      { quoted: m }
    );

    const res = await fetch(`${COPILOT_PATH}?text=${encodeURIComponent(text)}&key=${API_KEY}`);
    const json = await res.json();

    const response = json?.response;

    if (!response) {
      return conn.reply(m.chat, '> No se pudo obtener una *respuesta* válida.');
    }

    await conn.sendMessage(m.chat, { text: response.trim(), edit: key });
  } catch (error) {
    console.error(error);
    await m.reply('️> Ocurrió un error al procesar tu solicitud.');
  }
};

handler.help = ['copilot'];
handler.tags = ['ia'];
handler.command = ['copilot', 'cpt'];

export default handler;