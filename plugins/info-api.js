import fetch from 'node-fetch';

export default {
  command: ['apistatus', 'api', 'estadoapi'],
  category: 'info',

  run: async (client, m) => {
    try {
      const msg = await client.sendMessage(m.chat, {
        text: '🔮 *Shizuka AI:* \n> Consultando el estado de la API...'
      }, { quoted: m });

      const response = await fetch(`${api.url}/api/status?apikey=${api.key}`);
      const data = await response.json();

      if (!data || !data.result) {
        return client.sendMessage(m.chat, {
          text: '🥀 *Ups,* \n> No pude obtener el estado de la API.',
          edit: msg.key
        });
      }

      const result = data.result;

      const status = result.status || "Desconocido";
      const totalrequest = result.totalrequest || "0";
      const totalfitur = result.totalfitur || "0";
      const runtime = result.runtime || "0s";
      const domain = result.domain || "Desconocido";
      const creator = data.creator || "Desconocido";

      const text = `✨ ── 𝒮𝒽𝒾𝓏𝓊𝓀𝒶 𝒜𝐼 ── ✨

🌐 *Estado de la API*

• 📡 *Status:* ${status}
• 📊 *Total Requests:* ${totalrequest}
• 🧩 *Total Features:* ${totalfitur}
• ⏱️ *Runtime:* ${runtime}
• 🏰 *Dominio:* xvideos.com
• 👤 *Creator:* ${creator}

> 💎 *Información obtenida con éxito.*`;

      await client.sendMessage(m.chat, {
        text,
        edit: msg.key
      });

    } catch (err) {
      console.error(err);

      await client.sendMessage(m.chat, {
        text: '🥀 *Shizuka AI:* \n> Hubo un error inesperado al consultar la API.',
        quoted: m
      });
    }
  }
};