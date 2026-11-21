import fetch from 'node-fetch';

let handler = async (m, { conn, text }) => {
  if (!text) {
    return conn.sendMessage(
      m.chat,
      { text: '《✧》 اكتب اللي عايز تدور عليه.\n\nمثال:\n.npmsearch express' },
      { quoted: m }
    );
  }

  try {
    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

    const query = encodeURIComponent(text.trim());
    const res = await fetch(`https://registry.npmjs.org/-/v1/search?text=${query}&size=10`);

    if (!res.ok) throw new Error('خطأ في البحث في NPM');
    const data = await res.json();

    if (!data.objects || data.objects.length === 0) {
      return conn.sendMessage(m.chat, { text: `❏ مفيش باكدجات لـ: *${text}*` }, { quoted: m });
    }

    let resultado = `📦 *نتائج NPM لـ:* ${text}\n`;
    resultado += `Se encontraron ${data.total} paquetes\n`;

    for (let i = 0; i < data.objects.length; i++) {
      const pkg = data.objects[i].package;
      const version = pkg.version;
      const fecha = new Date(pkg.date).toLocaleDateString('es-ES');
      const desc = pkg.description? pkg.description.substring(0, 120) + '...' : 'بدون وصف';
      const keywords = pkg.keywords? pkg.keywords.slice(0, 3).join(', ') : 'N/A';
      const links = pkg.links;

      resultado += `《${i + 1}》 *${pkg.name}* v${version}\n`;
      resultado += `📝 ${desc}\n`;
      resultado += `👤 Autor: ${pkg.author?.name || 'Desconocido'}\n`;
      resultado += `⭐ Descargas: ${pkg.searchScore? Math.floor(pkg.searchScore * 1000000) : 'N/A'}\n`;
      resultado += `🏷️ Tags: ${keywords}\n`;
      resultado += `📅 Actualizado: ${fecha}\n`;
      resultado += `🔗 NPM: ${links.npm}\n`;
      if (links.repository) resultado += `📂 Repo: ${links.repository}\n`;
      resultado += `\n`;
    }

    resultado += `> استخدم *.npm <الاسم>* عشان تحمّل الـ.tgz بتاع الباكدج`;

    await conn.sendMessage(
      m.chat,
      { text: resultado },
      { quoted: m }
    );

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

  } catch (err) {
    console.error(err);
    await conn.sendMessage(
      m.chat,
      { text: `❏ خطأ في معالجة الطلب.\n❏ التفاصيل: ${err.message}` },
      { quoted: m }
    );
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
  }
};

handler.help = ['ابحثباكدج'];
handler.tags = ['buscadores'];
handler.command = ['npmsearch', 'npms', 'ابحثباكدج', 'بحثباكدج'];
handler.group = true;

export default handler;