
import fetch from 'node-fetch';

const API = 'https://aihorde.net/api/v2';
const API_KEY = '0000000000';
const HEADERS = {
  'Content-Type': 'application/json',
  'apikey': API_KEY,
  'Client-Agent': 'Hina-AI:1.0:WhatsApp'
};

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

let handler = async (m, { conn, args }) => {
  const prompt = args.join(' ').trim();

  if (!prompt) {
    return m.reply('《✧》 اكتب *وصف* عشان تتولد صورتك.');
  }

  try {
    await conn.sendMessage(m.chat, {
      react: { text: '⏳', key: m.key }
    });

    const response = await fetch(`${API}/generate/async`, {
      method: 'POST',
      headers: HEADERS,
      body: JSON.stringify({
        prompt,
        params: {
          n: 1,
          width: 512,
          height: 512,
          steps: 20,
          cfg_scale: 7
        },
        nsfw: false,
        censor_nsfw: true,
        r2: true,
        shared: true
      })
    });

    const data = await response.json();

    if (!response.ok || !data.id) {
      throw new Error(data.message || data.detail || 'مقدرتش أبعت الطلب.');
    }

    const id = data.id;
    let completed = false;

    for (let i = 0; i < 110; i++) {
      await sleep(5000);

      const checkResponse = await fetch(`${API}/generate/check/${id}`, {
        headers: HEADERS
      });

      const check = await checkResponse.json();

      if (!checkResponse.ok) {
        throw new Error(check.message || 'خطأ في الاستعلام عن الطابور.');
      }

      if (check.done) {
        completed = true;
        break;
      }
    }

    if (!completed) {
      throw new Error('التوليد بياخد وقت كبير.\n> جرّب تاني.');
    }

    const resultResponse = await fetch(`${API}/generate/status/${id}`, {
      headers: HEADERS
    });

    const result = await resultResponse.json();

    if (!resultResponse.ok) {
      throw new Error(result.message || 'مقدرتش أرجّع الصورة.');
    }

    const image = result.generations?.[0]?.img;

    if (!image) {
      throw new Error('الطلب خلص من غير ما ترجع صورة.');
    }

    await conn.sendMessage(
      m.chat,
      {
        image: { url: image },
        caption: `*Prompt:* ${prompt}.`
      },
      { quoted: m }
    );

    await conn.sendMessage(m.chat, {
      react: { text: '✓', key: m.key }
    });

  } catch (error) {
    console.error('[AI HORDE]', error);

    await conn.sendMessage(m.chat, {
      react: { text: '❌', key: m.key }
    });

    await m.reply(`❏ *خطأ*\n\n${error.message || 'حصل خطأ وأنا بجهّز صورتك.'}`);
  }
};

handler.help = ['هورد'];
handler.tags = ['ia'];
handler.command = ['horde', 'هورد'];

export default handler;
