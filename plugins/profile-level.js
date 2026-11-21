let handler = async (m, { conn, usedPrefix, command }) => {
  let users = globalThis.db.data.users;
  if (!users) return m.reply('❌ مفيش بيانات مستخدمين مسجلين لسه.');

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
    text += `\n${medal} *#${index + 1}* • @${jid.split('@')[0]}\n   📈 المستوى: *${data.level || 0}* | ⭐ XP: *${data.exp || 0}*`;
    mentions.push(jid);
  });

  text += `✦  *كمّل عشان تطلع مستوى أعلى!*  ✦`;

  await conn.sendMessage(m.chat, {
    text,
    contextInfo: { mentionedJid: mentions, isForwarded: true }
  }, { quoted: m });
};

handler.help = ['توب']
handler.tags = ['perfil']
handler.command = ['topnivel', 'toplevels', 'nivelestop', 'توب', 'توبمستوى', 'توبالمستويات', 'ترتيبالمستويات', 'توب المستوى', 'توب المستويات', 'ترتيب المستويات', 'توب_المستوى', 'توب_المستويات', 'ترتيب_المستويات', 'رانك', 'لفل'];
export default handler;
