import { performance } from 'perf_hooks'
import { exec } from 'child_process'

let handler = async (m, { conn }) => {
  const timestamp = performance.now()

  exec('neofetch --stdout', (error, stdout, stderr) => {
    const latensi = performance.now() - timestamp

    let child = stdout?.toString("utf-8") || ''
    let ssd = child.replace(/Memory:/, "Ram:")

    conn.reply(
      m.chat,
      `🥍 بونج!\n> الوقت ⴵ ${Math.floor(latensi)} ms`,
      m
    )
  })
}

handler.help = ['بينج']
handler.tags = ['info']
handler.command = ['ping', 'p', 'بينج']
handler.owner = false

export default handler