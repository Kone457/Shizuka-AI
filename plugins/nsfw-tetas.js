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

    // Validar que el JSON contenga datos
    if (!Array.isArray(res) || res.length === 0) 
      throw '⚠️ No se encontró contenido para este comando.';

    const randomImage = res[Math.floor(Math.random() * res.length)];

    // Responder con la imagen y los botones
    await conn.sendMessage(m.chat, {
      image: { url: randomImage },
      caption: `🥵 ${command}`,
      footer: dev,
      buttons: [
        {
          buttonId: `${command}_next`,  // Corregido el buttonId
          buttonText: { displayText: 'Siguiente' }
        }
      ],
      viewOnce: true,
      headerType: 4
    }, { quoted: m });

  } catch (err) {
    console.error('❌ Error en el comando:', err.message);
    m.reply(`❌ Error archivo no encontrado:\n> ${err.message || err}`);
  }
};

// Handler para manejar el botón de "Siguiente"
handler.on('message', async (m) => {
  if (m.message && m.message.buttonsResponseMessage) {
    const buttonId = m.message.buttonsResponseMessage.selectedButtonId;
    const command = buttonId.split('_')[0];  // Obtener el comando a partir del buttonId
    const url = `https://raw.githubusercontent.com/CheirZ/HuTao-Proyect/master/src/JSON/${command}.json`;

    try {
      const { data: res } = await axios.get(url, { timeout: 5000 });
      if (!Array.isArray(res) || res.length === 0)
        throw '⚠️ No se encontró contenido para este comando.';

      const randomImage = res[Math.floor(Math.random() * res.length)];

      // Responder con la nueva imagen al presionar "Siguiente"
      await conn.sendMessage(m.chat, {
        image: { url: randomImage },
        caption: `🥵 ${command}`,
        footer: dev,
        buttons: [
          {
            buttonId: `${command}_next`,  // De nuevo, el mismo buttonId
            buttonText: { displayText: 'Siguiente' }
          }
        ],
        viewOnce: true,
        headerType: 4
      }, { quoted: m });

    } catch (err) {
      console.error('❌ Error al obtener la imagen:', err.message);
    }
  }
});

handler.help = handler.command = [
  'tetas', 'pechos', 'nsfwloli', 'nsfwfoot', 'nsfwass', 'nsfwbdsm', 'nsfwcum', 'nsfwero', 
  'nsfwfemdom', 'nsfwglass', 'nsfworgy', 'yuri', 'yuri2', 'yaoi', 'yaoi2', 
  'panties', 'tetas', 'booty', 'ecchi', 'furro', 'hentai', 'trapito', 
  'imagenlesbians', 'pene', 'porno', 'randomxxx'
];

handler.tags = ['nsfw'];
handler.group = true;

export default handler;