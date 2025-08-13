import fetch from 'node-fetch';

let handler = async (m, { text }) => {
  const emoji = '🔍';
  const emoji2 = '📡';
  const msm = '⚠️';

  if (!text) {
    m.reply(`${emoji} Por favor, proporciona el término de búsqueda que deseas realizar en Google.`);
    return;
  }

  const apiUrl = `https://api.vreden.my.id/api/google?query=${encodeURIComponent(text)}`;

  try {
    const response = await fetch(apiUrl);
    const result = await response.json();

    // Validación escénica del estado
    if (response.status !== 200 || !result.result || !result.result.items) {
      m.reply(`${msm} No se encontraron resultados o hubo un error en la respuesta.`);
      return;
    }

    // Construcción ceremonial del mensaje
    let replyMessage = `${emoji2} *Resultados de la búsqueda para:* _${text}_\n\n`;
    result.result.items.slice(0, 3).forEach((item, index) => {
      replyMessage += `🌐 *${index + 1}. ${item.title}*\n`;
      replyMessage += `📝 ${item.snippet}\n`;
      replyMessage += `🔗 [Visitar enlace](${item.link})\n\n`;
    });

    await m.react('✅');
    m.reply(replyMessage);
  } catch (error) {
    console.error(`${msm} Error al realizar la solicitud a la API:`, error);
    m.reply(`${msm} Ocurrió un error al obtener los resultados.`);
  }
};

handler.command = ['google'];

export default handler;