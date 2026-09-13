import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(`✿ *Ingresa el nombre del modelo a buscar.*`);
  }

  try {
    const query = encodeURIComponent(text);
    const apiUrl = `https://huggingface.co/api/models?search=${query}&limit=50&sort=downloads&direction=-1`;

    const response = await fetch(apiUrl);
    const models = await response.json();

    if (!models || models.length === 0) {
      return m.reply(`❏ *No se encontraron modelos de IA para:* "${text}"`);
    }

    const formatModel = (model, index) => {
      const modelId = model.id;
      const author = model.author || 'Desconocido';
      const downloads = model.downloads ? model.downloads.toLocaleString() : '0';
      const likes = model.likes ? model.likes.toLocaleString() : '0';
      const lastMod = model.lastModified
        ? new Date(model.lastModified).toLocaleDateString('es-ES', {
            year: 'numeric', month: 'short', day: 'numeric'
          })
        : 'N/A';
      const directLink = `https://huggingface.co/${modelId}/tree/main`;

      return (
        `*${index + 1}. ${modelId}*\n` +
        `   ◦ *Autor:* ${author}\n` +
        `   ◦ *Descargas:* ${downloads}\n` +
        `   ◦ *Likes:* ${likes}\n` +
        `   ◦ *Actualizado:* ${lastMod}\n` +
        `   ◦ *Descarga:* ${directLink}\n\n`
      );
    };

    const header = `✿ *Resultados para:* "${text}"\n` +
                   `✿ *Total encontrados:* ${models.length}\n\n`;

    const CHUNK_SIZE = 10;
    let buffer = header;

    for (let i = 0; i < models.length; i++) {
      const block = formatModel(models[i], i);

      if ((buffer + block).length > 35000) {
        await conn.sendMessage(m.chat, { text: buffer }, { quoted: m });
        buffer = '';
        await new Promise(r => setTimeout(r, 800));
      }

      buffer += block;

      if ((i + 1) % CHUNK_SIZE === 0) {
        buffer += `_Mostrando resultados ${i - CHUNK_SIZE + 2} - ${i + 1} de ${models.length}_\n\n`;
        await conn.sendMessage(m.chat, { text: buffer }, { quoted: m });
        buffer = '';
        await new Promise(r => setTimeout(r, 800));
      }
    }

    if (buffer.trim().length > 0) {
      await conn.sendMessage(m.chat, { text: buffer }, { quoted: m });
    }

  } catch (error) {
    console.error(error);
    m.reply('❏ *Error al buscar modelos.* Intenta nuevamente más tarde.');
  }
};

handler.help = ['modelos <término>'];
handler.tags = ['buscadores'];
handler.command = ['modelos', 'ai', 'hf'];

export default handler;