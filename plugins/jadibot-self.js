let handler = async (m, { conn, args }) => {
  const isSocketOwner = [
    conn.user.jid,
    ...(global.owner || []).map(n => n + '@s.whatsapp.net'),
  ].includes(m.sender);

  if (!isSocketOwner) {
    return m.reply('> Solo el propietario del bot puede usar este comando.');
  }

  const settings = global.db.data.settings[conn.user.jid] || {};
  const estado = settings.self ?? false;

  if (args[0] === 'enable' || args[0] === 'on') {
    if (estado) return m.reply('> El modo *Self* ya estaba activado.');
    settings.self = true;
    return m.reply('> Has *Activado* el modo *Self*.');
  }

  if (args[0] === 'disable' || args[0] === 'off') {
    if (!estado) return m.reply('> El modo *Self* ya estaba desactivado.');
    settings.self = false;
    return m.reply('> Has *Desactivado* el modo *Privado*.');
  }

  return m.reply(
    `> *Self*\n> *Estado ›* ${estado ? '✓ Activado' : '✗ Desactivado'}\n\n> Puedes cambiarlo con:\n> ● _Activar ›_ *self on*\n> ● _Desactivar ›_ *self off*`
  );
};

handler.help = ['self'];
handler.tags = ['serbot'];
handler.command = ['self'];

export default handler;