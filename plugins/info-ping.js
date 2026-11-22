import { performance } from 'perf_hooks'

const fmtUptime = (s) => {
  const d = Math.floor(s / 86400), h = Math.floor(s % 86400 / 3600), m = Math.floor(s % 3600 / 60)
  return [d && `${d} يوم`, h && `${h} ساعة`, `${m} دقيقة`].filter(Boolean).join(' و ')
}

let handler = async (m, { conn }) => {
  const start = performance.now()
  await conn.reply(m.chat, '🏓 بينج...', m)
  const latensi = Math.floor(performance.now() - start)
  await conn.reply(m.chat, `🥍 بونج!\n> السرعة ⴵ *${latensi} ms*\n> البوت شغال من ⴵ *${fmtUptime(process.uptime())}*`, m)
}

handler.help = ['بينج']
handler.tags = ['tools']
handler.command = ['ping', 'p', 'بينج', 'بنج']
handler.owner = false

export default handler
