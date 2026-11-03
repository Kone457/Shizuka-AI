import * as baileys from "@whiskeysockets/baileys";

let handler = async (m, { conn, text, usedPrefix, command }) => {
  let [pregunta, ...opciones] = text ? text.split('|').map(v => v.trim()) : [];

  if (!pregunta || opciones.length < 2) {
    return m.reply(`✿ Por favor, ingresa una pregunta y al menos 2 opciones separadas por barra vertical (|).\n\nEjemplo:\n*${usedPrefix + command}* ¿Cuál es tu color favorito? | Azul | Rojo | Verde`);
  }

  if (opciones.length > 12) {
    return m.reply('✿ Solo puedes agregar un máximo de 12 opciones para la encuesta.');
  }

  const pollMessage = {
    pollCreationMessage: {
      name: pregunta,
      options: opciones.map(option => ({ optionName: option })),
      selectableOptionsCount: 1
    }
  };

  try {
    await conn.sendMessage(m.chat, pollMessage, { quoted: m });
  } catch (e) {
    console.error(e);
    return m.reply('✿ Hubo un error al crear la encuesta.');
  }
};

handler.help = ["test"];
handler.command = ["test"];
handler.tags = ["tools"];

export default handler;
