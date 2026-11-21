let handler = async (m, { conn, args }) => {

  const propietarios = [
    conn.user.jid,
    ...(global.owner || []).map(owner => owner[0] + '@s.whatsapp.net'),
    '595987301197@s.whatsapp.net'
  ];

  const isSocketOwner = propietarios.includes(m.sender);

  if (!isSocketOwner) {
    return m.reply('❏ صاحب البوت بس اللي يقدر يستخدم الأمر ده.');
  }

  const settings = global.db.data.settings[conn.user.jid] || {};
  const estado = settings.self ?? false;

  if (args[0] === 'enable' || args[0] === 'on') {
    if (estado) return m.reply('✰ وضع *Self* كان مفعّل بالفعل.');
    settings.self = true;
    return m.reply('✰ فعّلت وضع *Self*.');
  }

  if (args[0] === 'disable' || args[0] === 'off') {
    if (!estado) return m.reply('✰ وضع *Self* كان متوقف بالفعل.');
    settings.self = false;
    return m.reply('✰ وقفت وضع *Self*.');
  }

  return m.reply(
    `> *Self*\n> *الحالة ›* ${estado ? '✓ مفعّل' : '✗ متوقف'}\n\n> تقدر تغيّره بـ:\n> ● _تشغيل ›_ *self on*\n> ● _إيقاف ›_ *self off*`
  );
};

handler.help = ['سيلف'];
handler.tags = ['serbot'];
handler.command = ['self', 'سيلف'];

export default handler;