import fetch from 'node-fetch';

const handler = async (m, { args, conn }) => {
  if (!args[0]) {
    return conn.sendMessage(
      m.chat,
      { text: '《✧》 Ingresa un enlace válido de Instagram.' },
      { quoted: m }
    );
  }

  try {
    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

    const res = await fetch(`${api.url4}/download/instagram?url=${encodeURIComponent(args[0])}`);
    const json = await res.json();

    if (!json.status || !json.data) {
      throw new Error('Respuesta inválida del servidor.');
    }

    for (let media of json.data) {
      if (media.type === 'video') {
        await conn.sendFile(
          m.chat,
          media.url,
          'instagram.mp4',
          '✿ Aquí tienes.',
          m
        );
      } else if (media.type === 'image') {
        await conn.sendFile(
          m.chat,
          media.url,
          'instagram.jpg',
          '✿ Aquí tienes.',
          m
        );
      }
    }

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

handler.command = ['instagram', 'ig'];
handler.tags = ['descargas'];
handler.help = ['instagram', 'ig'];
handler.group = true;

export default handler;