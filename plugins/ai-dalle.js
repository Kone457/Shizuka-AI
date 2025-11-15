import fetch from 'node-fetch';

let handler = async (m, { conn, text }) => {
  try {
    const sender = m.sender;
    const senderName = await conn.getName(sender);

    if (!text) return m.reply('🎨 Ingresa un prompt. Ejemplo: *.dalle islas mágicas*');

    // Construir la URL con el prompt
    const endpoint = `https://api.vreden.my.id/api/v1/artificial/text2img?prompt=${encodeURIComponent(text)}`;
    const res = await fetch(endpoint);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();

    const imageUrl = json?.result?.download;
    if (!imageUrl) return m.reply('✨ No se pudo generar la imagen.');

    const caption = `🎨 Imagen generada por dalle\n🖋 Prompt: ${json.result.prompt}\n✨ Para ${senderName}`;

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
    console.error('❌ Error en vreden-img:', error);
    m.reply('> *Error al generar la imagen con dalle.* Intenta nuevamente más tarde.');
  }
};

handler.help = ['dalle'];
handler.tags = ['ai'];
handler.command = ['dalle'];

export default handler;