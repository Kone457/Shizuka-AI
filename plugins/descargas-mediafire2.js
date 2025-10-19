
import fetch from 'node-fetch';

const MEDIAFIRE_API = 'https://api-nv.ultraplus.click/api/download/mediafire?key=rmF1oUJI529jzux8&url=';

async function fetchMediafire(url) {
  try {
    const res = await fetch(MEDIAFIRE_API + encodeURIComponent(url));
    if (!res.ok) return null;
    const json = await res.json();
    const result = json.result;

    if (!result?.directLink) return null;

    return {
      title: result.title,
      fileName: result.fileName,
      fileType: result.fileType,
      size: result.size,
      uploaded: result.uploaded,
      dl_url: result.directLink
    };
  } catch (e) {
    console.log('❌ Error al procesar MediaFire:', e);
    return null;
  }
}

let handler = async (m, { text, conn, command }) => {
  if (!text || !text.includes('mediafire.com')) {
    await conn.sendMessage(m.chat, { react: { text: '🌀', key: m.key } });
    return m.reply(`📎 Ingresa un enlace válido de MediaFire. Ejemplo: .${command} https://www.mediafire.com/file/abc123`);
  }

  try {
    await conn.sendMessage(m.chat, { react: { text: '🔍', key: m.key } });

    const file = await fetchMediafire(text);
    if (!file) {
      await conn.sendMessage(m.chat, { react: { text: '⚠️', key: m.key } });
      return m.reply('⚠️ No se pudo obtener el archivo. Verifica el enlace.');
    }

    await conn.sendMessage(m.chat, { react: { text: '📦', key: m.key } });

    const msgInfo = `
╔═ೋ═══❖═══ೋ═╗
║  📁 𝐌𝐞𝐝𝐢𝐚𝐅𝐢𝐫𝐞 𝐃𝐨𝐰𝐧𝐥𝐨𝐚𝐝 📁
╠═ೋ═══❖═══ೋ═╣
║ 📌 Título: ${file.title}
║ 📄 Archivo: ${file.fileName}
║ 🗂 Tipo: ${file.fileType}
║ 📏 Tamaño: ${file.size}
║ 📅 Subido: ${file.uploaded}
║ 🔗 Link directo: ${file.dl_url}
╚═ೋ═══❖═══ೋ═╝
`.trim();

    await conn.sendMessage(m.chat, { text: msgInfo }, { quoted: m });

    await conn.sendMessage(m.chat, { react: { text: '📥', key: m.key } });

    await conn.sendMessage(m.chat, {
      document: { url: file.dl_url },
      mimetype: 'application/octet-stream',
      fileName: file.fileName,
      caption: `📁 ${file.title}`
    }, { quoted: m });

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

  } catch (e) {
    console.error('💥 Error general en MediaFire:', e);
    await conn.sendMessage(m.chat, { react: { text: '💥', key: m.key } });
    m.reply('❌ Error al procesar tu solicitud.');
  }
};

handler.command = ['mediafire2', 'mf2', 'descargamf2'];
handler.help = ['mediafire <link>'];
handler.tags = ['downloader'];

export default handler;