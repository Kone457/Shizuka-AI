import fetch from 'node-fetch';

const GEMINI_API_KEY = 'AIzaSyDRdEvBR4_9bj3159KsDlgJxux9R-5CMwA';

let handler = async (m, { conn, text }) => {
  try {
    const sender = m.sender;
    const senderName = await conn.getName(sender);

    if (!text) return m.reply('🎨 Escribe la descripción de la imagen. Ejemplo: *.gemimg un gato cósmico*');

    
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateImage?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: {
          text: text
        }
      })
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    // Extraer URL de la imagen generada
    const imageUrl = data?.candidates?.[0]?.content?.parts?.[0]?.imageUrl;
    if (!imageUrl) return m.reply('✨ No se pudo generar la imagen.');

    const caption = `🎨 Imagen generada por Gemini\n✨ Para ${senderName}`;

    await conn.sendMessage(
      m.chat,
      {
        image: { url: imageUrl },
        caption,
        mentions: [sender]
      },
      { quoted: m }
    );

  } catch (error) {
    console.error(error);
    m.reply('> *Error al generar la imagen con Gemini.* Intenta nuevamente más tarde.');
  }
};

handler.help = ['dalle'];
handler.tags = ['ai'];
handler.command = ['dalle', 'imagen'];

export default handler;