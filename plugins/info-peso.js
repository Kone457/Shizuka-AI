import { readdirSync, lstatSync } from 'fs'
import { join, relative, basename } from 'path'

let handler = async (m, { conn }) => {
const baseDir = process.cwd()
const directories = []
const largestFiles = []
let totalSize = 0
let totalFiles = 0
let totalDirs = 0
let errors = 0

const formatSize = (bytes) => {
if (!bytes) return '0 B'
const units = ['B', 'KB', 'MB', 'GB', 'TB']
const i = Math.floor(Math.log(bytes) / Math.log(1024))
return "${(bytes / Math.pow(1024, i)).toFixed(2)} ${units[i]}"
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

      if (depth < 2) {
        directories.push({
          name: relative(baseDir, filePath),
          size: subSize,
          depth
        })
      }
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
text: '🔍 Analizando todo el almacenamiento...\n\nEsto puede tardar unos segundos.'
}, { quoted: m })

totalSize = scan(baseDir)

const topLevel = directories
.filter(item => item.depth === 0)
.sort((a, b) => b.size - a.size)

const topDirectories = directories
.sort((a, b) => b.size - a.size)
.slice(0, 15)

const topFiles = largestFiles
.sort((a, b) => b.size - a.size)
.slice(0, 20)

const directoryReport = topLevel.map((item, i) =>
"${i + 1}. 📁 ${item.name}\n   ${formatSize(item.size)}"
).join('\n')

const folderReport = topDirectories.map((item, i) =>
"${i + 1}. 📂 ${item.name}\n   ${formatSize(item.size)}"
).join('\n')

const fileReport = topFiles.map((item, i) =>
"${i + 1}. 📄 ${item.name}\n   ${formatSize(item.size)}"
).join('\n')

const report = `📊 ANÁLISIS COMPLETO DEL BOT

💾 Tamaño total: ${formatSize(totalSize)}
📄 Archivos: ${totalFiles.toLocaleString()}
📁 Directorios: ${totalDirs.toLocaleString()}
⚠️ Errores de lectura: ${errors}

━━━━━━━━━━━━━━━━━━
📦 CARPETAS PRINCIPALES

${directoryReport || 'No se encontraron carpetas.'}

━━━━━━━━━━━━━━━━━━
🔎 SUBCARPETAS MÁS PESADAS

${folderReport || 'No se encontraron subcarpetas.'}

━━━━━━━━━━━━━━━━━━
📄 ARCHIVOS MÁS PESADOS

${fileReport || 'No se encontraron archivos.'}

━━━━━━━━━━━━━━━━━━
✿ Análisis finalizado
🔒 No se eliminó ningún archivo.`

if (report.length <= 4000) {
await conn.reply(m.chat, report, m)
} else {
const sections = [
"📊 *ANÁLISIS DE ALMACENAMIENTO*\n\n💾 Tamaño total: ${formatSize(totalSize)}\n📄 Archivos: ${totalFiles.toLocaleString()}\n📁 Directorios: ${totalDirs.toLocaleString()}\n⚠️ Errores: ${errors}",
"📦 *CARPETAS PRINCIPALES*\n\n${directoryReport}",
"🔎 *SUBCARPETAS MÁS PESADAS*\n\n${folderReport}",
"📄 *ARCHIVOS MÁS PESADOS*\n\n${fileReport}"
]

for (const section of sections) {
  await conn.reply(m.chat, section, m)
}

}
}

handler.help = ['peso']
handler.tags = ['owner']
handler.command = ['peso', 'diskusage', 'tamanobot']
handler.owner = true

export default handler