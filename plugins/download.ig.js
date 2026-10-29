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

    let mediaUrl = null;

    try {
      const resDelirius = await fetch(
        `${api.url2}/download/instagram?url=${encodeURIComponent(args[0])}`
      );
      const jsonDelirius = await resDelirius.json();
      if (jsonDelirius.status && jsonDelirius.data?.length) {
        const video = jsonDelirius.data.find(d => d.type === 'video');
        if (video) mediaUrl = video.url;
      }
    } catch {}

    if (!mediaUrl) {
      const resVoid = await fetch(
        `${api.url}/download/instagram?url=${encodeURIComponent(args[0])}&apikey=${api.key}`
      );
      const jsonVoid = await resVoid.json();
      if (jsonVoid.status && jsonVoid.result?.downloads?.length) {
        const video = jsonVoid.result.downloads.find(d => d.type === 'video');
        if (video) mediaUrl = video.url;
      }
    }

    if (!mediaUrl) throw new Error('No se pudo descargar el video de Instagram.');

    await conn.sendFile(
      m.chat,
      mediaUrl,
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