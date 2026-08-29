import { watchFile, unwatchFile } from "fs"
import chalk from "chalk"
import { fileURLToPath } from "url"

global.botNumber = ""

global.owner = [
  ["5363870693", "Carlos 👑", true],
  ["17054102764", "Canada", true],
  ["", "", true]
]

global.botname = '𝚂𝚑𝚒𝚣𝚞𝚔𝚊'
global.namebot = '𝚂𝚑𝚒𝚣𝚞𝚔𝚊-𝙰𝙸'
global.packname = 'ѕнιzυкα-αι'
global.wm = '𝓢𝓱𝓲𝔃𝓾𝓴𝓪-𝓐𝓘'
global.author = '𝙲𝚊𝚛𝚕𝚘𝚜'
global.dev = '© 𝙿𝚘𝚠𝚎𝚛𝚎𝚍 𝚋𝚢 𝙲𝚊𝚛𝚕𝚘𝚜.'

global.banner = 'https://raw.githubusercontent.com/Kone457/Nexus/refs/heads/main/Anime/99eec236ee.jpg'
global.banner2 = 'https://raw.githubusercontent.com/Kone457/Nexus/main/Datos/75fbe587ad51.jpg'
global.icon = 'https://i.postimg.cc/ZR6tbmdF/a6b0b4c96c1ecc0258de9a6678434f65.jpg'
global.currency = 'Coins'
global.sessions = 'sessions/session-bot'
global.jadi = 'sessions/session-sub'

global.api = {
  url: 'https://aquire.boxmine.xyz',
  url2: 'https://api.delirius.online',
  key: 'NEX-Shizuka'
}

global.my = {
  ch: '120363424754823499@newsletter',
  name: '꒰ ✨ 𝚂𝚑𝚒𝚣𝚞𝚔𝚊-𝙰𝙸 ꒱'
}

const file = fileURLToPath(import.meta.url)
watchFile(file, () => {
  unwatchFile(file)
  console.log(chalk.redBright(`Update "${file}"`))
  import(`${file}?update=${Date.now()}`)
})
