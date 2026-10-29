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

    const res = await fetch(
      `${api.url}/download/instagram?url=${encodeURIComponent(args[0])}&apikey=${api.key}`
    );
    const json = await res.json();

    if (!json.status || !json.result?.downloads?.length) {
      throw new Error('No se pudo descargar el contenido de Instagram.');
    }

    const media = json.result.downloads.find(d => d.type === 'video');
    if (!media) throw new Error('No se encontró un video.');

    const dlUrl = media.url;

    await conn.sendFile(
      m.chat,
      dlUrl,
      'instagram.mp4',
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

handler.command = ['instagram', 'ig'];
handler.tags = ['descargas'];
handler.help = ['instagram', 'ig'];
handler.group = true;

export default handler;