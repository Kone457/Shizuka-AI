import axios from 'axios';

const hotw = '⚠️ El contenido NSFW está desactivado en este grupo.';
const dev = 'By Carlos';

let handler = async (m, { conn, usedPrefix, command }) => {
  try {
    
    if (!db.data.chats[m.chat].nsfw && m.isGroup) {
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
        { buttonId: `next_${command}`, buttonText: { displayText: 'Siguiente' }, type: 1 },
        { buttonId: `random_${command}`, buttonText: { displayText: 'Aleatorio' }, type: 1 }
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
    const [action, command] = id.split('_'); // Extraer la acción y el comando del buttonId

    if (action === 'random') {
      
      const randomCommand = handler.command[Math.floor(Math.random() * handler.command.length)];
      const url = `https://raw.githubusercontent.com/CheirZ/HuTao-Proyect/master/src/JSON/${randomCommand}.json`;

      const { data: res } = await axios.get(url, { timeout: 5000 });

      if (!Array.isArray(res) || res.length === 0)
        throw '⚠️ No se encontró contenido para este comando.';

      const randomImage = res[Math.floor(Math.random() * res.length)];

      await conn.sendMessage(m.chat, {
        image: { url: randomImage },
        caption: `🥵 ${randomCommand}`,
        footer: dev,
        buttons: [
          { buttonId: `next_${randomCommand}`, buttonText: { displayText: 'Siguiente' }, type: 1 },
          { buttonId: `random_${randomCommand}`, buttonText: { displayText: 'Aleatorio' }, type: 1 }
        ],
        headerType: 4
      }, { quoted: m });

    } else {
      const url = `https://raw.githubusercontent.com/CheirZ/HuTao-Proyect/master/src/JSON/${command}.json`;

      const { data: res } = await axios.get(url, { timeout: 5000 });

      
      if (!Array.isArray(res) || res.length === 0)
        throw '⚠️ No se encontró contenido para este comando.';

      const randomImage = res[Math.floor(Math.random() * res.length)];

      
      if (action === 'next') {
        await conn.sendMessage(m.chat, {
          image: { url: randomImage },
          caption: `🥵 ${command}`,
          footer: dev,
          buttons: [
            { buttonId: `next_${command}`, buttonText: { displayText: 'Siguiente' }, type: 1 },
            { buttonId: `random_${command}`, buttonText: { displayText: 'Aleatorio' }, type: 1 }
          ],
          headerType: 4
        }, { quoted: m });
      }
    }
  } catch (err) {
    console.error('[NSFW-Buttons] Error:', err.message);
    m.reply('💥 *Error al procesar tu solicitud.*');
  }
};

handler.help = handler.command = [
  'tetas', 'pechos', 'nsfwloli', 'nsfwfoot', 'nsfwass', 'nsfwbdsm', 'nsfwcum', 'nsfwero', 
  'nsfwfemdom', 'nsfwglass', 'nsfworgy', 'yuri', 'yuri2', 'yaoi', 'yaoi2', 
  'panties', 'booty', 'ecchi', 'furro', 'hentai', 'trapito', 
  'imagenlesbians', 'pene', 'porno', 'randomxxx'
];

handler.tags = ['nsfw'];
handler.group = true;

export default handler;