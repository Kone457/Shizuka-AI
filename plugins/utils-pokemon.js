import fetch from "node-fetch";

let handler = async (m, { conn, text }) => {
  if (!text) {
    return conn.reply(m.chat, "《✧》 Por favor, indica el nombre o ID de un Pokémon.", m);
  }

  try {
    await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

    const apiUrl = `${global.api.url2}/tools/pokemon?query=${encodeURIComponent(text)}&language=es`;
    const res = await fetch(apiUrl);
    const json = await res.json();

    if (!json.status || !json.data) throw new Error("No se encontró el Pokémon.");

    const p = json.data;

    const txt = `*乂 P O K É D E X 乂*\n\n`
      + `*» Nombre:* ${p.name}\n`
      + `*» ID:* ${p.id}\n`
      + `*» Descripción:* ${p.description}\n`
      + `*» Tipos:* ${p.types.join(", ")}\n`
      + `*» Habilidades:* ${p.abilities.join(", ")}\n`
      + `*» Altura:* ${p.height}\n`
      + `*» Peso:* ${p.weight}\n`
      + `*» Experiencia Base:* ${p.base_experience}\n`
      + `*» Género:* ${p.gender}\n`
      + `*» Grupos de huevo:* ${p.egg_groups.join(", ")}\n`
      + `*» Color:* ${p.color}\n`
      + `*» Forma:* ${p.shape}\n`
      + `*» Hábitat:* ${p.habitat}\n`
      + `*» Tasa de captura:* ${p.capture_rate}\n`
      + `*» Felicidad base:* ${p.base_happiness}\n\n`
      + `*» Estadísticas:*\n`
      + `   HP: ${p.stats.hp}\n`
      + `   Ataque: ${p.stats.attack}\n`
      + `   Defensa: ${p.stats.defense}\n`
      + `   At. Esp.: ${p.stats["special-attack"]}\n`
      + `   Def. Esp.: ${p.stats["special-defense"]}\n`
      + `   Velocidad: ${p.stats.speed}\n\n`
      + `*» Objetos:* ${p.held_items.join(", ")}\n`
      + `*» Formas:* ${p.forms.join(", ")}\n`
      + `*» Juegos:* ${p.game_indices.slice(0, 10).join(", ")}... (+${p.game_indices.length - 10} más)\n\n`
      + `*» Cry:* ${p.cry}\n`
      + `*» Imagen:* ${p.image}\n`
      + `*» Sprite animado:* ${p.sprite}`;

    await conn.sendFile(m.chat, p.image, "pokemon.png", txt, m);

    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
  } catch (e) {
    console.error(e);
    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
    m.reply(`《✧》 Error al consultar el Pokémon.\n\n*Detalles:* ${e.message}`);
  }
};

handler.help = ["pokemon"];
handler.tags = ["tools"];
handler.command = ["pokemon"];

export default handler;