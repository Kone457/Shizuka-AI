import fetch from 'node-fetch';

let handler = async (m, { conn, text }) => {
  try {
    const sender = m.sender;
    const senderName = await conn.getName(sender);

    if (!text) return m.reply('🎨 Ingresa un prompt. Ejemplo: *.dalle islas mágicas*');

    
    const { key } = await conn.sendMessage(
      m.chat,
      { text: '> 🎨 *Estoy* generando tu imagen, espera un momento...' },
      { quoted: m }
    );

    
    const endpoint = `https://api-faa.my.id/faa/ai-text2img-pro?prompt=${encodeURIComponent(text)}`;
    const res = await fetch(endpoint);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    
    const buffer = await res.buffer();

    const caption = `🎨 Imagen generada\n🖋 Prompt: ${text}\n✨ Para ${senderName}`;

    await conn.sendMessage(
      m.chat,
      {
        image: buffer,
        caption,
        mentions: [sender]
      },
      { quoted: m, edit: key }
    );

  } catch (error) {
    console.error('❌ Error en faa-img:', error);
    m.reply('> *Error al generar la imagen.* Intenta nuevamente más tarde.');
  }
};

handler.help = ['dalle'];
handler.tags = ['ai'];
handler.command = ['dalle'];

export default handler;