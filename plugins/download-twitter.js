import fetch from 'node-fetch';

const handler = async (m, { args, conn }) => {
  if (!args[0]) {
    return conn.sendMessage(
      m.chat,
      { text: '《✧》 Ingresa un enlace válido de Twitter.' },
      { quoted: m }
    );
  }

  try {
    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

    const res = await fetch(
      `${api.url}/download/twitter?url=${encodeURIComponent(args[0])}&apikey=${api.key}`
    );

    const json = await res.json();

    if (!json.status || (!json.result?.HD && !json.result?.SD)) {
      throw new Error('Respuesta inválida de la API.');
    }

    const videoUrl = json.result.HD || json.result.SD;

    await conn.sendFile(
      m.chat,
      videoUrl,
      'twitter.mp4',
      '✿ Aquí tienes.',
      m
    );

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

  } catch (e) {
    await conn.sendMessage(
      m.chat,
      { text: `❏ Error.\n❏ Detalles: ${e.message}` },
      { quoted: m }
    );
    await conn.sendMessage(m.chat, { react: { text: '⚠️', key: m.key } });
  }
};

handler.command = ['twitter', 'tw', 'x'];
handler.tags = ['descargas'];
handler.help = ['twitter', 'tw', 'x'];
handler.group = true;

export default handler;