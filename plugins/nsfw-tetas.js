import axios from 'axios';

const hotw = '⚠️ El contenido NSFW está desactivado en este grupo.\n> Ve a jalartela a otro lado 😡';
const dev = '> No te la jales 😏';

const API_MAP = {
  'neko': 'https://api.waifu.pics/nsfw/neko',
  'trap': 'https://api.waifu.pics/nsfw/trap',
  'blowjob': 'https://api.waifu.pics/nsfw/blowjob',
  'hentai': 'https://api.waifu.im/search?is_nsfw=true&included_tags=hentai',
  'ero': 'https://api.waifu.im/search?is_nsfw=true&included_tags=ero',
  'ass': 'https://api.waifu.im/search?is_nsfw=true&included_tags=ass',
  'paizuri': 'https://api.waifu.im/search?is_nsfw=true&included_tags=paizuri',
  'oral': 'https://api.waifu.im/search?is_nsfw=true&included_tags=oral',
  'milf': 'https://api.waifu.im/search?is_nsfw=true&included_tags=milf',
  'ecchi': 'https://api.waifu.im/search?is_nsfw=true&included_tags=ecchi',
  'tetas': 'https://nekobot.xyz/api/image?type=boobs',
  'pechos': 'https://nekobot.xyz/api/image?type=boobs',
  'pussy': 'https://nekobot.xyz/api/image?type=pussy',
  'culo': 'https://nekobot.xyz/api/image?type=ass',
  'gonewild': 'https://nekobot.xyz/api/image?type=gonewild',
  '4k': 'https://nekobot.xyz/api/image?type=4k'
};

const NSFW_COMMANDS = Object.keys(API_MAP);

let handler = async (m, { conn, command }) => {
  try {
    if (!global.db.data.chats[m.chat].nsfw && m.isGroup) {
      return m.reply(hotw);
    }

    const apiUrl = API_MAP[command];
    if (!apiUrl) return;

    const { data } = await axios.get(apiUrl);
    const imageUrl = data.url || data.message || (data.images && data.images[0].url);

    if (!imageUrl) throw 'Error';

    await conn.sendMessage(m.chat, {
      image: { url: imageUrl },
      caption: `🥵 ${command}`,
      footer: dev,
      buttons: [
        { buttonId: `next_${command}`, buttonText: { displayText: 'Siguiente' }, type: 1 }
      ],
      headerType: 4
    }, { quoted: m });

  } catch (err) {
    m.reply('❌ Error al obtener contenido.');
  }
};

handler.before = async (m, { conn }) => {
  const id = m.message?.buttonsResponseMessage?.selectedButtonId;
  if (!id) return;

  try {
    const [action, command] = id.split('_'); 
    if (action === 'next' && API_MAP[command]) {
      const { data } = await axios.get(API_MAP[command]);
      const imageUrl = data.url || data.message || (data.images && data.images[0].url);
      await conn.sendMessage(m.chat, {
        image: { url: imageUrl },
        caption: `🥵 ${command}`,
        footer: dev,
        buttons: [{ buttonId: `next_${command}`, buttonText: { displayText: 'Siguiente' }, type: 1 }],
        headerType: 4
      }, { quoted: m });
    }
  } catch (err) {}
};

handler.help = handler.command = NSFW_COMMANDS;
handler.tags = ['nsfw'];
handler.group = true;

export default handler;
