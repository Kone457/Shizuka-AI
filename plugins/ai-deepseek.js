import fetch from 'node-fetch';

let handler = async (m, { conn, args }) => {
  const text = args.join(' ').trim();

  if (!text) {
    return m.reply('《✧》 Escribe una *petición* para que *DeepSeek* te responda.');
  }

  try {
    const { key } = await conn.sendMessage(
      m.chat,
      { text: 'ⴵ *DeepSeek* está procesando tu solicitud...' },
      { quoted: m }
    );

    const res = await fetch(`${api.url}/ai/deepseek?text=${encodeURIComponent(text)}&apikey=${api.key}`);
    const json = await res.json();

    const response = json?.result;

    if (!response) {
      return conn.reply(m.chat, '❏ No se pudo obtener una *respuesta* válida.');
    }

    await conn.sendMessage(m.chat, { text: response.trim(), edit: key });
  } catch (error) {
    console.error(error);
    await m.reply('❏ Ocurrió un error al procesar tu solicitud.');
  }
};

handler.help = ['deepseek'];
handler.tags = ['ia'];
handler.command = ['deepseek'];

export default handler;