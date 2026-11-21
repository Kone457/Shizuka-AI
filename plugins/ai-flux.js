import fetch from 'node-fetch';

let handler = async (m, { conn, args }) => {
  const prompt = args.join(' ').trim();

  if (!prompt) {
    return m.reply('《✧》 اكتب *وصف* عشان *Flux* يعمل صورتك.');
  }

  try {
    const { key } = await conn.sendMessage(
      m.chat,
      { text: 'ⴵ *Flux* بيعمل صورتك...' },
      { quoted: m }
    );

    const url = `${api.url}/ai/flux?prompt=${encodeURIComponent(prompt)}&apikey=${api.key}`;

    await conn.sendMessage(
      m.chat,
      {
        image: { url },
        caption: `🖼️ *Prompt:* ${prompt}`
      },
      { quoted: m, edit: key }
    );
  } catch (error) {
    console.error(error);
    await m.reply('❏ حصل خطأ وأنا بجهّز طلبك.');
  }
};

handler.help = ['flux'];
handler.tags = ['ia'];
handler.command = ['flux'];

export default handler;