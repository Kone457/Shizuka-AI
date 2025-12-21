import ws from "ws";

let handler = async (m, { conn, usedPrefix, args }) => {
  try {
    if (!args[0] && !m.quoted) {
      return m.reply(`⚠️ Menciona el número de un bot o responde al mensaje de un bot.\n> Ejemplo: *${usedPrefix}setprimary @0*`);
    }

    // Validación de global.conns para evitar errores de undefined
    const users = global.conns 
      ? [...new Set([...global.conns.filter(conn => conn?.user && conn?.ws?.socket && conn.ws.socket.readyState !== ws.CLOSED).map(conn => conn)])] 
      : [];

    let botJid;
    let selectedBot;

    if (m.mentionedJid && m.mentionedJid.length > 0) {
      botJid = m.mentionedJid[0];
    } else if (m.quoted) {
      botJid = m.quoted.sender;
    } else {
      botJid = args[0].replace(/[^0-9]/g, "") + "@s.whatsapp.net";
    }

    if (botJid === conn.user.jid || botJid === global.conn.user.jid) {
      selectedBot = conn;
    } else {
      selectedBot = users.find(conn => conn.user.jid === botJid);
    }

    if (!selectedBot) {
      return conn.reply(m.chat, `⚠️ @${botJid.split("@")[0]} no es un bot de la misma sesión. Verifica los bots conectados usando *#bots*.`, m, { mentions: [botJid] });
    }

    let chat = global.db?.data?.chats?.[m.chat];

    if (!chat) {
      return conn.reply(m.chat, "⚠️ No se pudo acceder a la base de datos del grupo.", m);
    }

    if (chat.primaryBot === botJid) {
      return conn.reply(m.chat, `⚠️ @${botJid.split("@")[0]} ya es el bot primario en este grupo.`, m, { mentions: [botJid] });
    }

    chat.primaryBot = botJid;
    conn.sendMessage(m.chat, {
      text: `✅ El bot @${botJid.split("@")[0]} ha sido establecido como primario en este grupo. Los demás bots no responderán aquí.`,
      mentions: [botJid]
    }, { quoted: m });

  } catch (error) {
    console.error("❌ Error en .setprimary:", error);
    m.reply("❌ Ocurrió un error al establecer el bot primario. Inténtalo nuevamente.");
  }
};

handler.help = ["setprimary <@tag>"];
handler.tags = ["jadibot"];
handler.command = ["setprimary"];
handler.group = true;
handler.admin = true;

export default handler;