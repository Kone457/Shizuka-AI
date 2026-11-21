
import fetch from 'node-fetch';

let handler = async (m, { conn, args }) => {
  const text = args.join(' ').trim();

  if (!text) {
    return m.reply('《✧》 اكتب *طلب* عشان *ChatGPT* يرد عليك.');
  }

  try {
    const { key } = await conn.sendMessage(
      m.chat,
      { text: 'ⴵ *ChatGPT* بيجهّز ردك...' },
      { quoted: m }
    );

    
    const res = await fetch(`${api.url2}/ia/chatgpt?q=${encodeURIComponent(text)}`);
    const json = await res.json();

    const response = json?.data;

    if (!response) {
      return conn.reply(m.chat, '❏ مقدرتش أجيب *رد* صحيح.');
    }

    await conn.sendMessage(m.chat, { text: response.trim(), edit: key });
  } catch (error) {
    console.error(error);
    await m.reply('❏ حصل خطأ وأنا بجهّز طلبك.');
  }
};

handler.help = ['شاتجبت'];
handler.tags = ['ia'];
handler.command = ['chatgpt', 'gpt', 'شاتجبت', 'جبيتي'];

export default handler;