import fetch from "node-fetch";

let handler = async (m, { conn, text }) => {
  if (!text) {
    return conn.reply(m.chat, "《✧》 من فضلك اكتب اسم أو ID بوكيمون.", m);
  }

  try {
    await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

    const apiUrl = `${global.api.url2}/tools/pokemon?query=${encodeURIComponent(text)}&language=es`;
    const res = await fetch(apiUrl);
    const json = await res.json();

    if (!json.status || !json.data) throw new Error("مقدرتش ألاقي البوكيمون.");

    const p = json.data;

    const txt = `*乂 ب و ك ي د ي ك س 乂*\n\n`
      + `*» Nombre:* ${p.name}\n`
      + `*» ID:* ${p.id}\n`
      + `*» الوصف:* ${p.description}\n`
      + `*» Tipos:* ${p.types.join(", ")}\n`
      + `*» Habilidades:* ${p.abilities.join(", ")}\n`
      + `*» Altura:* ${p.height}\n`
      + `*» Peso:* ${p.weight}\n`
      + `*» Experiencia Base:* ${p.base_experience}\n`
      + `*» النوع:* ${p.gender}\n`
      + `*» مجموعات البيض:* ${p.egg_groups.join(", ")}\n`
      + `*» Color:* ${p.color}\n`
      + `*» Forma:* ${p.shape}\n`
      + `*» الموطن:* ${p.habitat}\n`
      + `*» نسبة الصيد:* ${p.capture_rate}\n`
      + `*» Felicidad base:* ${p.base_happiness}\n\n`
      + `*» الإحصائيات:*\n`
      + `   HP: ${p.stats.hp}\n`
      + `   Ataque: ${p.stats.attack}\n`
      + `   Defensa: ${p.stats.defense}\n`
      + `   At. Esp.: ${p.stats["special-attack"]}\n`
      + `   Def. Esp.: ${p.stats["special-defense"]}\n`
      + `   Velocidad: ${p.stats.speed}\n\n`
      + `*» Objetos:* ${p.held_items.join(", ")}\n`
      + `*» Formas:* ${p.forms.join(", ")}\n`
      + `*» الألعاب:* ${p.game_indices.slice(0, 10).join(", ")}... (+${p.game_indices.length - 10} أكتر)\n\n`
      + `*» Cry:* ${p.cry}\n`
      + `*» الصورة:* ${p.image}\n`
      + `*» Sprite animado:* ${p.sprite}`;

    await conn.sendFile(m.chat, p.image, "pokemon.png", txt, m);

    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
  } catch (e) {
    console.error(e);
    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
    m.reply(`《✧》 خطأ في جلب البوكيمون.\n\n*التفاصيل:* ${e.message}`);
  }
};

handler.help = ["pokemon"];
handler.tags = ["tools"];
handler.command = ["pokemon"];

export default handler;