import fetch from 'node-fetch';

let handler = async (m, { conn, args }) => {
  const text = args.join(' ').trim();

  if (!text) {
    return m.reply('《✧》 Escribe una *petición* para que *Cenix* te responda.');
  }

  try {
    const { key } = await conn.sendMessage(
      m.chat,
      { text: 'ⴵ *Cenix* está procesando tu solicitud...' },
      { quoted: m }
    );

    const res = await fetch(`${api.url}/ai/cenix?text=${encodeURIComponent(text)}&apikey=${api.key}`);
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

handler.help = ['cenix'];
handler.tags = ['ia'];
handler.command = ['cenix'];

export default handler;