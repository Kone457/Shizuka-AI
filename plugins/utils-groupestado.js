import * as baileys from "@whiskeysockets/baileys";
import crypto from "node:crypto";

let handler = async (m, { conn, text }) => {
  let [textoEntrada, colorTexto, url] = text.split('|');

  let id;
  if (url) {
    const codigoInvitacion = url.split('/').pop().split('?')[0];
    let infoGrupo = await conn.groupGetInviteInfo(codigoInvitacion);
    id = infoGrupo.id;
  } else {
    id = m.chat;
  }

  let citado = m.quoted || m;
  let caption = citado.caption || textoEntrada;

  let q = citado;
  let mime = q?.mimetype || q?.msg?.mimetype || '';

  if (/image/.test(mime)) {
    const buffer = await citado.download().catch(() => null);
    if (!buffer) return m.reply('✿ Error al obtener la imagen.');

    const estado = await enviarEstadoGrupo(conn, id, {
      image: buffer,
      caption: caption
    });
    return conn.reply(m.chat, '✿ Estado subido correctamente.', estado);
  }

  else if (/video/.test(mime)) {
    const buffer = await citado.download().catch(() => null);
    if (!buffer) return m.reply('✿ Error al obtener el video.');

    const estado = await enviarEstadoGrupo(conn, id, {
      video: buffer,
      caption: caption
    });
    return conn.reply(m.chat, '✿ Estado subido correctamente.', estado);
  }

  else if (/audio/.test(mime)) {
    const buffer = await citado.download().catch(() => null);
    if (!buffer) return m.reply('✿ Error al obtener el audio.');

    const estado = await enviarEstadoGrupo(conn, id, {
      audio: buffer,
      mimetype: mime || "audio/ogg; codecs=opus",
      ptt: true
    });

    return conn.reply(m.chat, '✿ Estado subido correctamente.', estado);
  }

  else if (colorTexto || caption) {
    const textoFinal = colorTexto ? caption : (textoEntrada || caption);
    if (!textoFinal) return m.reply('✿ No hay texto para subir al estado del grupo.');

    const coloresWA = new Map([
      ['azul',    '#34B7F1'],
      ['verde',   '#25D366'],
      ['amarillo','#FFD700'],
      ['naranja', '#FF8C00'],
      ['rojo',    '#FF3B30'],
      ['morado',  '#9C27B0'],
      ['gris',    '#9E9E9E'],
      ['negro',   '#000000'],
      ['blanco',  '#FFFFFF'],
      ['cian',    '#00BCD4']
    ]);

    let color = '#25D366';
    if (colorTexto) {
      const textoColor = colorTexto.toLowerCase();
      for (const [nombre, codigo] of coloresWA.entries()) {
        if (textoColor.includes(nombre)) {
          color = codigo;
          break;
        }
      }
    }

    const estado = await enviarEstadoGrupo(conn, id, {
      text: textoFinal,
      backgroundColor: color
    });

    return conn.reply(m.chat, '✿ Estado publicado correctamente.', estado);
  }

  else {
    return m.reply('✿ Responde a un medio (imagen/video/audio) o envía texto con color. También puedes usar un link de grupo.');
  }
};

async function enviarEstadoGrupo(conn, jid, contenido) {
  const { backgroundColor } = contenido;
  delete contenido.backgroundColor;

  const contenidoInterno = await baileys.generateWAMessageContent(contenido, {
    upload: conn.waUploadToServer
  });

  const secretoMensaje = crypto.randomBytes(32);

  const finalContent = {
    ...contenidoInterno,
    messageContextInfo: {
      messageSecret: secretoMensaje
    }
  };

  if (backgroundColor && finalContent.extendedTextMessage) {
    finalContent.extendedTextMessage.backgroundArgb = parseInt(backgroundColor.replace('#', '0xFF'), 16);
  }

  const mensaje = baileys.generateWAMessageFromContent(jid, {
    groupStatusMessageV2: {
      message: finalContent
    }
  }, {
    userJid: conn.user.id
  });

  mensaje.message.messageContextInfo = {
    messageSecret: secretoMensaje
  };

  await conn.relayMessage(jid, mensaje.message, {
    messageId: mensaje.key.id,
    additionalAttributes: {
      participant: jid
    }
  });

  return mensaje;
}

handler.help = ["swgc", "upswgc"];
handler.command = ["swgc", "upswgc"];
handler.tags = ["tools"];
handler.admin = true;

export default handler;
