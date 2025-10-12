import { downloadContentFromMessage } from '@whiskeysockets/baileys';
import fs from 'fs';
import path from 'path';

let handler = async (m, { conn, text, command, usedPrefix }) => {
  const canalID = '120363400241973967@newsletter'; // ← Reemplaza con el ID real

  // 🖼️ Si se responde a un mensaje multimedia
  if (m.quoted) {
    try {
      const quoted = m.quoted;
      const msg = quoted.msg || quoted.message;
      const type = Object.keys(msg)[0];
      const content = msg[type];

      // Detecta tipo de media y canal de descarga
      const stream = await downloadContentFromMessage(content, type.replace('Message', ''));
      const buffer = [];
      for await (const chunk of stream) buffer.push(chunk);
      const media = Buffer.concat(buffer);

      // Define el tipo de envío
      let sendOpts = {};
      if (type === 'imageMessage') sendOpts = { image: media };
      else if (type === 'videoMessage') sendOpts = { video: media };
      else if (type === 'audioMessage') sendOpts = { audio: media, mimetype: content.mimetype };
      else if (type === 'documentMessage') sendOpts = { document: media, mimetype: content.mimetype, fileName: content.fileName || 'archivo' };
      else return m.reply(`⚠️ *Tipo de mensaje no soportado para envío directo.*`);

      await conn.sendMessage(canalID, sendOpts, { quoted: null });
      return m.reply(`✅ *Contenido enviado al canal como nuevo, sin marca de reenvío.*`);
    } catch (e) {
      console.error(e);
      return m.reply(`⚠️ *Error al descargar y enviar el contenido.*`);
    }
  }

  // 📝 Si se envía texto directamente
  if (!text) {
    return m.reply(`❌ *Uso incorrecto:*\nResponde a un mensaje multimedia o envía texto.\nEjemplo:\n${usedPrefix + command} Hola a todos 🎉`);
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