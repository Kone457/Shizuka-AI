import { watchFile, unwatchFile } from "fs"
import chalk from "chalk"
import { fileURLToPath } from "url"

global.botNumber = ""

global.owner = [
  ["595987301197", "Carlos 👑", true],
  ["17054102764", "Canada", true],
  ["5363870693", "XxX", true]
]

global.botname = '𝚂𝚑𝚒𝚣𝚞𝚔𝚊'
global.namebot = '𝚂𝚑𝚒𝚣𝚞𝚔𝚊-𝙰𝙸'
global.packname = 'ѕнιzυкα-αι'
global.wm = '𝓢𝓱𝓲𝔃𝓾𝓴𝓪-𝓐𝓘'
global.author = '𝙲𝚊𝚛𝚕𝚘𝚜'
global.dev = '© 𝙿𝚘𝚠𝚎𝚛𝚎𝚍 𝚋𝚢 𝙲𝚊𝚛𝚕𝚘𝚜.'

global.banner = 'https://raw.githubusercontent.com/Kone457/Nexus/refs/heads/main/Anime/99eec236ee.jpg'
global.icon = 'https://i.postimg.cc/ZR6tbmdF/a6b0b4c96c1ecc0258de9a6678434f65.jpg'
global.currency = 'Coins'
global.sessions = 'sessions/session-bot'
global.jadi = 'sessions/session-sub'

global.api = {
  url: 'https://nexevo.boxmine.xyz',
  url2: 'https://api.vreden.my.id',
  url3: 'https://api-faa.my.id',
  url4: 'https://api.delirius.store',
  key: 'NEX-Shizuka'
}

global.my = {
  ch: '120363400241973967@newsletter',
  name: '꒰ ✨ 𝚂𝚑𝚒𝚣𝚞𝚔𝚊-𝙰𝙸 ꒱'
}

const file = fileURLToPath(import.meta.url)
watchFile(file, () => {
  unwatchFile(file)
  console.log(chalk.redBright(`Update "${file}"`))
  import(`${file}?update=${Date.now()}`)
})
