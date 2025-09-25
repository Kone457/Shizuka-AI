let handler = async (m, { conn }) => {
  try {
    const chats = Object.entries(conn.chats)
      .map(([id, data]) => ({ id, name: data.name || 'Sin nombre' }))
      .filter(c => c.id.endsWith('@newsletter'));

    if (chats.length === 0) {
      return m.reply('⚠️ El bot no tiene registrado ningún canal tipo newsletter.');
    }

    let lista = chats.map((c, i) => `${i + 1}. ${c.name}\nID: ${c.id}`).join('\n\n');
    m.reply(`📢 *Canales detectados:*\n\n${lista}`);
  } catch (e) {
    console.error(e);
    m.reply('❌ Error al acceder a los chats del bot.');
  }
};

handler.help = ['canales'];
handler.tags = ['tools'];
handler.command = ['canales'];
handler.owner = true;

export default handler;