import fetch from 'node-fetch';

// 🌸 Voz en cascada estilo Shizuka
const getShizukaVoice = async (phrase) => {
  const sources = [
    `https://myapiadonix.vercel.app/api/adonixvoz?q=${encodeURIComponent(phrase)}`,
    `https://api.sylphy.xyz/voice/shizuka?q=${encodeURIComponent(phrase)}`,
    `https://delirius-apiofc.vercel.app/voice/shizuka?q=${encodeURIComponent(phrase)}`
  ];

  for (const url of sources) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error('Respuesta no válida');
      const buffer = await res.buffer();
      return buffer;
    } catch (err) {
      console.warn(`⚠️ Voz falló en ${url}:`, err.message);
    }
  }

  return null;
};

// 🎙️ Comando principal
let handler = async (m, { conn, text, usedPrefix, command }) => {
  const thumbnailCard = 'https://qu.ax/phgPU.jpg';

  if (!text) {
    await conn.sendMessage(m.chat, {
      text: `🌸 *Shizuka te escucha...*\n🗣️ Por favor, susúrrale lo que quieres que diga\n💡 Ejemplo:\n${usedPrefix + command} Te extraño bajo la luna, Mitsuri~`,
      footer: '🎧 Voz canalizada con ternura',
      contextInfo: {
        externalAdReply: {
          title: 'Voz emocional estilo Shizuka',
          body: 'Convierte tu frase en suspiro ceremonial',
          thumbnailUrl: thumbnailCard,
          sourceUrl: 'https://myapiadonix.vercel.app'
        }
      }
    }, { quoted: m });
    return;
  }

  await conn.sendMessage(m.chat, {
    text: '⏳ *Canalizando la voz...*\n🌺 Shizuka está preparando su susurro emocional',
    footer: '🫧 Ritual de voz en curso',
    contextInfo: {
      externalAdReply: {
        title: 'Preparando la voz...',
        body: 'Esto tomará solo unos segundos',
        thumbnailUrl: thumbnailCard,
        sourceUrl: 'https://myapiadonix.vercel.app'
      }
    }
  }, { quoted: m });

  const audio = await getShizukaVoice(text);
  if (!audio) {
    return m.reply(`
🚫 *Ups... Shizuka se quedó sin voz*

╔═ೋ═══❖═══ೋ═╗
║ 📄 Detalles: No se pudo generar el audio
║ 🔁 Sugerencia: Intenta más tarde o cambia la frase
╚═ೋ═══❖═══ೋ═╝

Pero no te preocupes... Shizuka siempre regresa cuando la necesitas 🌙✨
`.trim());
  }

  const caption = `
╔═ೋ═══❖═══ೋ═╗
║ 🔊 *Voz canalizada por Shizuka* 🔊
║ 📝 Frase: ${text}
║ 🌸 Estilo: susurro emocional y ceremonial
╚═ೋ═══❖═══ೋ═╝

Tu frase se convirtió en melodía suave...  
Como un recuerdo que flota entre pétalos 💫
`.trim();

  await conn.sendMessage(m.chat, {
    audio,
    mimetype: 'audio/mp4',
    ptt: true,
    caption
  }, { quoted: m });
};

handler.command = 'voz', 'susurro', 'ritualshizuka'];
handler.help = ['voz <frase>'];
handler.tags = ['ai'];
export default handler;