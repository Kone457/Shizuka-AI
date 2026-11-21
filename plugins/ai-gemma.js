import fetch from 'node-fetch';

const GEMMA_API = 'http://n3.boxmine.xyz:3026';
const GEMMA_TOKEN = 'Shizuka2026';

let handler = async (m, { conn, args }) => {
  const text = args.join(' ').trim();

  if (!text) {
    return m.reply('《✧》 اكتب *طلب* عشان *Gemma* يرد عليك.');
  }

  try {
    const { key } = await conn.sendMessage(
      m.chat,
      { text: 'ⴵ *Gemma* بيجهّز ردك...' },
      { quoted: m }
    );

    const response = await fetch(`${GEMMA_API}/chat`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GEMMA_TOKEN}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        message: text
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return conn.reply(
        m.chat,
        data?.detail ||
        data?.error ||
        data?.message ||
        '❏ خطأ في Gemma.',
        m
      );
    }

    if (!data?.response) {
      return conn.reply(
        m.chat,
        '❏ Gemma مرجّعش رد صحيح.',
        m
      );
    }

    await conn.sendMessage(
      m.chat,
      {
        text: data.response.trim(),
        edit: key
      }
    );

  } catch (error) {
    console.error('Gemma:', error);

    await conn.reply(
      m.chat,
      '❏ مقدرتش أتصل بـGemma.',
      m
    );
  }
};

handler.help = ['gemma'];
handler.tags = ['ia'];
handler.command = ['gemma'];

export default handler;
