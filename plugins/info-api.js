import fetch from 'node-fetch';

export default {
  command: ['apistatus', 'api', 'estadoapi'],
  category: 'info',
  run: async (client, m) => {
    try {
      const sentMsg = await client.sendMessage(m.chat, {
        text: '🔮 *Shizuka AI:* \n> Consultando el estado de la API...'
      }, { quoted: m });

      const res = await fetch(`${api.url}/api/status`);
      const json = await res.json();

      if (!json.status || !json.result) {
        return client.sendMessage(m.chat, {
          text: '🥀 *Ups,* \n> No pude obtener el estado de la API.',
          edit: sentMsg.key
        });
      }

      const { status, totalrequest, totalfitur, runtime, domain } = json.result;

      let infoMessage = `✨ ── 𝒮𝒽𝒾𝓏𝓊𝓀𝒶 𝒜𝐼 ── ✨\n\n`;
      infoMessage += `🌐 *Estado de la API*\n\n`;
      infoMessage += `• 📡 *Status:* ${status}\n`;
      infoMessage += `• 📊 *Total Requests:* ${totalrequest}\n`;
      infoMessage += `• 🧩 *Total Features:* ${totalfitur}\n`;
      infoMessage += `• ⏱️ *Runtime:* ${runtime}\n`;
      infoMessage += `• 🏰 *Dominio:* Oculto\n\n`;
      infoMessage += `> 💎 *Información obtenida con éxito.*`;

      await client.sendMessage(m.chat, {
        text: infoMessage,
        edit: sentMsg.key
      });

    } catch (e) {
      console.error(e);
      await client.sendMessage(m.chat, {
        text: '🥀 *Shizuka AI:* \n> Hubo un error inesperado al consultar la API.',
        quoted: m
      });
    }
  }
};