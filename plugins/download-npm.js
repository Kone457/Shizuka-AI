import fetch from 'node-fetch';

let handler = async (m, { conn, text }) => {
  if (!text) {
    return conn.sendMessage(
      m.chat,
      { text: '《✧》 اكتب اسم باكدج.\n\nمثال:\n.npm axios' },
      { quoted: m }
    );
  }

  try {
    await conn.sendMessage(m.chat, {
      react: { text: '⏳', key: m.key }
    });

    const res = await fetch(`https://registry.npmjs.org/${encodeURIComponent(text.trim())}`);

    if (!res.ok) throw new Error('الباكدج مش موجود.');

    const data = await res.json();

    const version = data['dist-tags'].latest;
    const tarball = data.versions[version].dist.tarball;

    const file = await fetch(tarball);
    if (!file.ok) throw new Error('مقدرتش أحمّل الباكدج.');

    const buffer = await file.buffer();

    await conn.sendMessage(
      m.chat,
      {
        document: buffer,
        fileName: `${data.name}-${version}.tgz`,
        mimetype: 'application/gzip',
        caption: `*✿ اتفضل ${data.name} v${version}*`
      },
      { quoted: m }
    );

    await conn.sendMessage(m.chat, {
      react: { text: '✅', key: m.key }
    });

  } catch (err) {
    console.error(err);

    await conn.sendMessage(
      m.chat,
      {
        text: `❏ خطأ في معالجة الطلب.\n❏ التفاصيل: ${err.message}`
      },
      { quoted: m }
    );

    await conn.sendMessage(m.chat, {
      react: { text: '❌', key: m.key }
    });
  }
};

handler.help = ['باكدج'];
handler.tags = ['descargas'];
handler.command = ['npm', 'باكدج'];
handler.group = true;

export default handler;