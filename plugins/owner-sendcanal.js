let handler = async (m, { conn, text, command, usedPrefix }) => {
  const canalID = '120363400241973967@newsletter';

  if (m.quoted) {
    try {
      // Obtener el mensaje citado
      const quotedMsg = m.quoted;
      
      // Determinar el tipo de mensaje y reconstruirlo
      if (quotedMsg.type === 'imageMessage' || quotedMsg.type === 'stickerMessage' || quotedMsg.type === 'videoMessage') {
        // Para medios (imágenes, stickers, videos)
        const media = await quotedMsg.download();
        const caption = quotedMsg.caption || '';
        const mimetype = quotedMsg.mimetype || '';
        
        if (quotedMsg.type === 'imageMessage') {
          await conn.sendMessage(canalID, {
            image: media,
            caption: caption,
            mimetype: mimetype
          });
        } else if (quotedMsg.type === 'videoMessage') {
          await conn.sendMessage(canalID, {
            video: media,
            caption: caption,
            mimetype: mimetype
          });
        } else if (quotedMsg.type === 'stickerMessage') {
          await conn.sendMessage(canalID, {
            sticker: media,
            mimetype: mimetype
          });
        }
      } else if (quotedMsg.type === 'audioMessage') {
        // Para audios
        const audio = await quotedMsg.download();
        const mimetype = quotedMsg.mimetype || '';
        const ptt = quotedMsg.ptt || false;
        
        await conn.sendMessage(canalID, {
          audio: audio,
          mimetype: mimetype,
          ptt: ptt
        });
      } else if (quotedMsg.type === 'documentMessage') {
        // Para documentos
        const document = await quotedMsg.download();
        const mimetype = quotedMsg.mimetype || '';
        const fileName = quotedMsg.fileName || 'documento';
        
        await conn.sendMessage(canalID, {
          document: document,
          mimetype: mimetype,
          fileName: fileName
        });
      } else if (quotedMsg.text) {
        // Para texto simple
        await conn.sendMessage(canalID, {
          text: quotedMsg.text
        });
      } else {
        // Si no se puede determinar el tipo, enviar como reenviado
        await conn.copyNForward(canalID, quotedMsg.fakeObj || quotedMsg, true);
      }
      
      return m.reply(`✅ *Mensaje enviado correctamente al canal.*`);
    } catch (e) {
      console.error(e);
      return m.reply(`⚠️ *Error al enviar el mensaje al canal.*\nVerifica que el ID del canal sea correcto y que el bot tenga permisos para enviar mensajes.`);
    }
  }

  if (!text) {
    return m.reply(`❌ *Uso incorrecto:*\nPuedes responder a un mensaje multimedia o enviar texto directamente.\nEjemplo:\n${usedPrefix + command} Hola a todos 🎉`);
  }

  try {
    await conn.sendMessage(canalID, { text });
    m.reply(`✅ *Mensaje enviado correctamente al canal.*`);
  } catch (e) {
    console.error(e);
    m.reply(`⚠️ *Error al enviar el mensaje al canal.*\nVerifica que el ID del canal sea correcto y que el bot tenga permisos para enviar mensajes.`);
  }
};

handler.help = ['sendcanal <mensaje>'];
handler.tags = ['owner'];
handler.command = ['sendcanal'];
handler.owner = true;

export default handler;