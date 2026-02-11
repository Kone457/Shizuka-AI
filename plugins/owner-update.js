import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { exec } from 'child_process'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function reloadCommands() {
  const commandsMap = new Map()
  
  const files = fs.readdirSync(__dirname)

  for (const file of files) {
    
    if (file.endsWith('.js')) {
      const fullPath = path.join(__dirname, file)
      try {
   
        const { default: cmd } = await import(`file://${fullPath}?update=${Date.now()}`)
        
        if (cmd?.command && Array.isArray(cmd.command)) {
          cmd.command.forEach((c) => {
            commandsMap.set(c.toLowerCase(), cmd)
          })
        }
      } catch (err) {
        console.error(`Error cargando ${file}:`, err.message)
      }
    }
  }

  global.comandos = commandsMap
}

export default {
  command: ['fix', 'update'],
  isOwner: true,
  run: async (client, m) => {

    await client.sendMessage(m.chat, { text: '🛠️ *Procesando actualización...*' }, { quoted: m })

    exec('git pull', async (error, stdout, stderr) => {
      let responseText = ''

      if (error) {
        responseText = `❌ *Error de Git:* ${error.message}`
      } else {
        try {

          await reloadCommands()
          
          if (stdout.includes('Already up to date')) {
            responseText = '✅ *Sistema al día:* No había cambios pendientes, pero se refrescaron los comandos.'
          } else {
            responseText = `🚀 *Actualización exitosa:*\n\n\`\`\`${stdout}\`\`\``
          }
        } catch (reErr) {
          responseText = `⚠️ Se descargaron cambios, pero hubo error al recargar: ${reErr.message}`
        }
      }

      await client.sendMessage(m.chat, { text: responseText }, { quoted: m })
    })
  }
}
