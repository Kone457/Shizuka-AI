import fetch from 'node-fetch';

let handler = async (m, { conn, text }) => {
  try {
    const sender = m.sender;
    const senderName = await conn.getName(sender);

    if (!text) return m.reply('🎨 Ingresa un prompt. Ejemplo: *.dalle islas mágicas*');

   
    const endpoint = `https://api.dorratz.com/v3/ai-image?prompt=${encodeURIComponent(text)}&ratio=9:19`;
    const res = await fetch(endpoint);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();

    const imageUrl = json?.data?.image_link;
    if (!imageUrl) return m.reply('✨ No se pudo generar la imagen.');

    const caption = `🎨 Imagen generada \n🖋 Prompt: ${text}\n✨ Para ${senderName}`;

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
    console.error('❌ Error en dorratz-img:', error);
    m.reply('> *Error al generar la imagen con Dorratz.* Intenta nuevamente más tarde.');
  }
};

handler.help = ['dalle', 'aiimg'];
handler.tags = ['ai'];
handler.command = ['dalle', 'aiimg'];

export default handler;