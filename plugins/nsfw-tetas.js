import axios from 'axios';
const hotw = '⚠️ El contenido NSFW está desactivado en este grupo.';
const dev = 'By Carlos'; 

let handler = async (m, { conn, usedPrefix, command }) => {
  try {
    if (!db.data.chats[m.chat].nsfw && m.isGroup) {
      return m.reply(hotw);
    }

    const url = `https://raw.githubusercontent.com/CheirZ/HuTao-Proyect/master/src/JSON/${command}.json`;

    // Retraso opcional para evitar bloqueos por muchas solicitudes seguidas (1s)
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Obtener datos del JSON
    const { data: res } = await axios.get(url, { timeout: 5000 });

    if (!Array.isArray(res) || res.length === 0) 
      throw '⚠️ *No se encontró contenido para este comando.*';

    const randomImage = res[Math.floor(Math.random() * res.length)];

    await conn.sendMessage(m.chat, {
      image: { url: randomImage },
      caption: `🥵 *${command}*`,
      footer: dev,
      templateButtons: [
        {
          index: 1,
          quickReplyButton: {
            displayText: 'Siguiente',
            id: `${usedPrefix + command}`
          }
        }
      ]
    }, { quoted: m });

  } catch (err) {
    console.error('❌ Error en el comando:', err.message);
    m.reply(`*❌ Error archivo no encontrado:*\n> ${err.message || err}`);
  }
};

handler.help = handler.command = [
  'tetas', 'pechos', 'nsfwloli', 'nsfwfoot', 'nsfwass', 'nsfwbdsm', 'nsfwcum', 'nsfwero', 
  'nsfwfemdom', 'nsfwglass', 'nsfworgy', 'yuri', 'yuri2', 'yaoi', 'yaoi2', 
  'panties', 'tetas', 'booty', 'ecchi', 'furro', 'hentai', 'trapito', 
  'imagenlesbians', 'pene', 'porno', 'randomxxx'
];

handler.tags = ['nsfw'];
handler.group = true;

export default handler;