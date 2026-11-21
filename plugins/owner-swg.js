import * as baileys from "@whiskeysockets/baileys";
import { PassThrough } from "stream";
import ffmpeg from "fluent-ffmpeg";

let handler = async (m, { conn, text }) => {
  let [textoEntrada, colorTexto] = text.split("|");

  let citado = m.quoted || m;
  let caption = citado.caption || textoEntrada;

  let q = citado;
  let mime = q?.mimetype || q?.msg?.mimetype || "";

  const jid = "status@broadcast";

  if (/image/.test(mime)) {
    const buffer = await citado.download().catch(() => null);
    if (!buffer) return m.reply("✿ خطأ في جلب الصورة.");

    await conn.sendMessage(jid, { image: buffer, caption });
    return m.reply("✿ الحالة اترفعت بنجاح.");
  }

  else if (/video/.test(mime)) {
    const buffer = await citado.download().catch(() => null);
    if (!buffer) return m.reply("✿ خطأ في جلب الفيديو.");

    await conn.sendMessage(jid, { video: buffer, caption });
    return m.reply("✿ الحالة اترفعت بنجاح.");
  }

  else if (/audio/.test(mime)) {
    const buffer = await citado.download().catch(() => null);
    if (!buffer) return m.reply("✿ خطأ في جلب الصوت.");

    const audioVoz = await convertirAVoz(buffer);
    const formaOnda = await generarFormaOnda(buffer);

    await conn.sendMessage(jid, {
      audio: audioVoz,
      mimetype: "audio/ogg; codecs=opus",
      ptt: true,
      waveform: formaOnda
    });

    return m.reply("✿ الحالة اترفعت بنجاح.");
  }

  else if (colorTexto) {
    if (!caption) return m.reply("✿ مفيش نص تبعته للحالة.");

    const coloresWA = new Map([
      ["azul", "#34B7F1"],
      ["verde", "#25D366"],
      ["amarillo", "#FFD700"],
      ["naranja", "#FF8C00"],
      ["rojo", "#FF3B30"],
      ["morado", "#9C27B0"],
      ["gris", "#9E9E9E"],
      ["negro", "#000000"],
      ["blanco", "#FFFFFF"],
      ["cian", "#00BCD4"],
    ]);

    const textoColor = colorTexto.toLowerCase();
    let color = null;

    for (const [nombre, codigo] of coloresWA.entries()) {
      if (textoColor.includes(nombre)) {
        color = codigo;
        break;
      }
    }

    if (!color) return m.reply("✿ مفيش لون صحيح.");

    await conn.sendMessage(jid, { text: caption, backgroundColor: color });
    return m.reply("✿ الحالة اتنشرت بنجاح.");
  }

  else {
    return m.reply("✿ رد على ميديا (صورة/فيديو/صوت) أو ابعت نص مع لون.");
  }
};

handler.help = ['سواب', 'ابلودسواب'];
handler.command = ["swp", "upswp", 'سواب', 'ابلودسواب'];
handler.tags = ["tools"];
handler.owner = true;

async function convertirAVoz(inputBuffer) {
  return new Promise((resolve, reject) => {
    const entrada = new PassThrough();
    const salida = new PassThrough();
    const chunks = [];

    entrada.end(inputBuffer);

    ffmpeg(entrada)
      .noVideo()
      .audioCodec("libopus")
      .format("ogg")
      .audioBitrate("48k")
      .audioChannels(1)
      .audioFrequency(48000)
      .outputOptions([
        "-map_metadata", "-1",
        "-application", "voip",
        "-compression_level", "10",
        "-page_duration", "20000",
      ])
      .on("error", reject)
      .on("end", () => resolve(Buffer.concat(chunks)))
      .pipe(salida, { end: true });

    salida.on("data", c => chunks.push(c));
  });
}

async function generarFormaOnda(inputBuffer, barras = 64) {
  return new Promise((resolve, reject) => {
    const inputStream = new PassThrough();
    inputStream.end(inputBuffer);

    const chunks = [];

    ffmpeg(inputStream)
      .audioChannels(1)
      .audioFrequency(16000)
      .format("s16le")
      .on("error", reject)
      .on("end", () => {
        const rawData = Buffer.concat(chunks);
        const muestras = rawData.length / 2;

        const amplitudes = [];
        for (let i = 0; i < muestras; i++) {
          let val = rawData.readInt16LE(i * 2);
          amplitudes.push(Math.abs(val) / 32768);
        }

        let tamañoBloque = Math.floor(amplitudes.length / barras);
        let promedio = [];

        for (let i = 0; i < barras; i++) {
          let bloque = amplitudes.slice(i * tamañoBloque, (i + 1) * tamañoBloque);
          promedio.push(bloque.reduce((a, b) => a + b, 0) / bloque.length);
        }

        let max = Math.max(...promedio);
        let normalizado = promedio.map(v => Math.floor((v / max) * 100));

        let buffer = Buffer.from(new Uint8Array(normalizado));
        resolve(buffer.toString("base64"));
      })
      .pipe()
      .on("data", chunk => chunks.push(chunk));
  });
}

export default handler;