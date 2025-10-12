let handler = async (m, { conn, text, command, usedPrefix }) => {
  const canalID = '120363400241973967@newsletter'; // ← Reemplaza con el ID real

  // 🖼️ Si se responde a un mensaje multimedia o texto
  if (m.quoted) {
    try {
      const quoted = m.quoted;

      // Detecta tipo de mensaje y lo reconstruye
      const msg = quoted.msg || quoted.message;
      const type = Object.keys(msg)[0];

      let content = {};
      switch (type) {
        case 'imageMessage':
          content.image = msg.imageMessage;
          break;
        case 'videoMessage':
          content.video = msg.videoMessage;
          break;
        case 'audioMessage':
          content.audio = msg.audioMessage;
          break;
        case 'documentMessage':
          content.document = msg.documentMessage;
          break;
        case 'stickerMessage':
          content.sticker = msg.stickerMessage;
          break;
        case 'conversation':
        case 'extendedTextMessage':
          content.text = quoted.text;
          break;
        default:
          return m.reply(`⚠️ *Tipo de mensaje no soportado para reconstrucción.*`);
      }

      await conn.sendMessage(canalID, content, { quoted: null });
      return m.reply(`✅ *Mensaje enviado al canal como nuevo, sin marca de reenvío.*`);
    } catch (e) {
      console.error(e);
      return m.reply(`⚠️ *Error al reconstruir y enviar el mensaje.*`);
    }
  }

  // 📝 Si se envía texto directamente
  if (!text) {
    return m.reply(`❌ *Uso incorrecto:*\nResponde a un mensaje o envía texto.\nEjemplo:\n${usedPrefix + command} Hola a todos 🎉`);
  }

  try {
    await conn.sendMessage(canalID, { text });
    m.reply(`✅ *Mensaje enviado correctamente al canal.*`);
  } catch (e) {
    console.error(e);
    m.reply(`⚠️ *Error al enviar el mensaje al canal.*`);
  }
};

handler.help = ['canalmsg <mensaje>'];
handler.tags = ['tools'];
handler.command = ['canalmsg', 'sendcanal'];
handler.owner = true;

export default handler;