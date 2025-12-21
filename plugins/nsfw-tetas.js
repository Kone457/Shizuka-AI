import axios from 'axios';

const hotw = '⚠️ El contenido NSFW está desactivado en este grupo.';
const dev = 'By Carlos';

const NSFW_COMMANDS = [
  'tetas', 'pechos', 'nsfwloli', 'nsfwfoot', 'nsfwass', 'nsfwbdsm', 'nsfwcum', 'nsfwero', 
  'nsfwfemdom', 'nsfwglass', 'nsfworgy', 'yuri', 'yuri2', 'yaoi', 'yaoi2', 
  'panties', 'booty', 'ecchi', 'furro', 'hentai', 'trapito', 
  'imagenlesbians', 'pene', 'porno', 'randomxxx'
];

let handler = async (m, { conn, usedPrefix, command }) => {
  try {
    if (!global.db.data.chats[m.chat].nsfw && m.isGroup) {
      return m.reply(hotw);
    }

    const url = `https://raw.githubusercontent.com/CheirZ/HuTao-Proyect/master/src/JSON/${command}.json`;
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    const { data: res } = await axios.get(url, { timeout: 5000 });

    if (!Array.isArray(res) || res.length === 0) 
      throw '⚠️ No se encontró contenido para este comando.';

    const randomImage = res[Math.floor(Math.random() * res.length)];

    await conn.sendMessage(m.chat, {
      image: { url: randomImage },
      caption: `🥵 ${command}`,
      footer: dev,
      buttons: [
        { buttonId: `next_${command}`, buttonText: { displayText: 'Siguiente' }, type: 1 }
      ],
      headerType: 4
    }, { quoted: m });

  } catch (err) {
    console.error('❌ Error en el comando:', err.message);
    m.reply(`❌ Error archivo no encontrado:\n> ${err.message || err}`);
  }
};

handler.before = async (m, { conn }) => {
  const id = m.message?.buttonsResponseMessage?.selectedButtonId;
  if (!id) return;

  try {
    const [action, command] = id.split('_'); 

    if (action === 'next') {
      const url = `https://raw.githubusercontent.com/CheirZ/HuTao-Proyect/master/src/JSON/${command}.json`;
      const { data: res } = await axios.get(url, { timeout: 5000 });

      if (!Array.isArray(res) || res.length === 0)
        throw '⚠️ No se encontró contenido.';

      const randomImage = res[Math.floor(Math.random() * res.length)];

      await conn.sendMessage(m.chat, {
        image: { url: randomImage },
        caption: `🥵 ${command}`,
        footer: dev,
        buttons: [
          { buttonId: `next_${command}`, buttonText: { displayText: 'Siguiente' }, type: 1 }
        ],
        headerType: 4
      }, { quoted: m });
    }
  } catch (err) {
    console.error('[NSFW-Buttons] Error:', err.message);
  }
};

handler.help = handler.command = NSFW_COMMANDS;
handler.tags = ['nsfw'];
handler.group = true;

export default handler;
