import axios from 'axios';
import fetch from 'node-fetch';
import mime from 'mime-types';
import gtts from 'node-gtts';
import { readFileSync, unlinkSync } from 'fs';
import { join } from 'path';

// 🎭 Variables rituales
const botname = 'Shizuka';
const emoji = '✨';
const emoji2 = '🔮';
const rwait = '⏳';
const done = '✅';
const error = '❌';
const msm = '[Shizuka Log]';
const etiqueta = 'TuCreador'; // Cambiar a tu nombre/alias
const vs = 'v1.0.0';
const defaultLang = 'es';

// 🔑 API KEY de Gemini
const GEMINI_API_KEY = "AIzaSyDwBh9DGaV88MW2WHSp7e4bMLv87GMbg8M";

// 🎨 Construir prompt base
function buildPrompt(username) {
  return `Tu nombre es ${botname} y parece haber sido creada por ${etiqueta}. Tu versión actual es ${vs}, tú usas Español. Llamarás a las personas por su nombre ${username}, eres traviesa, mala y respondes con emojis. ${username};`;
}

// 💬 Handler principal
let handler = async (m, { conn, usedPrefix, command, text, args }) => {
  const isQuotedImage = m.quoted && (m.quoted.msg || m.quoted).mimetype && (m.quoted.msg || m.quoted).mimetype.startsWith('image/');
  const username = conn.getName(m.sender);
  const basePrompt = buildPrompt(username);

  if (isQuotedImage) {
    const q = m.quoted;
    const img = await q.download?.();
    if (!img) return conn.reply(m.chat, '✘ Shizuka no pudo descargar la imagen.', m);
    const mimeType = q.mimetype || 'image/png';
    const query = `${emoji} Descríbeme la imagen, explica el contexto y dime quién eres.`;

    try {
      await m.react(rwait);
      const description = await fetchImageBuffer(basePrompt, img, query, mimeType);
      const audio = await tts(description, defaultLang);
      await conn.sendFile(m.chat, audio, 'shizuka.opus', description, m, true);
      await m.react(done);
    } catch (err) {
      console.error(`${msm} Error en análisis de imagen:`, err.response?.data || err.message);
      await m.react(error);
      await conn.reply(m.chat, '✘ Shizuka no pudo analizar la imagen.', m);
    }
  } else {
    const userText = text || (m.quoted?.text || 'Cuéntame algo interesante, Shizuka.');
    try {
      await m.react(rwait);
      const prompt = `${basePrompt}. Responde lo siguiente: ${userText}`;
      console.log(`${msm} Prompt enviado a Gemini:`, prompt);
      const response = await shizukaPrompt(prompt, username);
      const audio = await tts(response, defaultLang);
      await conn.sendFile(m.chat, audio, 'shizuka.opus', response, m, true);
      await m.react(done);
    } catch (err) {
      console.error(`${msm} Error en Gemini:`, err.response?.data || err.message);
      await m.react(error);
      await conn.reply(m.chat, '✘ Shizuka no puede responder a esa pregunta.', m);
    }
  }
};

// 📝 Comando
handler.help = ['vozai <texto>'];
handler.tags = ['ai', 'voz'];
handler.register = true;
handler.command = ['vozai', 'ia', 'chatgpt', 'shizuka'];
handler.group = false;

export default handler;

// 📸 Función Gemini para imágenes
async function fetchImageBuffer(basePrompt, imageBuffer, query, mimeType) {
  try {
    const base64Image = imageBuffer.toString('base64');
    const response = await axios.post(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
      {
        contents: [
          {
            role: "user",
            parts: [
              { text: `${basePrompt}. ${query}` },
              { inlineData: { mimeType, data: base64Image } }
            ]
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': GEMINI_API_KEY
        }
      }
    );

    return response.data?.candidates?.[0]?.content?.[0]?.text || '✘ Shizuka no obtuvo respuesta de la imagen.';
  } catch (error) {
    console.error('[Gemini Img Error]', error.response?.data || error.message);
    throw error;
  }
}

// 💻 Función Gemini para texto
async function shizukaPrompt(fullPrompt, username) {
  try {
    const response = await axios.post(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
      {
        contents: [
          {
            role: "user",
            parts: [{ text: fullPrompt }]
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': GEMINI_API_KEY
        }
      }
    );

    return response.data?.candidates?.[0]?.content?.[0]?.text || '✘ Shizuka no obtuvo respuesta.';
  } catch (error) {
    console.error('[Gemini Error]', error.response?.data || error.message);
    throw error;
  }
}

// 🔊 Función TTS
function tts(text, lang = defaultLang) {
  return new Promise((resolve, reject) => {
    try {
      const ttsEngine = gtts(lang);
      const filePath = join(global.__dirname(import.meta.url), '../tmp', `${Date.now()}.wav`);
      ttsEngine.save(filePath, text, () => {
        const buffer = readFileSync(filePath);
        unlinkSync(filePath);
        resolve(buffer);
      });
    } catch (e) {
      reject(e);
    }
  });
}