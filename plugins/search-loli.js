/*
import fetch from 'node-fetch';

let handler = async (m, { conn, text }) => {
  try {
    const sender = m.sender;
    const senderName = await conn.getName(sender);


    const imageUrl = `${api.url}/random/loli?apikey=${api.key}`;

    const caption = `✿ Aquí tienes ${senderName} `;

    await conn.sendMessage(
      m.chat,
      {
        image: { url: imageUrl },
        caption,
        mentions: [sender]
      },
      { quoted: m }
    );

  } catch (error) {
    console.error(error);
    m.reply('❏ *Error al obtener la imagen.* Intenta nuevamente más tarde.');
  }
};

handler.help = ['loli'];
handler.tags = ['buscadores'];
handler.command = ['loli'];

export default handler;
*/
import https from 'https'
import http from 'http'

const fetchBuffer = (url) => new Promise((resolve) => {
  const lib = url.startsWith('https') ? https : http
  lib.get(url, (res) => {
    const chunks = []
    res.on('data', (c) => chunks.push(c))
    res.on('end', () => resolve(Buffer.concat(chunks)))
    res.on('error', () => resolve(null))
  }).on('error', () => resolve(null))
})

let handler = async (m, { conn }) => {
  try {
    const sender = m.sender
    const senderName = await conn.getName(sender)

    const imageUrl = `${global.api}/random/loli?apikey=${global.apiKey}`
    const bannerBuf = await fetchBuffer(imageUrl)

    await conn.sendMessage(m.chat, {
      productMessage: {
        title: `✿ Aquí tienes ${senderName}`,
        description: 'Imagen aleatoria de loli',
        thumbnail: bannerBuf || undefined,
        productId: 'loli_random',
        retailerId: '',
        url: '',
        body: '> Toca el botón para ver más',
        footer: '',
        buttons: [{
          name: 'cta_url',
          buttonParamsJson: JSON.stringify({
            display_text: '🔄 Obtener otra',
            url: `${global.api}/random/loli?apikey=${global.apiKey}`
          })
        }]
      }
    }, { quoted: m })

  } catch (error) {
    console.error(error)
    m.reply('❏ *Error al obtener la imagen.* Intenta nuevamente más tarde.')
  }
}

handler.help = ['loli']
handler.tags = ['buscadores']
handler.command = ['loli']

export default handler