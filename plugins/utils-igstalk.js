import fetch from "node-fetch";

let handler = async (m, { conn, text }) => {
  if (!text) {
    return conn.reply(m.chat, "《✧》 Por favor, indica el nombre de usuario de Instagram.", m);
  }

  try {
    await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

    const apiUrl = `${global.api.url2}/tools/igstalk?username=${encodeURIComponent(text)}`;
    const res = await fetch(apiUrl);
    const json = await res.json();

    if (!json.status || !json.data) throw new Error("No se encontró el perfil.");

    const ig = json.data;

    const txt = `*» Usuario:* ${ig.username}\n`
      + `*» Nombre:* ${ig.full_name}\n`
      + `*» ID:* ${ig.id}\n`
      + `*» URL:* ${ig.url}\n`
      + `*» Biografía:* ${ig.biography}\n`
      + `*» Privado:* ${ig.private ? "Sí" : "No"}\n`
      + `*» Verificado:* ${ig.verified ? "Sí" : "No"}\n`
      + `*» Publicaciones:* ${ig.posts}\n`
      + `*» Seguidores:* ${ig.followers}\n`
      + `*» Siguiendo:* ${ig.following}\n`
      + `*» Página vinculada:* ${ig.page_name}\n`
      + `*» Pronombres:* ${ig.pronouns}`;

    await conn.sendFile(m.chat, ig.profile_picture, "profile.jpg", txt, m);

    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
  } catch (e) {
    console.error(e);
    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
    m.reply(`《✧》 Error al consultar el perfil.\n\n*Detalles:* ${e.message}`);
  }
};

handler.help = ["igstalk"];
handler.tags = ["tools"];
handler.command = ["igstalk"];

export default handler;