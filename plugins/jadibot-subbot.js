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
  isOwner: true,

  run: async (client, m, args, command) => {

    const subsPath = path.join(dirname, '../../Sessions/Subs')
    const subsCount = fs.existsSync(subsPath)
      ? fs.readdirSync(subsPath).filter((dir) => {
          const credsPath = path.join(subsPath, dir, 'creds.json')
          return fs.existsSync(credsPath)
        }).length
      : 0

    if (subsCount >= 20) {
      return client.reply(m.chat, '⚠️ *SISTEMA SATURADO*\nLo sentimos, todos los espacios de vinculación están ocupados actualmente. Inténtalo más tarde.', m)
    }

    commandFlags[m.sender] = true

    const rtx = `✨ *¡PREPÁRATE PARA LA VINCULACIÓN!* ✨
    
  *Sigue estos pasos con atención:*
  ──────────────────────────
  1️⃣  Abre *WhatsApp* en tu otro dispositivo.
  2️⃣  Toca el menú (⋮) o *Configuración*.
  3️⃣  Entra en *Dispositivos vinculados*.
  4️⃣  Selecciona *Vincular con número de teléfono*.
  ──────────────────────────
  
  📩 *CÓDIGO EN CAMINO...*
  El código de 8 dígitos aparecerá justo debajo de este mensaje.
  
  🛡️ _Seguridad: El código es de uso único y solo para tu número._`

    const phone = args[0] ? args[0].replace(/\D/g, '') : m.sender.split('@')[0]
    
    await client.sendMessage(m.chat, { 
        text: rtx 
    }, { quoted: m })

    await startSubBot(m, client, null, true, phone, m.chat, commandFlags, true)
    
    global.db.data.users[m.sender].Subs = new Date() * 1
  }
};
