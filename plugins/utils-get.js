import fetch from 'node-fetch';
import { format } from 'util';

let handler = async (m, { conn, args }) => {
  const argsText = args.join(' ').trim();

  if (!argsText) {
    return m.reply('> Ingresa un enlace para realizar la solicitud.');
  }

  if (!/^https?:\/\//.test(argsText)) {
    return m.reply('> Ingresa un enlace válido que comience en *https://* o *http://*');
  }

  try {
    const response = await fetch(argsText);

    const contentLength = response.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > 100 * 1024 * 1024 * 1024) {
      throw new Error(`> *Content-Length excedido:* ${contentLength}`);
    }

    const contentType = response.headers.get('content-type') || '';
    if (!/text|json/.test(contentType)) {
      return conn.sendFile(m.chat, argsText, 'archivo', argsText, m);
    }

    let content = await response.text();
    try {
      content = format(JSON.parse(content));
    } catch {
    }

    const preview = content.length > 65536
      ? content.slice(0, 65536) + '\n\n> *Muy largo el html, quedó truncado el texto.*'
      : content;

    await m.reply(preview);
  } catch (error) {
    console.error(error);
    await m.reply('️> *No se pudo completar la solicitud.* Verifica el enlace o intenta más tarde.');
  }
};

handler.help = ['get'];
handler.tags = ['tools'];
handler.command = ['get'];

export default handler;