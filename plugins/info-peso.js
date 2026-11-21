import { readdirSync, lstatSync } from 'fs'
import { join, relative } from 'path'

let handler = async (m, { conn }) => {
const baseDir = process.cwd()
const directories = []
const largestFiles = []
let totalFiles = 0
let totalDirs = 0
let errors = 0

const formatSize = (bytes) => {
if (!bytes) return '0 B'
const units = ['B', 'KB', 'MB', 'GB', 'TB']
const i = Math.floor(Math.log(bytes) / Math.log(1024))
return (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + units[i]
}

const scan = (dir, depth = 0) => {
let size = 0
let files

try {
  files = readdirSync(dir)
} catch {
  errors++
  return 0
}

for (const file of files) {
  const filePath = join(dir, file)

  try {
    const stats = lstatSync(filePath)
    if (stats.isSymbolicLink()) continue

    if (stats.isDirectory()) {
      totalDirs++
      const subSize = scan(filePath, depth + 1)
      size += subSize

      directories.push({
        name: relative(baseDir, filePath),
        size: subSize,
        depth
      })
    } else if (stats.isFile()) {
      totalFiles++
      size += stats.size

      largestFiles.push({
        name: relative(baseDir, filePath),
        size: stats.size
      })
    }
  } catch {
    errors++
  }
}

return size

}

await conn.sendMessage(m.chat, {
text: '🔍 بجرب أحسب مساحة البوت كله...'
}, { quoted: m })

const totalSize = scan(baseDir)

const topLevel = directories
.filter(item => item.depth === 0)
.sort((a, b) => b.size - a.size)

const topDirectories = directories
.sort((a, b) => b.size - a.size)
.slice(0, 20)

const topFiles = largestFiles
.sort((a, b) => b.size - a.size)
.slice(0, 25)

const directoryReport = topLevel.map((item, i) =>
(i + 1) + '. 📁 ' + item.name + '\n   💾 ' + formatSize(item.size)
).join('\n\n')

const folderReport = topDirectories.map((item, i) =>
(i + 1) + '. 📂 ' + item.name + '\n   💾 ' + formatSize(item.size)
).join('\n\n')

const fileReport = topFiles.map((item, i) =>
(i + 1) + '. 📄 ' + item.name + '\n   💾 ' + formatSize(item.size)
).join('\n\n')

const sections = [
'📊 تحليل كامل للبوت\n\n' +
'💾 الحجم الكلي:' + formatSize(totalSize) + '\n' +
'📄 Archivos: ' + totalFiles.toLocaleString() + '\n' +
'📁 Directorios: ' + totalDirs.toLocaleString() + '\n' +
'⚠️ Errores: ' + errors,

'📦 *CARPETAS PRINCIPALES*\n\n' +
(directoryReport || 'مفيش فولدرات.'),

'🔎 *أكبر الفولدرات*\n\n' +
(folderReport || 'مفيش فولدرات فرعية.'),

'📄 *أكبر الملفات*\n\n' +
(fileReport || 'مفيش ملفات.')

]

for (const section of sections) {
const chunks = []
let current = ''

for (const line of section.split('\n')) {
  if ((current + '\n' + line).length > 3500) {
    chunks.push(current)
    current = line
  } else {
    current += (current ? '\n' : '') + line
  }
}

if (current) chunks.push(current)

for (const chunk of chunks) {
  await conn.reply(m.chat, chunk, m)
}

}

await conn.reply(m.chat, '✿ التحليل خلص.\n🔒 مفيش أي ملف اتحذف.', m)
}

handler.help = ['حجم_البوت']
handler.tags = ['owner']
handler.command = ['peso', 'diskusage', 'tamanobot', 'حجم_البوت', 'مساحة', 'قياس_البوت', 'الرام']
handler.owner = true

export default handler