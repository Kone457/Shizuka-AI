import fetch from 'node-fetch';

let handler = async (m, { conn, text }) => {
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

    let message = `✿ *Resultados para:* "${text}"\n` +
                  `✿ *Total encontrados:* ${models.length}\n\n`;

    for (let i = 0; i < models.length; i++) {
      message += formatModel(models[i], i);
    }

    message += `_El enlace de descarga te llevará a la lista de archivos del modelo._`;

    await conn.sendMessage(m.chat, { text: message }, { quoted: m });

  } catch (error) {
    console.error(error);
    m.reply('❏ *Error al buscar modelos.* Intenta nuevamente más tarde.');
  }
};

handler.help = ['modelos <término>'];
handler.tags = ['buscadores'];
handler.command = ['modelos', 'ai', 'hf'];

export default handler;