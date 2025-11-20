import fetch from 'node-fetch';

const ADONIX_API_KEY = 'Carlos1234';
const ADONIX_PATH = 'https://api-adonix.ultraplus.click/ai/iavoz';

let handler = async (m, { conn, args }) => {
  console.log('🔔 iavoz invocado'); 

  const text = args.join(' ').trim();
  if (!text) {
    return m.reply('> Escribe un *mensaje* para que la *voz* lo responda.');
  }

  try {
    
    await conn.sendMessage(m.chat, { react: { text: '🔎', key: m.key } });
    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

    const url = `${ADONIX_PATH}?apikey=${ADONIX_API_KEY}&q=${encodeURIComponent(text)}&voice=Jorge`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    await conn.sendMessage(m.chat, { react: { text: '🎧', key: m.key } });

    await conn.sendMessage(
      m.chat,
      {
        audio: buffer,
        mimetype: 'audio/mp4',
        fileName: 'voz.mp4'
      },
      { quoted: m }
    );
  } catch (error) {
    console.error('🧨 [iavoz] Error:', error.message);
    await m.reply('🚫 *Ocurrió un error al invocar la voz ritual.*');
  }
};

handler.help = ['voz'];
handler.tags = ['ia'];
handler.command = ['voz'];

export default handler;