import fetch from 'node-fetch';

const GEMINI_API_KEY = 'AIzaSyDRdEvBR4_9bj3159KsDlgJxux9R-5CMwA';
const GEMINI_MODEL = 'gemini-2.5-flash-lite';
const GEMINI_PATH = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

const handler = async (m, { conn }) => {
  const quoted = m.quoted || m;
  const mime = quoted?.mimetype || '';

  if (!mime.startsWith('image/')) {
    return m.reply('🌸 *Por favor responde a una imagen para que Gemini la describa.*');
  }

  try {
    const { key } = await conn.sendMessage(
      m.chat,
      { text: '🔮 *Gemini está observando la imagen...*' },
      { quoted: m }
    );

    const buffer = await quoted.download();
    const base64Image = buffer.toString('base64');
    const imagePart = {
      inlineData: {
        mimeType: mime,
        data: base64Image
      }
    };

    const res = await fetch(GEMINI_PATH, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            {
              text: 'Describe esta imagen en español. Sé claro, detallado y sensible. No uses ningún otro idioma.'
            },
            imagePart
          ]
        }]
      })
    });

    const json = await res.json();
    const description = json?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!description) {
      return conn.sendMessage(m.chat, {
        text: '⚠️ *Gemini no pudo generar una descripción válida.*',
        edit: key
      });
    }

    const caption = `
╭─「 🖼️ 𝙄𝙈𝘼𝙂𝙀𝙉 」─╮
│ ✨ Descripción: ${description.trim()}
│ 🤖 Modelo: Gemini 2.5 Flash
╰────────────────────╯
`.trim();

    await conn.sendMessage(m.chat, { text: caption, edit: key });

  } catch (err) {
    console.error('🧨 [describir] Error:', err.message);
    await m.reply('🚫 *Ocurrió un error al procesar la imagen.*');
  }
};

handler.help = ['describir'];
handler.tags = ['ia'];
handler.command = ['describir', 'analizar', 'z'];

export default handler;