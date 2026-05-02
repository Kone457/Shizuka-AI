import { readdirSync, statSync, unlinkSync, rmSync, existsSync } from 'fs'
import { join } from 'path'
import os from 'os'

let handler = async (m, { conn }) => {

  const dirs = [
    join(process.cwd(), 'tmp'),
    os.tmpdir()
  ]

  let totalSize = 0
  let totalFiles = 0

  for (const dir of dirs) {
    try {
      if (!existsSync(dir)) continue

      for (const file of readdirSync(dir)) {
        const filePath = join(dir, file)

        try {
          const stats = statSync(filePath)

          totalSize += stats.size
          totalFiles++

          if (stats.isDirectory()) {
            rmSync(filePath, { recursive: true, force: true })
          } else {
            unlinkSync(filePath)
          }

        } catch {}
      }

    } catch {}
  }

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i]
  }

  await conn.reply(m.chat, `🧹 Limpieza completada

📦 Archivos eliminados: ${totalFiles}
💾 Espacio liberado: ${formatSize(totalSize)}`, m)
}

handler.help = ['cleartmp']
handler.tags = ['owner']
handler.command = ['cleartmp', 'limpiartmp']
handler.owner = true

export default handler