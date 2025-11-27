import axios from "axios";

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return conn.reply(m.chat, `⚠️ Por favor, ingresa un término para generar una imagen.`, m);
  }

  
  if (m.react) await m.react('🕓');

  try {
    const result = await fluximg.create(text);

    if (result && result.imageLink) {
      if (m.react) await m.react('✅');
      await conn.sendMessage(
        m.chat,
        {
          image: { url: result.imageLink },
          caption: `*\`Resultados De:\`* ${text}`,
        },
        { quoted: m }
      );
    } else {
      throw new Error("⚠️ No se pudo crear la imagen. Intenta otra vez.");
    }
  } catch (error) {
    console.error("Error en handler flux:", error);
    if (m.react) await m.react('💥');
    conn.reply(m.chat, `💥 Error al crear la imagen: ${error.message}`, m);
  }
};

handler.help = ["flux *<texto>*"];
handler.tags = ["ai"];
handler.command = ["flux"];

export default handler;

const fluximg = {
  defaultRatio: "2:3",

  create: async (query) => {
    try {
      const response = await axios.get(
        `https://1yjs1yldj7.execute-api.us-east-1.amazonaws.com/default/ai_image`,
        {
          params: {
            prompt: query,
            aspect_ratio: fluximg.defaultRatio,
          },
          headers: {
            accept: "application/json",
            "user-agent": "Postify/1.0.0",
          },
        }
      );

      
      if (response.data && response.data.image_link) {
        return { imageLink: response.data.image_link };
      } else if (response.data.result?.image_link) {
        return { imageLink: response.data.result.image_link };
      } else {
        throw new Error("Respuesta inválida de la API");
      }
    } catch (error) {
      console.error("Error en fluximg.create:", error);
      throw error;
    }
  },
};