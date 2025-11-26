
let handler = async (m, { conn }) => {
  const caption = `
🔮✨ Bienvenido a *Mistic-Craft* ✨🔮
🌐 Conéctate y únete a la aventura

📡 *IP del servidor:* \`noel.hidencloud.com\`
🔌 *Puerto:* \`24678\`

⚔️ Que la magia te acompañe ⚔️
  `;

  await conn.sendMessage(m.chat, {
    image: { url: "https://files.catbox.moe/h4syyj.jpg" }, 
    caption
  }, { quoted: m });
};

handler.help = ['mc-ip'];
handler.tags = ['info'];
handler.command = ['mc-ip'];

export default handler;