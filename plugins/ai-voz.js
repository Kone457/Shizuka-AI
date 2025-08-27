import fetch from 'node-fetch';

// 🌸 Voz canalizada vía Adonix
const getShizukaVoice = async (phrase) => {
  try {
    const res = await fetch(`https://myapiadonix.vercel.app/api/adonixvoz?q=${encodeURIComponent(phrase)}`);
    if (!res.ok) throw new Error('Respuesta no válida de Adonix');
    const buffer = await res.buffer();
    return buffer;
  } catch (err) {
    console.warn('⚠️ Adonix falló:', err.message);
    return null;
  }
};

// 🎧 Comando principal
let handler = async (m, { conn, text, usedPrefix, command }) => {
  const thumbnailCard = 'https://qu.ax/phgPU.jpg';

  // 🌙 Validación inicial
  if (!text) {
    await conn.sendMessage(m.chat, {
      text: `
╭─❀ *Shizuka te escucha...* ❀─╮
│ 🗣️ Por favor, susúrrale lo que deseas que diga  
│ 💡 Ejemplo: ${usedPrefix + command} Te extraño bajo la luna, Mitsuri~
╰─⊹⊹⊹⊹⊹⊹⊹⊹⊹⊹⊹⊹⊹─╯
`.trim(),
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

  // 🫧 Mensaje de espera
  await conn.sendMessage(m.chat, {
    text: `
╭─🌙 *Canalizando la voz...* 🌙─╮
│ 🌺 Shizuka está preparando su susurro emocional  
│ ⏳ Esto tomará solo unos segundos...
╰─⊹⊹⊹⊹⊹⊹⊹⊹⊹⊹⊹⊹⊹─╯
`.trim(),
    footer: '🫧 Ritual de voz en curso',
    contextInfo: {
      externalAdReply: {
        title: 'Preparando la voz...',
        body: 'Susurros florales en proceso',
        thumbnailUrl: thumbnailCard,
        sourceUrl: 'https://myapiadonix.vercel.app'
      }
    }
  }, { quoted: m });

  // 🎙️ Obtener audio
  const audio = await getShizukaVoice(text);
  if (!audio) {
    return m.reply(`
╭─🚫 *Ups... Shizuka se quedó sin voz* ─╮
│ 📄 Detalles: No se pudo generar el audio  
│ 🔁 Sugerencia: Intenta más tarde o cambia la frase  
╰─⊹⊹⊹⊹⊹⊹⊹⊹⊹⊹⊹⊹⊹─╯

🌸 Pero no te preocupes...  
Shizuka siempre regresa cuando la necesitas 🌙✨
`.trim());
  }

  // 🌸 Mensaje final
  const caption = `
╭─🔊 *Voz canalizada por Shizuka* ─╮
│ 📝 Frase: ${text}  
│ 🌸 Estilo: susurro emocional y ceremonial  
╰─⊹⊹⊹⊹⊹⊹⊹⊹⊹⊹⊹⊹⊹─╯

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

// 🎀 Registro del comando
handler.command = ['voz', 'susurro', 'ritualshizuka'];
handler.help = ['shizukavoz <frase>'];
handler.tags = 'ai';
export default handler;