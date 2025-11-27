import { igdl } from 'ruhend-scraper';

const handler = async (m, { args, conn }) => {
  if (!args[0]) {
    return conn.sendMessage(
      m.chat,
      { text: '⬛ Ingresa un enlace válido de Instagram.' },
      { quoted: m }
    );
  }

  try {
    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

    const res = await igdl(args[0]);
    const data = res.data;

    for (let media of data) {
      await conn.sendFile(
        m.chat,
        media.url,
        'instagram.mp4',
        '⬛ Aquí tienes.',
        m
      );
    }

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
  } catch (e) {
    await conn.sendMessage(
      m.chat,
      { text: `⬛ Error.\n⬛ Detalles: ${e.message}` },
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