import fetch from "node-fetch";
const handler = async (m, { conn, usedPrefix, command }) => {
  try {
    await m.react("🕓");

    let q = m.quoted ? m.quoted : m;
    let mime = (q.msg || q).mimetype || q.mediaType || "";
    if (!mime) return conn.reply(m.chat, `❀ Por favor, envía una imagen o responde a una imagen con el comando.`, m);
    if (!/image\/(jpe?g|png)/.test(mime)) return m.reply(`✧ El formato del archivo (${mime}) no es compatible. Usa JPG o PNG.`);

    conn.reply(m.chat, `✧ Invocando el ritual de mejora visual...`, m);
    let img = await q.download?.();
    let bufferUrl = await uploadImage(img); // Subimos la imagen a un host temporal
    let enhanced = await enhanceImage(bufferUrl);

    if (!enhanced) throw "No se pudo mejorar la imagen.";

    await conn.sendFile(m.chat, enhanced, "imagen_mejorada.webp", `✨ Imagen ritualizada con éxito.`, m);
    await m.react("✅");
  } catch (e) {
    console.error(e);
    await m.react("✖️");
    m.reply("⚠️ Ocurrió un error durante el ritual. Intenta nuevamente.");
  }
};

handler.help = ["hd"];
handler.tags = ["tools"];
handler.command = ["remini", "hd", "enhance"];

export default handler;

// 🧪 Subida de imagen a Catbox
async function uploadImage(buffer) {
  const form = new FormData();
  form.append("file", buffer, "image.jpg");

  const res = await fetch("https://catbox.moe/user/api.php", {
    method: "POST",
    body: form,
  });

  const text = await res.text();
  if (!text.startsWith("https://")) throw "Error al subir imagen.";
  return text;
}

// 🧙‍♂️ Mejora visual usando la API de Vreden
async function enhanceImage(imageUrl) {
  const api = `https://api.vreden.my.id/api/artificial/aiease/img2img/enhance?url=${encodeURIComponent(imageUrl)}`;
  const res = await fetch(api);
  const json = await res.json();

  if (json.status !== 200 || !json.result?.[0]?.origin) return null;
  return json.result[0].origin;
}