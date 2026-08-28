let handler = async (m, { conn, text, usedPrefix }) => {
  let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender;
  let user = globalThis.db.data.users[who] || {};

  let name = user.name || conn.getName(who) || 'Usuario';
  let level = user.level || 0;
  let exp = user.exp || 0;
  let chocolates = user.chocolates || 0;
  let coin = user.coin || 0;
  let bank = user.bank || 0;
  let registered = user.registered ? 'Registrado ✅' : 'No registrado ❌';
  let pareja = user.marry ? `@${user.marry.split('@')[0]}` : 'Soltero/a 💔';

  let avatarUrl = 'https://files.evogb.win/AGCG2d.jpg';
  try {
    avatarUrl = await conn.profilePictureUrl(who, 'image');
  } catch {}

  let txt = `
╔═══❖•°•°•°❖•°•°•°❖═══╗
🌟   *PERFIL DE USUARIO*   🌟
╚═══❖•°•°•°❖•°•°•°❖═══╝

👤 *Nombre:* ${name}
📈 *Nivel:* ${level}
⭐ *Experiencia (XP):* ${exp}

💍 *Pareja:* ${pareja}

🍫 *Chocolates:* ${chocolates}
🪙 *Coins:* ${coin}
🏦 *Banco:* ${bank}

  `.trim();

  await conn.sendMessage(m.chat, {
    image: { url: avatarUrl },
    caption: txt,
    contextInfo: {
      mentionedJid: [who, ...(user.marry ? [user.marry] : [])],
      isForwarded: true
    }
  }, { quoted: m });
};

handler.help = ['perfil']
handler.tags = ['perfil']
handler.command = ['perfil', 'profile'];
export default handler;
