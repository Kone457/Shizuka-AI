
import fetch from 'node-fetch';

const API = 'https://aihorde.net/api/v2';
const API_KEY = '0000000000';
const HEADERS = {
  'Content-Type': 'application/json',
  'apikey': API_KEY,
  'Client-Agent': 'Shizuka-AI:1.0:WhatsApp'
};

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

let handler = async (m, { conn, args }) => {
  const prompt = args.join(' ').trim();

  if (!prompt) {
    return m.reply('《✧》 Ingresa un *prompt* para que *AI Horde* genere tu imagen.');
  }

  let key;

  try {
    const msg = await conn.sendMessage(
      m.chat,
      { text: 'ⴵ *AI Horde* está preparando tu generación...\n\n✧ Enviando solicitud a la cola gratuita.' },
      { quoted: m }
    );

    key = msg.key;

    const response = await fetch(`${API}/generate/async`, {
      method: 'POST',
      headers: HEADERS,
      body: JSON.stringify({
        prompt,
        params: {
          n: 1,
          width: 1024,
          height: 1024,
          steps: 25,
          cfg_scale: 7
        },
        nsfw: false,
        censor_nsfw: true,
        r2: true,
        shared: true
      })
    });

    const data = await response.json();

    if (!response.ok || !data.id) {
      throw new Error(data.message || data.detail || 'No se pudo enviar la solicitud.');
    }

    const id = data.id;
    let completed = false;
    let lastUpdate = 0;

    for (let i = 0; i < 110; i++) {
      await sleep(5000);

      const checkResponse = await fetch(`${API}/generate/check/${id}`, {
        headers: HEADERS
      });

      const check = await checkResponse.json();

      if (!checkResponse.ok) {
        throw new Error(check.message || 'Error consultando la cola.');
      }

      if (check.done) {
        completed = true;
        break;
      }

      if (Date.now() - lastUpdate >= 15000) {
        lastUpdate = Date.now();

        const position = check.queue_position ?? 'Calculando';
        const waiting = check.waiting ?? 0;
        const processing = check.processing ?? 0;

        await conn.sendMessage(
          m.chat,
          {
            text: `ⴵ *AI Horde · Generando imagen*\n\n✧ Posición en cola: ${position}\n✧ Solicitudes esperando: ${waiting}\n✧ En procesamiento: ${processing}...`,
          },
          { quoted: m, edit: key }
        );
      }
    }

    if (!completed) {
      throw new Error('La generación está tardando demasiado. Inténtalo nuevamente.');
    }

    const resultResponse = await fetch(`${API}/generate/status/${id}`, {
      headers: HEADERS
    });

    const result = await resultResponse.json();

    if (!resultResponse.ok) {
      throw new Error(result.message || 'No se pudo recuperar la imagen.');
    }

    const image = result.generations?.[0]?.img;

    if (!image) {
      throw new Error('Solicitud terminada, no se devolvió ninguna imagen.');
    }

    await conn.sendMessage(
      m.chat,
      {
        image: { url: image },
        caption: `*Prompt:* ${prompt}.`
      },
      { quoted: m }
    );

    await conn.sendMessage(
      m.chat,
      { text: '✓ *Generación completada correctamente.*' },
      { quoted: m, edit: key }
    );

  } catch (error) {
    console.error('[AI HORDE]', error);

    const message = `❏ *Error en AI Horde*\n\n${error.message || 'Ocurrió un error al generar tu imagen.'}`;

    if (key) {
      await conn.sendMessage(
        m.chat,
        { text: message },
        { quoted: m, edit: key }
      ).catch(() => m.reply(message));
    } else {
      await m.reply(message);
    }
  }
};

handler.help = ['horde'];
handler.tags = ['ia'];
handler.command = ['horde'];

export default handler;
