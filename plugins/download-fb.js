let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!global._processedMessages) global._processedMessages = new Set();
  if (global._processedMessages.has(m.key.id)) return;
  global._processedMessages.add(m.key.id);

  if (!text || !/(facebook\.com|fb\.watch|fb\.gg)/.test(text)) {
    return await conn.sendMessage(
      m.chat,
      { text: `《✧》 Proporciona un enlace válido de Facebook.` },
      { quoted: m }
    );
  }

  try {
    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });


    const apiUrl = `${api.url}/download/facebook?url=${encodeURIComponent(text)}&apikey=${api.key}`;

    await conn.sendMessage(
      m.chat,
      {
        video: { url: apiUrl },
        caption: `*✿ Aqui tienes...*`
      },
      { quoted: m }
    );

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
    
  } catch (err) {
    console.error('❏ Error en el plugin de Facebook:', err);
    await conn.sendMessage(
      m.chat,
      { text: `❏ Error al procesar la solicitud.\n❏ Detalles: ${err.message}` },
      { quoted: m }
    );
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
  }
};

handler.help = ['facebook'];
handler.tags = ['descargas'];
handler.command = ['fb', 'facebook'];
handler.group = true;

export default handler;
