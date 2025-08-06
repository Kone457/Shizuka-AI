const handler = async (m, { conn }) => {
  const usuario = m.sender;
  const nombre = `@${usuario.split('@')[0]}`;

  const gifUrl = 'https://qu.ax/JPZMF.mp4'; // Tu GIF personalizado

  await conn.sendMessage(m.chat, {
    video: { url: gifUrl },
    gifPlayback: true,
    caption: `🥚💥 ${nombre}, esto te dolerá...`,
    mentions: [usuario]
  });

  await conn.sendMessage(m.chat, {
    text: `😈 Le acabo de romper los huevos a ${nombre}`,
    mentions: [usuario]
  });
};

handler.command = ['rompehuevos'];
handler.register = true;

export default handler;