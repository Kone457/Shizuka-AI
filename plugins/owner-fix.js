import fs from 'fs';
import path from 'path';

var handler = async (m, { conn }) => {

  const ignoredFolders = ['node_modules', '.git']
  const ignoredFiles = ['package-lock.json'];

  async function getAllJSFiles(dir) {
    let jsFiles = [];
    const items = fs.readdirSync(dir, { withFileTypes: true });

    for (const item of items) {
      const fullPath = path.join(dir, item.name);

      if (ignoredFolders.includes(item.name) || ignoredFiles.includes(item.name)) continue;

      if (item.isDirectory()) {
        jsFiles = jsFiles.concat(await getAllJSFiles(fullPath));
      } else if (item.isFile() && fullPath.endsWith('.js')) {
        jsFiles.push(fullPath);
      }
    }

    return jsFiles
  }

  try {
    // Reacción inicial
    await conn.sendMessage(m.chat, {
      react: { text: '🕒', key: m.key }
    });

    conn.sendPresenceUpdate('composing', m.chat);

    const baseDir = path.resolve('./')
    const jsFiles = await getAllJSFiles(baseDir)

    let response = `📦 *Revisión de Syntax Errors En ${jsFiles.length} archivos:*\n\n`
    let hasErrors = false

    for (const file of jsFiles) {
      try {
        await import(`file://${file}`);
      } catch (error) {
        hasErrors = true;
        response += `🚩 *Error en:* ${file.replace(baseDir + '/', '')}\n${error.message}\n\n`
      }
    }

    if (!hasErrors) {
      response += '🪐 ¡Todo está en orden! No se detectaron errores de sintaxis.'
    }

    await conn.reply(m.chat, response, m);

    // Reacción final
    await conn.sendMessage(m.chat, {
      react: { text: '✅', key: m.key }
    });

  } catch (err) {
    conn.reply(m.chat, `*Error:* ${err.message}`, m);
  }
}

handler.command = ['revsall'];
handler.help = ['revsall'];
handler.tags = ['owner'];
handler.owner = true;

export default handler;