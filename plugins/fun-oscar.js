/*───────────────────────────────────────
  📁 Módulo:     oscar.js
  🧠 Autor:      Carlos
  🛠 Proyecto:   Shizuka-AI
  🔗 GitHub:     https://github.com/Kone457/Shizuka-AI
───────────────────────────────────────*/

const handler = async (m, { conn }) => {
  const autor = m.sender;
  const mencionado = m.mentionedJid?.[0];
  const objetivo = mencionado || autor;
  const nombre = `@${objetivo.split('@')[0]}`;

  const imageUrl = 'https://qu.ax/GNebj.jpg';
  const thumbnailUrl = 'https://qu.ax/MvYPM.jpg';

  const contextInfo = {
    externalAdReply: {
      title: '🤤 Oscar - soñando',
      body: 'Una imagen que susurra desde el otro lado...',
      mediaType: 1,
      previewType: 0,
      sourceUrl: imageUrl,
      thumbnailUrl
    }
  };

  const caption = `🤤 *Sueña Oscar...*\n> Pero recuerda, ella no te quiere 😈`;

  try {
    await conn.sendMessage(m.chat, {
      image: { url: imageUrl },
      caption,
      contextInfo,
      mentions: [objetivo]
    });
  } catch (err) {
    console.error('💥 Error en el comando Oscar:', err.message);
    await conn.sendMessage(m.chat, {
      text: '*⚠️ No se pudo enviar la imagen.*\n\n> 🧵 El hilo visual se ha enredado...',
      contextInfo: {
        externalAdReply: {
          title: '🤤 Oscar - en sus sueños húmedos',
          body: 'Error en la conexión estética...',
          mediaType: 1,
          previewType: 0,
          sourceUrl: imageUrl,
          thumbnailUrl
        }
      }
    });
  }
};

handler.command = ['oscar'];
handler.register = true;

export default handler;