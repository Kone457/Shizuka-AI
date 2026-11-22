import { watchFile, unwatchFile } from "fs"
import chalk from "chalk"
import { fileURLToPath } from "url"

global.botNumber = ""

global.owner = [
  ["201125166486", "𝐡𝐚𝐢𝐭𝐡𝐚𝐦 👑", true]
]

global.botname = 'Hina'
global.namebot = 'ᯓ★ Hina ᯓ★'
global.packname = 'ᯓ★ Hina ᯓ★'
global.wm = '𝐡𝐚𝐢𝐭𝐡𝐚𝐦'
global.author = '𝐡𝐚𝐢𝐭𝐡𝐚𝐦'
global.dev = '© 𝐡𝐚𝐢𝐭𝐡𝐚𝐦 - ᯓ★ Hina ᯓ★'

global.banner = 'https://put.icu/s/yr4vvffa.jpg'
global.banner2 = 'https://put.icu/s/qoqrh1yb.jpg'
global.icon = 'https://put.icu/s/ukv29dwj.jpg'
global.botImages = [
  'https://put.icu/s/yr4vvffa.jpg',
  'https://put.icu/s/qoqrh1yb.jpg',
  'https://put.icu/s/ukv29dwj.jpg',
  'https://put.icu/s/pco6yj6k.jpg',
  'https://put.icu/s/lv8w4tjh.jpg'
]
global.social = {
  github: 'https://github.com/hhgdwh40-maker',
  telegram: 'https://t.me/haitham_hina26',
  whatsapp: 'https://wa.me/201125166486'
}
global.channel = 'https://whatsapp.com/channel/0029Vb8QIpSJ3juu0VHRyU0v'
global.currency = 'كوينز'
global.sessions = 'sessions/session-bot'
global.jadi = 'sessions/session-sub'

global.api = {
  url: 'https://nexevo.boxmine.xyz',
  url2: 'https://api.delirius.online',
  url3: 'https://api-faa.my.id',
  key: 'NEX-Shizuka'
}

global.my = {
  ch: '120363410090342500@newsletter',
  name: 'ᯓ★ Hina ᯓ★'
}

const file = fileURLToPath(import.meta.url)
watchFile(file, () => {
  unwatchFile(file)
  console.log(chalk.redBright(`Update "${file}"`))
  import(`${file}?update=${Date.now()}`)
})
