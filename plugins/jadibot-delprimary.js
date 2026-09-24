import ws from "ws";

let handler = async (m, { conn }) => {
  try {
    const chat = global.db?.data?.chats?.[m.chat];

    if (!chat) {
      return conn.reply(m.chat, "《✧》 No se pudo acceder a la base de datos del grupo.", m);
    }

    if (!chat.primaryBot) {
      return conn.reply(m.chat, "《✧》 Este grupo no tiene un bot primario establecido.", m);
    }

    const oldPrimary = chat.primaryBot;
    delete chat.primaryBot;

    conn.sendMessage(m.chat, {
      text: `《✧》 El bot primario @${oldPrimary.split("@")[0]} ha sido eliminado de este grupo. Ahora todos los bots pueden responder.`,
      mentions: [oldPrimary]
    }, { quoted: m });

  } catch (error) {
    console.error("❏ Error en .delprimary:", error);
    m.reply("❏ Ocurrió un error al borrar el bot primario. Inténtalo nuevamente.");
  }
};

handler.help = ["delprimary"];
handler.tags = ["jadibot"];
handler.command = ["delprimary"];
handler.group = true;
handler.admin = true;

handler.register = true;

export default handler;