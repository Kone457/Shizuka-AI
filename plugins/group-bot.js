let handler = async (m, { conn, text, args }) => {

  if (!args[0]) {
    const estado = global.db.data.chats[m.chat]?.bannedGrupo ?? false;
    const estadoTexto = estado ? '✗ Desactivado' : '✓ Activado';
    const info = `✿ *Estado de ${botname}*\n` +
                 `✰ *Actual ›* ${estadoTexto}\n\n` +
                 `> Puedes cambiarlo con:\n` +
                 `> ● _Activar ›_ *bot on*\n` +
                 `> ● _Desactivar ›_ *bot off*`;
    return m.reply(info);
  }

  try {
    const chat = global.db.data.chats[m.chat];
    const estado = chat.bannedGrupo ?? false;
    const accion = args[0].toLowerCase();

    if (accion === 'off') {
      if (estado) return m.reply(`✿ *${botname}* ya estaba *desactivado* en este grupo.`);
      chat.bannedGrupo = true;
      return m.reply(`✿ Has Desactivado a ${botname} en este grupo.`);
    }

    if (accion === 'on') {
      if (!estado) return m.reply(`✿ *${botname}* ya estaba *activa* en este grupo.`);
      chat.bannedGrupo = false;
      return m.reply(`✿ Has activado a *${botname}*  en este grupo.`);
    }

    return m.reply('> ✿ Usa: *bot on* o *bot off* para cambiar el estado.');
  } catch (e) {
    await m.reply('❏ Ocurrió un error al intentar cambiar el estado del bot.');
  }
};

handler.tags = ['grupo'];
handler.help = ['bot'];
handler.command = ['bot'];
handler.admin = true;
handler.group = true;

export default handler;