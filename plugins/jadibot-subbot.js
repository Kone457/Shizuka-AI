import { startSubBot } from '../lib/subs.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

let commandFlags = {}

export default {
  command: ['code'],
  category: 'socket',
  run: async (client, m, args, command) => {

    const subsPath = path.join(dirname, '../../Sessions/Subs')
    const subsCount = fs.existsSync(subsPath)
      ? fs.readdirSync(subsPath).filter((dir) => {
          const credsPath = path.join(subsPath, dir, 'creds.json')
          return fs.existsSync(credsPath)
        }).length
      : 0

    if (subsCount >= 20) {
      return client.reply(m.chat, '❌ *Límite alcanzado:* No hay espacios disponibles.', m)
    }

    commandFlags[m.sender] = true

    const rtx = `╭───  「 **VINCULACIÓN** 」  ───
│ 
│ 🜸 *Pasos a seguir:*
│ 
│ 1️⃣ Click en los *tres puntos* (⋮)
│ 2️⃣ Toca *Dispositivos vinculados*
│ 3️⃣ Click en *Vincular un dispositivo*
│ 4️⃣ Selecciona *Vincular con número*
│
│ 💡 *Nota:* Ingresa el código que recibirás
│ a continuación en tu WhatsApp.
│
╰──────────────────────────
⚠️ *Importante:* Solo funciona en el número que lo solicitó.`

    const phone = args[0] ? args[0].replace(/\D/g, '') : m.sender.split('@')[0]
    const imageUrl = 'https://files.catbox.moe/4k9pie.jpg'
    
    await client.sendMessage(m.chat, { 
        image: { url: imageUrl }, 
        caption: rtx 
    }, { quoted: m })


    await startSubBot(m, client, null, true, phone, m.chat, commandFlags, true)
    

    global.db.data.users[m.sender].Subs = new Date() * 1
  }
};
