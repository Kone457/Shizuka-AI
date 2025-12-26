let handler = async (m, { conn, text, command, usedPrefix }) => {
  const canalID = '120363400241973967@newsletter';

  if (m.quoted) {
    try {
      const quotedMsg = m.quoted;
      const mtype = quotedMsg.mtype || quotedMsg.type;
      
      // Detectar el tipo de contenido y reconstruir
      if (mtype === 'imageMessage') {
        const media = await quotedMsg.download();
        const caption = quotedMsg.caption || quotedMsg.text || '';
        await conn.sendMessage(canalID, {
          image: media,
          caption: caption,
          mentions: quotedMsg.mentionedJid || []
        });
        
      } else if (mtype === 'videoMessage') {
        const media = await quotedMsg.download();
        const caption = quotedMsg.caption || quotedMsg.text || '';
        await conn.sendMessage(canalID, {
          video: media,
          caption: caption,
          mentions: quotedMsg.mentionedJid || []
        });
        
      } else if (mtype === 'stickerMessage') {
        const media = await quotedMsg.download();
        await conn.sendMessage(canalID, {
          sticker: media
        });
        
      } else if (mtype === 'audioMessage') {
        const media = await quotedMsg.download();
        const isVoice = quotedMsg.ptt || false;
        await conn.sendMessage(canalID, {
          audio: media,
          ptt: isVoice,
          mimetype: quotedMsg.mimetype || 'audio/mpeg'
        });
        
      } else if (mtype === 'documentMessage') {
        const media = await quotedMsg.download();
        const filename = quotedMsg.fileName || 'documento';
        await conn.sendMessage(canalID, {
          document: media,
          fileName: filename,
          mimetype: quotedMsg.mimetype
        });
        
      } else if (mtype === 'conversation' || mtype === 'extendedTextMessage' || quotedMsg.text) {
        // Para mensajes de texto
        const messageText = quotedMsg.text || quotedMsg.caption || '';
        const mentions = quotedMsg.mentionedJid || [];
        
        await conn.sendMessage(canalID, {
          text: messageText,
          mentions: mentions
        });
        
      } else {
        // Para otros tipos de mensajes o reacciones
        const messageText = quotedMsg.text || `📨 Mensaje del bot`;
        await conn.sendMessage(canalID, { text: messageText });
      }
      
      return m.reply(`✅ *Mensaje enviado correctamente al canal.*`);
    } catch (e) {
      console.error(e);
      return m.reply(`⚠️ *Error al enviar el mensaje al canal.*\nDetalles: ${e.message}`);
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