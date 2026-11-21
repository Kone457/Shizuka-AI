import fetch from 'node-fetch';

const handler = async (m, { args, conn }) => {
  if (!args[0]) {
    return conn.sendMessage(
      m.chat,
      { text: '《✧》 هات لينك تويتر صحيح.' },
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
      throw new Error('رد غير صحيح من الـAPI.');
    }

    const videoUrl = json.result.HD || json.result.SD;

    await conn.sendFile(
      m.chat,
      videoUrl,
      'twitter.mp4',
      '✿ اتفضل.',
      m
    );

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

  } catch (e) {
    await conn.sendMessage(
      m.chat,
      { text: `❏ خطأ.\n❏ التفاصيل: ${e.message}` },
      { quoted: m }
    );
    await conn.sendMessage(m.chat, { react: { text: '⚠️', key: m.key } });
  }
};

handler.command = ['twitter', 'tw', 'x', 'تويتر'];
handler.tags = ['descargas'];
handler.help = ['تويتر', 'tw', 'x'];
handler.group = true;

export default handler;