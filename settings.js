import { watchFile, unwatchFile } from "fs"
import chalk from "chalk"
import { fileURLToPath } from "url"

global.botNumber = ""

global.owner = [
  ["5355699866", "Carlos 👑", true],
  ["595975677765", "David", true],
  ["5363870693", "Magical", true],
  ["17054102764"],
  ["573238788888"]
]

global.botname = '🍃 Shizuka-AI'
global.namebot = '♪ Shizuka-AI'
global.packname = 'ち卄工乙UＫ丹-丹工 '
global.wm = 'ち卄工乙UＫ丹-丹工 '
global.author = 'Carlos'
global.dev = '© Pᴏᴡᴇʀᴇᴅ Bʏ Carlos.'

global.banner = 'https://raw.githubusercontent.com/Kone457/Nexus/refs/heads/main/v2.jpg'
global.icon = 'https://files.catbox.moe/m7l8nc.jpg'
global.currency = 'Euros'
global.sessions = 'sessions/session-bot'
global.jadi = 'sessions/session-sub'


global.my = {
  ch: '120363400241973967@newsletter',
  name: '𝙎𝙝𝙞𝙯𝙪𝙠𝙖-𝘼𝙄 𝘾𝙝𝙖𝙣𝙣𝙚𝙡'
}

const file = fileURLToPath(import.meta.url)
watchFile(file, () => {
  unwatchFile(file)
  console.log(chalk.redBright(`Update "${file}"`))
  import(`${file}?update=${Date.now()}`)
})
