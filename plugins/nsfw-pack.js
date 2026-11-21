import fetch from 'node-fetch';

let handler = async (m, { conn, text }) => {
  try {
    const sender = m.sender;
    const senderName = await conn.getName(sender);

    const imageUrl = `${api.url}/random/4k?apikey=${api.key}`;

    const res = await fetch(imageUrl, { redirect: 'follow' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const contentType = res.headers.get('content-type') || '';
    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (!contentType.startsWith('image/')) {
      throw new Error(`الـAPI مرجّعش صورة (content-type: ${contentType})`);
    }

    const caption = `✿ اتفضل ${senderName}`;

    await conn.sendMessage(
      m.chat,
      {
        image: buffer,
        caption,
        mentions: [sender]
      },
      { quoted: m }
    );

  } catch (error) {
    console.error(error);
    m.reply('❏ *خطأ في جلب الصورة.* جرّب تاني بعد شوية.');
  }
};

handler.help = ['باكجسكس'];
handler.tags = ['nsfw'];
handler.command = ['pack', 'باكجسكس'];
handler.nsfw = true;

export default handler;