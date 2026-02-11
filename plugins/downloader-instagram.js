import fetch from 'node-fetch';

export default {
  command: ['instagram', 'ig', 'igdl', 'reel'],
  category: 'downloader',
  run: async (client, m, args, command) => {

    const url = args[0]

    if (!url) {
      return m.reply('✨ *Uso correcto:* Ingrese un enlace de Instagram (Reel, Post o IGTV).')
    }

    if (!url.match(/instagram\.com\/(p|reel|share|tv|stories)\//)) {
      return m.reply('❌ El enlace no parece válido. Asegúrate de que sea un link de Instagram.')
    }

    try {
      
      await m.reply('> 📥 *Extrayendo contenido de Instagram...*')

      const res = await fetch(`${api.url}/download/instagram?url=${encodeURIComponent(url)}`)
      const json = await res.json()

      if (!json.status || !json.result || !json.result.dl) {
        return m.reply('❌ No se pudo obtener el contenido. El perfil podría ser privado o el link expiró.')
      }

      const dl = json.result.dl;
      

      let type = 'video';
      if (dl.includes('.jpg') || dl.includes('.png') || dl.includes('.jpeg') || dl.includes('webp')) {
        type = 'image';
      }

      await client.sendMessage(
        m.chat,
        {
          [type]: { url: dl },
          caption: "Aquí tienes 😘"
        },
        { quoted: m }
      )

    } catch (e) {
      console.error(e)
      await m.reply('❌ Ocurrió un error al conectar con el servidor de Instagram.')
    }
  }
};