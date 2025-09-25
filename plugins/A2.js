let handler = async (m, { conn }) => {
  try {
    const chats = await conn.chats.all(); // Obtiene todos los chats conocidos por el bot
    const canales = chats.filter(c => c.id.endsWith('@newsletter'));

    if (canales.length === 0) {
      return m.reply('⚠️ El bot no está suscrito a ningún canal tipo newsletter.');
    }

    let lista = canales.map((c, i) => `${i + 1}. ${c.name || 'Sin nombre'}\nID: ${c.id}`).join('\n\n');
    m.reply(`📢 *Canales disponibles:*\n\n${lista}`);
  } catch (e) {
    console.error(e);
    m.reply('❌ Error al obtener la lista de canales.');
  }
};

handler.help = ['listcanales'];
handler.tags = ['tools'];
handler.command = ['listcanales'];
handler.owner = true;

export default handler;