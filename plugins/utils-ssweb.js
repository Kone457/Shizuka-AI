import fetch from "node-fetch";

let handler = async (m, { conn, text }) => {
  if (!text) {
    return conn.reply(m.chat, "《✧》 Por favor, proporciona una URL válida.", m);
  }

  try {
    await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

    const apiUrl = `${global.api.url2}/tools/ssweb?url=${encodeURIComponent(text)}`;
    const res = await fetch(apiUrl);
    const json = await res.json();

    if (!json.status || !json.data?.download) {
      throw new Error("No se pudo generar la captura.");
    }

    const txt = `*» URL:* ${text}`;

    await conn.sendFile(m.chat, json.data.download, "screenshot.png", txt, m);

    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
  } catch (e) {
    console.error(e);
    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
    m.reply(`《✧》 Error al procesar.\n\n*Detalles:* ${e.message}`);
  }
};

handler.help = ["ssweb"];
handler.tags = ["tools"];
handler.command = ["ssweb", "ss"];

export default handler;