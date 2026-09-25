import { igdl, igdl2 } from 'ruhend-scraper'

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

    let result = await igdl(args[0])
    if (!result || !result.status || !result.data?.length) {
      result = await igdl2(args[0])
    }

    if (!result || !result.status || !result.data?.length) {
      throw new Error('No se pudo descargar el contenido de Instagram.')
    }

    const media = result.data[0]
    const dlUrl = media.url

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
