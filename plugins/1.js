const handler = async (m, { conn }) => {
  const usuario = m.sender;
  const nombre = `@${usuario.split('@')[0]}`;
  const gifUrl = ['https://qu.ax/JPZMF.mp4', 'https://qu.ax/LwXNt.mp4']; // Tu GIF personalizado

  // Primer mensaje: solo texto
  await conn.sendMessage(m.chat, {
    text: `🥚💥 ${nombre}, esto te dolerá...`,
    mentions: [usuario]
  });

  // Segundo mensaje: GIF + mensaje
  await conn.sendMessage(m.chat, {
    video: { url: gifUrl },
    gifPlayback: true,
    caption: `😈 Le acabo de romper los huevos a ${nombre}`,
    mentions: [usuario]
  });
};

handler.command = ['rompehuevos'];
handler.register = true;

export default handler;