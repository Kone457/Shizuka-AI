import fs from 'fs'
import path from 'path'
import syntaxerror from 'syntax-error'

var handler = async (m, { conn }) => {
  const ignoredFolders = ['node_modules', '.git', 'test', 'sessions', 'tmp']
  const ignoredFiles = ['package-lock.json']

  function collectFiles(dir) {
    let out = []
    for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, item.name)
      if (ignoredFolders.includes(item.name) || ignoredFiles.includes(item.name)) continue
      if (item.isDirectory()) out = out.concat(collectFiles(fullPath))
      else if (item.isFile() && fullPath.endsWith('.js')) out.push(fullPath)
    }
    return out
  }

  try {
    await conn.sendMessage(m.chat, { react: { text: '🕒', key: m.key } })

    const baseDir = path.resolve('./')
    const jsFiles = collectFiles(baseDir)

    let response = `✰ *فحص أخطاء الصياغة في ${jsFiles.length} ملف:*\n\n`
    let hasErrors = false

    for (const file of jsFiles) {
      const err = syntaxerror(fs.readFileSync(file, 'utf8'), file, { sourceType: 'module', allowAwaitOutsideFunction: true })
      if (err) {
        hasErrors = true
        response += `❏ *خطأ في:* ${file.replace(baseDir + '/', '')}\n${err.message}\n\n`
      }
    }

    if (!hasErrors) response += '✿ كل حاجة تمام! مفيش أخطاء صياغة.'

    await conn.reply(m.chat, response, m)
    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
  } catch (err) {
    conn.reply(m.chat, `❏ *خطأ:* ${err.message}`, m)
  }
}

handler.command = ['revsall', 'تجديد_الكل']
handler.help = ['تجديد_الكل']
handler.tags = ['owner']
handler.owner = true

export default handler
