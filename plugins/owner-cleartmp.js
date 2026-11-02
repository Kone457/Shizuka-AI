import { readdirSync, statSync, unlinkSync, existsSync, rmSync } from 'fs'
import { join } from 'path'

let handler = async (m, { conn }) => {
let totalSize = 0
let totalFiles = 0
const disposable = /.(tmp|temp|bak|old)$/i
const dirs = [
join(process.cwd(), 'tmp'),
global.sessions,
global.jadi
].filter(Boolean)

const cleanDirectory = (dir) => {
if (!existsSync(dir)) return
for (const file of readdirSync(dir)) {
const filePath = join(dir, file)
try {
const stats = statSync(filePath)
if (stats.isDirectory()) {
cleanDirectory(filePath)
continue
}
if (disposable.test(file)) {
totalSize += stats.size
unlinkSync(filePath)
totalFiles++
}
} catch {}
}
}

for (const dir of dirs) cleanDirectory(dir)

const clearPresences = (socket) => {
if (!socket?.chats) return
for (const chat of Object.values(socket.chats)) {
if (chat?.presences) delete chat.presences
}
}

clearPresences(conn)
clearPresences(global.conn)

if (Array.isArray(global.conns)) {
for (const subbot of global.conns) {
clearPresences(subbot)
}
}

const formatSize = (bytes) => {
if (!bytes) return '0 B'
const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
const i = Math.floor(Math.log(bytes) / Math.log(1024))
return "${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}"
}

await conn.reply(m.chat, "🧹 Limpieza completada\n\n📦 Archivos eliminados: ${totalFiles}\n💾 Espacio liberado: ${formatSize(totalSize)}\n🗂️ Directorios revisados: ${dirs.length}\n⚡ Limpieza inmediata", m)
}

handler.help = ['cleartmp']
handler.tags = ['owner']
handler.command = ['cleartmp', 'limpiartmp']
handler.owner = true

export default handler