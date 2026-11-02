import { readdirSync, lstatSync } from 'fs'
import { join, relative } from 'path'

let handler = async (m, { conn }) => {
  const baseDir = process.cwd()
  const sizes = new Map()
  let totalFiles = 0
  let totalSize = 0

  const formatSize = (bytes) => {
    if (!bytes) return '0 B'
    const units = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${units[i]}`
  }

  const scan = (dir, depth = 0) => {
    let size = 0
    let files

    try {
      files = readdirSync(dir)
    } catch {
      return 0
    }

    for (const file of files) {
      const filePath = join(dir, file)

      try {
        const stats = lstatSync(filePath)
        if (stats.isSymbolicLink()) continue

        if (stats.isDirectory()) {
          const subSize = scan(filePath, depth + 1)
          size += subSize
          if (depth < 2) {
            sizes.set(relative(baseDir, filePath) || '.', subSize)
          }
        } else if (stats.isFile()) {
          size += stats.size
          totalFiles++
        }
      } catch {}
    }

    totalSize += depth === 0 ? size : 0
    return size
  }

  await conn.sendMessage(m.chat, { text: '🔍 Analizando el almacenamiento del bot...' }, { quoted: m })

  scan(baseDir)

  const results = [...sizes.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 30)

  const report = results.map(([dir, size], i) =>
    `${i + 1}. 📁 ${dir}\n   💾 ${formatSize(size)}`
  ).join('\n\n')

  await conn.reply(m.chat, `📊 *ANÁLISIS DE ALMACENAMIENTO*\n\n📦 Tamaño total: ${formatSize(sizes.get('.') || totalSize)}\n📄 Archivos encontrados: ${totalFiles}\n📂 Directorios analizados: ${sizes.size}\n\n━━━━━━━━━━━━━━━━━━\n${report || 'No se encontraron carpetas.'}\n━━━━━━━━━━━━━━━━━━`, m)
}

handler.help = ['peso']
handler.tags = ['owner']
handler.command = ['peso', 'diskusage', 'tamanobot']
handler.owner = true

export default handler