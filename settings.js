import { watchFile, unwatchFile } from 'fs' 
import chalk from 'chalk'
import { fileURLToPath } from 'url'
import fs from 'fs'
import cheerio from 'cheerio'
import fetch from 'node-fetch'
import axios from 'axios'
import moment from 'moment-timezone' 


global.botNumber = '' //Ejemplo: 123456789

//-----------------------------

global.owner = [

  ['5355699866', '🜲 Propietario 🜲', true],

  ['+261271484104740@lid'],

  ['261271484104740'],

  ['+261271484104740'], 

  ['+37405524500701@lid'],

  ['+17054102764']

];

//-----------------------------

global.mods = ['5355699866']
global.suittag = ['5355699866'] 
global.prems = []

//-----------------------------

global.libreria = 'Baileys'
global.baileys = 'V 6.7.16' 
global.vs = '1.0'
global.nameqr = 'Shizuka-AI'
global.namebot = 'Shizuka-AI'
global.sessions = 'Sessions'
global.jadi = 'JadiBots' 


//-----------------------------

global.packname = '「𝑆ℎ𝑖𝑧𝑢𝑘𝑎-𝐴𝐼」'
global.botname = 'Shizuka-AI'
global.wm = '𝙎𝙃𝙄𝙕𝙐𝙆𝘼-𝘼𝙄'
global.author = 'Power By Carlos'
global.dev = '© 𝙋𝙤𝙬𝙚𝙧-𝙗𝙮-Carlos°'
global.textbot = '𝙎𝙝𝙞𝙕𝙪𝙠𝙖-𝘼𝙄 𝙋𝙤𝙬𝙚𝙧 𝙗𝙮 Carlos '
global.etiqueta = 'Carlos'


//-----------------------------

global.moneda = 'Nakfas'
global.welcom1 = `

 *🕸️ Registro del sistema:* 
> *"Su presencia ha sido registrada en nuestro sistema. Perfil de corrupción: 68%. Bienvenido a la matriz."*

*🕷️ Reglas de supervivencia:*  
- No aceptes dulces del bot (son veneno digital)  
- Los mensajes de la madrugada son ley  
- Si ves tu nombre en rojo... huye inmediatamente  

*💀 Dato siniestro:* 
> *El 97% de los que entran no vuelven a ser humanos.*

*🕷️ Disfruta tu estancia... mientras puedas.* `

global.welcom2 = `
> *Los datos de su paso por este lugar han sido erradicados.*  
> *No existe copias de seguridad... o eso creemos.*

*🕸️ Reporte de eliminación:*  
✖️ Chat history: *deleted*  
✖️ Relaciones: *purged*  
✖️ Recuerdos: *corrupted*

*☠️ Advertencia para los sobrevivientes:* 
> *"No preguntéis por ello... o seréis el próximo."*`

global.banner = 'https://raw.githubusercontent.com/Kone457/Nexus/refs/heads/main/Shizuka.jpg'
global.avatar = 'https://raw.githubusercontent.com/Kone457/Nexus/refs/heads/main/v2.jpg'

//-----------------------------

global.gp1 = 'https://chat.whatsapp.com/FULTpMKUnwcI6zR7LT3qsW'
global.comunidad1 = 'https://chat.whatsapp.com/KUQIRhtLBir2FhiiFuqbGO'
global.channel = 'https://whatsapp.com/channel/0029VbAVMtj2f3EFmXmrzt0v'
global.channel2 = 'https://whatsapp.com/channel/0029VbAVMtj2f3EFmXmrzt0v'
global.md = 'https://github.com/Kone457/Shizuka-AI'
global.correo = 'c2117620@gmail.com'
global.cn ='https://whatsapp.com/channel/0029VbAVMtj2f3EFmXmrzt0v';

//-----------------------------


global.catalogo = fs.readFileSync('./src/catalogo.jpg');
global.estilo = { key: {  fromMe: false, participant: `0@s.whatsapp.net`, ...(false ? { remoteJid: "5219992095479-1625305606@g.us" } : {}) }, message: { orderMessage: { itemCount : -999999, status: 1, surface : 1, message: packname, orderTitle: 'Bang', thumbnail: catalogo, sellerJid: '0@s.whatsapp.net'}}}
global.ch = {
ch1: '120363400241973967@newsletter',
}
global.multiplier = 70

//----------------------------

global.cheerio = cheerio
global.fs = fs
global.fetch = fetch
global.axios = axios
global.moment = moment   

//----------------------------

let file = fileURLToPath(import.meta.url)
watchFile(file, () => {
  unwatchFile(file)
  console.log(chalk.redBright("Update 'settings.js'"))
  import(`${file}?update=${Date.now()}`)
})
