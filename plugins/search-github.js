import fetch from 'node-fetch';

let handler = async (m, { conn, text }) => {
  if (!text) return m.reply('❏ *اكتب كلمة للبحث.*');

  try {
    const res = await fetch(`https://api.github.com/search/repositories?q=${encodeURIComponent(text)}&sort=stars&order=desc&per_page=10`, {
      headers: {
        'Accept': 'application/vnd.github+json',
        'User-Agent': 'WaBot'
      }
    });

    const data = await res.json();

    if (!data.items || data.items.length === 0) {
      return m.reply('❏ *مفيش نتائج في جيتهاب.*');
    }

    let caption = `*⌬ بحث جيتهاب ⌬*\n*نتائج:* ${text}\n\n`;

    data.items.forEach((repo, i) => {
      caption += `*${i + 1}. ${repo.name}*\n`;
      caption += `✦ *Owner:* ${repo.owner.login}\n`;
      caption += `✦ *URL:* ${repo.html_url}\n`;
      caption += `✦ *الوصف:* ${repo.description || 'بدون وصف'}\n`;
      caption += `✦ *اللغة:* ${repo.language || 'غير محدد'}\n`;
      caption += `✦ *Estrellas:* ⭐ ${repo.stargazers_count}\n`;
      caption += `✦ *Forks:* 🍴 ${repo.forks_count}\n`;
      caption += `✦ *Watchers:* 👁️ ${repo.watchers_count}\n`;
      caption += `✦ *Issues abiertos:* 🐛 ${repo.open_issues_count}\n`;
      caption += `✦ *الحجم:* ${(repo.size / 1024).toFixed(2)} MB\n`;
      caption += `✦ *Licencia:* ${repo.license ? repo.license.name : 'Sin licencia'}\n`;
      caption += `✦ *Creado:* ${new Date(repo.created_at).toLocaleDateString()}\n`;
      caption += `✦ *Actualizado:* ${new Date(repo.updated_at).toLocaleDateString()}\n`;
      caption += `✦ *Topics:* ${repo.topics && repo.topics.length ? repo.topics.join(', ') : 'Ninguno'}\n`;
      caption += `✦ *Visibilidad:* ${repo.visibility}\n`;
      caption += `✦ *Default branch:* ${repo.default_branch}\n`;
      caption += `✦ *الصفحة:* ${repo.homepage || 'غير محددة'}\n\n`;
    });

    await conn.sendMessage(
      m.chat,
      {
        image: { url: data.items[0].owner.avatar_url },
        caption
      },
      { quoted: m }
    );

  } catch (error) {
    console.error(error);
    m.reply('❏ *خطأ في البحث في جيتهاب.* جرّب تاني بعد شوية.');
  }
};

handler.help = ['github'];
handler.tags = ['buscadores'];
handler.command = ['github', 'gh'];

export default handler;