let handler = async (m, { conn, usedPrefix, command }) => {
  let users = globalThis.db.data.users;
  if (!users) return m.reply('❌ No hay datos de usuarios registrados todavía.');

  let sortedLevel = Object.entries(users)
    .sort((a, b) => (b[1].level || 0) - (a[1].level || 0))
    .slice(0, 10);

  let text = `
╔═══❖•°•°•°❖•°•°•°❖═══╗
🏆  **TOP 10 - NIVELES**  🏆
╚═══❖•°•°•°❖•°•°•°❖═══╝\n
  `.trim();

  let mentions = [];
  sortedLevel.forEach(([jid, data], index) => {
    let medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '📌';
    text += `\n${medal} *#${index + 1}* • @${jid.split('@')[0]}\n   📈 Nivel: *${data.level || 0}* | ⭐ XP: *${data.exp || 0}*`;
    mentions.push(jid);
  });

  text += `\n\n╔═══❖•°•°•°❖•°•°•°❖═══╗\n✦  *¡Sigue subiendo de nivel!*  ✦\n╚═══❖•°•°•°❖•°•°•°❖═══╝`;

  await conn.sendMessage(m.chat, {
    text,
    contextInfo: { mentionedJid: mentions, isForwarded: true }
  }, { quoted: m });
};

handler.command = ['topnivel', 'toplevels', 'nivelestop'];
export default handler;
