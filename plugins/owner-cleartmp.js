import { readdirSync, statSync, unlinkSync, existsSync, rmSync } from 'fs'
import { join } from 'path'

let handler = async (m, { conn }) => {
let totalSize = 0
let totalFiles = 0
let coreStatus = 'مش موجود'
let coreSize = 0
let errors = 0

const disposable = /\.(tmp|temp|bak|old)$/i
const tmpDir = join(process.cwd(), 'tmp')

if (existsSync(tmpDir)) {
    try {
        for (const file of readdirSync(tmpDir)) {
            const filePath = join(tmpDir, file)
            try {
                const stats = statSync(filePath)
                totalSize += stats.size
                rmSync(filePath, { recursive: true, force: true })
                totalFiles++
            } catch {
                errors++
            }
        }
    } catch {
        errors++
    }
}

const otherDirs = [
global.sessions,
global.jadi
].filter(Boolean)

const cleanFilteredDirectory = (dir) => {
if (!existsSync(dir)) return
for (const file of readdirSync(dir)) {
const filePath = join(dir, file)
try {
const stats = statSync(filePath)
if (stats.isDirectory()) {
cleanFilteredDirectory(filePath)
continue
}
if (disposable.test(file)) {
totalSize += stats.size
unlinkSync(filePath)
totalFiles++
}
} catch {
errors++
}
}
}

for (const dir of otherDirs) cleanFilteredDirectory(dir)

const coreFile = join(process.cwd(), 'core')

try {
if (existsSync(coreFile)) {
const stats = statSync(coreFile)
if (stats.isFile()) {
coreSize = stats.size
unlinkSync(coreFile)
totalSize += coreSize
totalFiles++
coreStatus = 'Eliminado correctamente (' + formatSize(coreSize) + ')'
} else {
coreStatus = 'مش ملف عادي'
}
}
} catch (e) {
coreStatus = 'خطأ في الحذف:' + e.message
errors++
}

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

function formatSize(bytes) {
if (!bytes) return '0 B'
const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
const i = Math.floor(Math.log(bytes) / Math.log(1024))
return (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + sizes[i]
}

await conn.reply(m.chat, '🧹 Limpieza completada\n\n📦 Archivos/Carpetas eliminados: ' + totalFiles + '\n💾 Espacio liberado: ' + formatSize(totalSize) + '\n🗂️ المجلدات اللي اتفحصت: 3\n💥 الملف الأساسي: ' + coreStatus + '\n⚠️ Errores: ' + errors, m)
}

handler.help = ['تنظيف']
handler.tags = ['owner']
handler.command = ['cleartmp', 'limpiartmp', 'تنظيف', 'مسحمؤقت', 'مسح المؤقت']
handler.owner = true

export default handler
