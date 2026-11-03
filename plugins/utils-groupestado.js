import * as baileys from "@whiskeysockets/baileys";
import crypto from "node:crypto";

let handler = async (m, { conn, text }) => {
  let [textoEntrada, colorTexto, url] = text ? text.split('|') : [];

  let id;
  if (url) {
    const codigoInvitacion = url.trim().split('/').pop().split('?')[0];
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

    await enviarEstadoGrupo(conn, id, {
      image: buffer,
      caption: caption || ''
    });
    return m.reply('✿ Estado subido correctamente.');
  }

  else if (/video/.test(mime)) {
    const buffer = await citado.download().catch(() => null);
    if (!buffer) return m.reply('✿ Error al obtener el video.');

    await enviarEstadoGrupo(conn, id, {
      video: buffer,
      caption: caption || ''
    });
    return m.reply('✿ Estado subido correctamente.');
  }

  else if (/audio/.test(mime)) {
    const buffer = await citado.download().catch(() => null);
    if (!buffer) return m.reply('✿ Error al obtener el audio.');

    await enviarEstadoGrupo(conn, id, {
      audio: buffer,
      mimetype: mime || "audio/ogg; codecs=opus",
      ptt: true
    });

    return m.reply('✿ Estado subido correctamente.');
  }

  else {
    const textoFinal = textoEntrada || caption || m.text;
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
      const textoColor = colorTexto.trim().toLowerCase();
      for (const [nombre, codigo] of coloresWA.entries()) {
        if (textoColor.includes(nombre)) {
          color = codigo;
          break;
        }
      }
    }

    await enviarEstadoGrupo(conn, id, {
      text: textoFinal,
      backgroundColor: color
    });

    return m.reply('✿ Estado publicado correctamente.');
  }
};

async function enviarEstadoGrupo(conn, jid, contenido) {
  const { backgroundColor } = contenido;
  delete contenido.backgroundColor;

  const contenidoInterno = await baileys.generateWAMessageContent(contenido, {
    upload: conn.waUploadToServer
  });

  const secretoMensaje = crypto.randomBytes(32);

  if (backgroundColor && contenidoInterno.extendedTextMessage) {
    contenidoInterno.extendedTextMessage.backgroundArgb = parseInt(backgroundColor.replace('#', '0xFF'), 16);
  }

  const messageContent = {
    groupStatusMessageV2: {
      message: {
        ...contenidoInterno,
        messageContextInfo: {
          messageSecret: secretoMensaje
        }
      }
    },
    messageContextInfo: {
      messageSecret: secretoMensaje
    }
  };

  const mensaje = baileys.generateWAMessageFromContent(jid, messageContent, {
    userJid: conn.user.id
  });

  await conn.relayMessage(jid, mensaje.message, {
    messageId: mensaje.key.id,
    additionalAttributes: {
      broadcast: 'true'
    }
  });

  return mensaje;
}

handler.help = ["swgc", "upswgc"];
handler.command = ["swgc", "upswgc"];
handler.tags = ["tools"];
handler.admin = true;

export default handler;
