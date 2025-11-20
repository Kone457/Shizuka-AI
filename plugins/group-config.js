let handler = async (m, { conn, command }) => {
  try {
    let groupMetadata = await conn.groupMetadata(m.chat);
    let groupAnnouncement = groupMetadata.announce;

    if (command === 'close') {
      if (groupAnnouncement === true) {
        return conn.reply(m.chat, 
          `🔒✨ *El grupo ya estaba cerrado.*\n> Nadie puede enviar mensajes por ahora.`, 
          m
        );
      }
      await conn.groupSettingUpdate(m.chat, 'announcement')
        .then(() => {
          conn.reply(m.chat, 
            `🔒🚪 *El grupo ha sido cerrado correctamente.*\n> Solo los administradores pueden hablar.`, 
            m
          );
        })
        .catch((err) => conn.reply(m.chat, 
          `⚠️❌ *Error al cerrar el grupo:*\n> ${err.message}`, 
          m
        ));
    } else if (command === 'open') {
      if (groupAnnouncement === false) {
        return conn.reply(m.chat, 
          `🔓✨ *El grupo ya estaba abierto.*\n> Todos pueden enviar mensajes libremente.`, 
          m
        );
      }
      await conn.groupSettingUpdate(m.chat, 'not_announcement')
        .then(() => {
          conn.reply(m.chat, 
            `🔓🎉 *El grupo ha sido abierto correctamente.*\n> ¡Todos pueden participar de nuevo! 🙌`, 
            m
          );
        })
        .catch((err) => conn.reply(m.chat, 
          `⚠️❌ *Error al abrir el grupo:*\n> ${err.message}`, 
          m
        ));
    } else {
      return conn.reply(m.chat, 
        `❓🤔 *Comando no reconocido.*\n> Reporta este error al grupo de soporte.`, 
        m
      );
    }
  } catch (e) {
    console.error(e);
    conn.reply(m.chat, 
      `⚠️💥 *Error al realizar la configuración del grupo:*\n> ${e.message}`, 
      m
    );
  }
};

handler.help = ['close', 'open'];
handler.tags = ['grupo'];
handler.command = ['close', 'open'];
handler.admin = true;
handler.botAdmin = true;

export default handler;