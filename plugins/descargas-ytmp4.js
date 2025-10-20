import fetch from "node-fetch";
import axios from 'axios';

// Constantes
const MAXFILESIZE = 280 * 1024 * 1024;
const VIDEO_THRESHOLD = 70 * 1024 * 1024;
const HEAVYFILETHRESHOLD = 100 * 1024 * 1024;
const REQUEST_LIMIT = 3;
const REQUESTWINDOWMS = 10000;
const COOLDOWN_MS = 120000;

// Estado
const requestTimestamps = [];
let isCooldown = false;
let isProcessingHeavy = false;

// Validación de URL de YouTube
const isValidYouTubeUrl = (url) =>
  /^(?:https?:\/\/)?(?:www\.|m\.|music\.)?youtu\.?be(?:\.com)?\/?.*(?:watch|embed)?(?:\?v=|v\/|\/)?([\w\-_]+)&?/.test(url);

// Formateo de tamaño
function formatSize(bytes) {
  if (!bytes || isNaN(bytes)) return 'Desconocido';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let i = 0;
  bytes = Number(bytes);
  while (bytes >= 1024 && i < units.length - 1) {
    bytes /= 1024;
    i++;
  }
  return `${bytes.toFixed(2)} ${units[i]}`;
}

// Obtener tamaño del archivo
async function getSize(url) {
  try {
    const response = await axios.head(url, { timeout: 10000 });
    const size = parseInt(response.headers['content-length'], 10);
    if (!size) throw new Error('Tamaño no disponible');
    return size;
  } catch (e) {
    throw new Error('No se pudo obtener el tamaño del archivo');
  }
}

// Descarga usando API de Vreden con calidad 360p
async function ytdl(url) {
  try {
    const apiUrl = `https://api.vreden.my.id/api/v1/download/youtube/video?url=${encodeURIComponent(url)}&quality=360`;
    const res = await axios.get(apiUrl, { timeout: 15000 });

    if (!res.data?.status || !res.data?.result?.download?.url) {
      throw new Error('No se pudo obtener la URL de descarga');
    }

    const { title } = res.data.result.metadata;
    const downloadUrl = res.data.result.download.url;
    return { url: downloadUrl, title: title || 'Video sin título' };
  } catch (e) {
    throw new Error(`Error en la descarga: ${e.message}`);
  }
}

// Verificar límite de solicitudes
const checkRequestLimit = () => {
  const now = Date.now();
  requestTimestamps.push(now);
  while (requestTimestamps.length > 0 && now - requestTimestamps[0] > REQUESTWINDOWMS) {
    requestTimestamps.shift();
  }
  if (requestTimestamps.length >= REQUEST_LIMIT) {
    isCooldown = true;
    setTimeout(() => {
      isCooldown = false;
      requestTimestamps.length = 0;
    }, COOLDOWN_MS);
    return false;
  }
  return true;
};

// Handler principal
let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return conn.reply(m.chat, `👉 Uso: ${usedPrefix}${command} https://youtube.com/watch?v=Cr8K88UcO0s`, m);
  }

  if (!isValidYouTubeUrl(text)) {
    await m.react('🔴');
    return m.reply('🚫 Enlace de YouTube inválido');
  }

  if (isCooldown || !checkRequestLimit()) {
    await m.react('🔴');
    return conn.reply(m.chat, '⏳ Demasiadas solicitudes rápidas. Por favor, espera 2 minutos.', m);
  }
  if (isProcessingHeavy) {
    await m.react('🔴');
    return conn.reply(m.chat, '⏳ Espera, estoy procesando un archivo pesado.', m);
  }

  await m.react('📀');
  try {
    const { url, title } = await ytdl(text);
    const size = await getSize(url);

    if (!size) {
      await m.react('🔴');
      throw new Error('No se pudo determinar el tamaño del video');
    }

    if (size > MAXFILESIZE) {
      await m.react('🔴');
      throw new Error('♡ No puedo procesar esta descarga porque traspasa el límite de descarga');
    }

    if (size > HEAVYFILETHRESHOLD) {
      isProcessingHeavy = true;
      await conn.reply(m.chat, '🤨 Espera, estoy lidiando con un archivo pesado', m);
    }

    await m.react('✅️');
    const caption = `💌 ${title}\n> ⚖️ Peso: ${formatSize(size)}\n> 🌎 URL: ${text}`;
    const isSmallVideo = size < VIDEO_THRESHOLD;

    const buffer = await (await fetch(url)).buffer();
    await conn.sendFile(
      m.chat,
      buffer,
      `${title}.mp4`,
      caption,
      m,
      null,
      {
        mimetype: 'video/mp4',
        asDocument: !isSmallVideo,
        filename: `${title}.mp4`
      }
    );

    await m.react('🟢');
    isProcessingHeavy = false;
  } catch (e) {
    await m.react('🔴');
    await m.reply(`❌ Error: ${e.message || 'No se pudo procesar la solicitud'}`);
    isProcessingHeavy = false;
  }
};

handler.help = ['ytmp4 <URL>'];
handler.command = ['ytmp4'];
handler.tags = ['descargas'];
handler.diamond = true;

export default handler;