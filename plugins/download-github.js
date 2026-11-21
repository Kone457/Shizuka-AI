import fetch from 'node-fetch';

let handler = async (m, { conn, text }) => {
  if (!global._processedMessages) global._processedMessages = new Set();
  if (global._processedMessages.has(m.key.id)) return;
  global._processedMessages.add(m.key.id);

  if (!text || !/(github\.com\/[^\/]+\/[^\/]+)/.test(text)) {
    return await conn.sendMessage(
      m.chat,
      { text: `《✧》 هات لينك جيتهاب صحيح.` },
      { quoted: m }
    );
  }

  try {
    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

    const match = text.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    const owner = match[1];
    const repo = match[2];

    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/zipball/main`;

    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/vnd.github+json',
        'User-Agent': 'Vagos'
      }
    });

    if (!response.ok) throw new Error(`GitHub API رجّع ${response.status}`);

    const buffer = await response.buffer();

    await conn.sendMessage(
      m.chat,
      {
        document: buffer,
        fileName: `${repo}-main.zip`,
        mimetype: 'application/zip',
        caption: `*✿ اتفضل...*`
      },
      { quoted: m }
    );

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

  } catch (err) {
    console.error('❏ خطأ في بلوجن جيتهاب:', err);
    await conn.sendMessage(
      m.chat,
      { text: `❏ خطأ في معالجة الطلب.\n❏ التفاصيل: ${err.message}` },
      { quoted: m }
    );
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
  }
};

handler.help = ['gitclone'];
handler.tags = ['descargas'];
handler.command = ['gitclone'];
handler.group = true;

export default handler;