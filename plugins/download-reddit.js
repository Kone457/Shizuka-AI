import fetch from 'node-fetch';

const handler = async (m, { args, conn }) => {
  if (!args[0]) {
    return conn.sendMessage(
      m.chat,
      { text: '《✧》 هات لينك ريديت صحيح.' },
      { quoted: m }
    );
  }

  try {
    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

    const res = await fetch(
      `${api.url}/download/reddit?url=${encodeURIComponent(args[0])}&apikey=${api.key}`
    );

    const json = await res.json();

    if (!json.status || !json.result?.url) {
      throw new Error('رد غير صحيح من الـAPI.');
    }

    await conn.sendFile(
      m.chat,
      json.result.url,
      'reddit.mp4',
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

handler.command = ['reddit', 'ريديت'];
handler.tags = ['descargas'];
handler.help = ['ريديت'];
handler.group = true;

export default handler;