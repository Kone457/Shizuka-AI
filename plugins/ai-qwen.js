import fetch from 'node-fetch';

let handler = async (m, { conn, args, usedPrefix, command }) => {
  const text = args.join(' ').trim();

  if (!text) {
    return m.reply(`《✧》 Escribe una *petición* para que *Qwen* te responda.`);
  }

  try {
    const session = `user_${m.sender.replace(/[^0-9]/g, '')}`;

    const { key } = await conn.sendMessage(
      m.chat,
      { text: 'ⴵ *Qwen* está procesando tu solicitud...' },
      { quoted: m }
    );

    const res = await fetch(
      `${api.url}/ai/qwen?text=${encodeURIComponent(text)}&session=${encodeURIComponent(session)}&apikey=${api.key}`
    );
    const json = await res.json();

    const response = json?.respuesta;

    if (!response) {
      return conn.reply(m.chat, '❏ No se pudo obtener una *respuesta* válida.');
    }

    await conn.sendMessage(m.chat, { text: response.trim(), edit: key });
  } catch (error) {
    console.error(error);
    await m.reply('❏ Ocurrió un error al procesar tu solicitud.');
  }
};

handler.help = ['qwen'];
handler.tags = ['ia'];
handler.command = ['qwen'];

export default handler;