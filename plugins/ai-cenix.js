import fetch from 'node-fetch';

const LLAMA_PATH = 'https://nexevo-api.vercel.app/ai/cenix';

let handler = async (m, { conn, args }) => {
  const text = args.join(' ').trim();

  if (!text) {
    return m.reply('> Escribe una *petición* para charlar con *Cenix-AI* la ia del futuro.');
  }

  try {
    const { key } = await conn.sendMessage(
      m.chat,
      { text: '> *Cenix-AI* está procesando tu respuesta...' },
      { quoted: m }
    );

    const res = await fetch(`${LLAMA_PATH}?text=${encodeURIComponent(text)}`);
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

handler.help = ['cenix'];
handler.tags = ['ia'];
handler.command = ['cenix'];

export default handler;