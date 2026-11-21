import fetch from 'node-fetch';

const handler = async (m, { args, conn }) => {
  if (!args[0]) {
    return conn.sendMessage(
      m.chat,
      { text: '《✧》 هات لينك ثريدز صحيح.' },
      { quoted: m }
    );
  }

  try {
    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

    const res = await fetch(
      `${global.api.url2}/download/threads?url=${encodeURIComponent(args[0])}`
    );

    const json = await res.json();

    if (!json.status || !json.data?.media?.[0]?.url) {
      throw new Error('رد غير صحيح من الـAPI.');
    }

    await conn.sendFile(
      m.chat,
      json.data.media[0].url,
      'threads.mp4',
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

handler.command = ['threads', 'ثريدز'];
handler.tags = ['descargas'];
handler.help = ['ثريدز'];
handler.group = true;

export default handler;