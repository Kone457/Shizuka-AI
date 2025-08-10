/*───────────────────────────────────────
  📁 Módulo:     rompehuevos.js
  🧠 Autor:      Carlos
  🛠 Proyecto:   Shizuka-AI
  🔗 GitHub:     https://github.com/Kone457/Shizuka-AI
───────────────────────────────────────*/

const handler = async (m, { conn }) => {
  const autor = m.sender;
  const mencionado = m.mentionedJid?.[0];
  const objetivo = mencionado || autor;
  const nombre = `@${objetivo.split('@')[0]}`;

  // 🎬 Lista de GIFs
  const gifs = [
    'https://sylphy.xyz/download/7KvKOn.mp4',
    'https://sylphy.xyz/download/mPQMW7.jpeg',
    'https://sylphy.xyz/download/eFyjep.mp4',
    'https://sylphy.xyz/download/TZj66W.mp4',
    'https://sylphy.xyz/download/U2x0S7.mp4'
  ];

  // 🗯️ Lista de frases
  const frases = [
    `😈 Le acabo de romper los huevos a ${nombre}`,
    `💀 ${nombre} ya no podrá reproducirse jamás`,
    `🔥 El linaje de ${nombre} ha sido interrumpido`,
    `🥚💥 ${nombre} recibió el golpe ancestral`,
    `🧨 ${nombre} ha sido neutralizado con precisión testicular`,
    `👹 ${nombre} sintió el poder del rompehuevos`,
    `⚔️ ${nombre} fue víctima del ataque más bajo... literalmente`,
    `🎯 ${nombre} recibió un golpe directo a la descendencia`
  ];

  // Selección aleatoria
  const gifUrl = gifs[Math.floor(Math.random() * gifs.length)];
  const frase = frases[Math.floor(Math.random() * frases.length)];

  // Primer mensaje: solo texto
  await conn.sendMessage(m.chat, {
    text: `🥚💥 ${nombre}, esto te dolerá...`,
    mentions: [objetivo]
  });

  // Segundo mensaje: GIF + frase
  await conn.sendMessage(m.chat, {
    video: { url: gifUrl },
    gifPlayback: true,
    caption: frase,
    mentions: [objetivo]
  });
};

handler.command = ['rompehuevos'];
handler.register = true;

export default handler;