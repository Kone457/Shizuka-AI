import fs from 'fs';
import os from 'os';

function getDefaultHostId() {
  if (process.env.HOSTNAME) {
    return process.env.HOSTNAME.split('-')[0]
  }
  return 'default_host_id'
}

export default {
  command: ['status'],
  description: 'Muestra el estado del bot y del servidor.',
  category: 'info',
  run: async (client, m) => {

    const hostId = getDefaultHostId()
    const registeredGroups = global.db.data.chats ? Object.keys(global.db.data.chats).length : 0
    const botId = client.user.id.split(':')[0] + "@s.whatsapp.net" || false
    const botSettings = global.db.data.settings[botId] || {}

    const botname = botSettings.namebot || 'Ai Surus'
    const botname2 = botSettings.namebot2 || 'Surus'
    const userCount = Object.keys(global.db.data.users).length || '0'

    const estadoBot = 
`「❀」 Estado de *Shizuka* (●\´ϖ\`●)
✎ *Usuarios registrados ›* ${userCount.toLocaleString()}
✎ *Grupos registrados ›* ${registeredGroups.toLocaleString()}`

    const sistema = os.type()
    const cpu = os.cpus().length
    const ramTotal = (os.totalmem() / 1024 ** 3).toFixed(2)
    const ramUsada = ((os.totalmem() - os.freemem()) / 1024 ** 3).toFixed(2)
    const arquitectura = os.arch()

    const estadoServidor = 
`➭ Estado del Servidor *₍ᐢ..ᐢ₎♡*

> *Sistema ›* ${sistema}
> *CPU ›* ${cpu} cores
> *RAM ›* ${ramTotal} GB
> *RAM Usado ›* ${ramUsada} GB
> *Arquitectura ›* ${arquitectura}
> *Host ID ›* ${hostId}`

    const mensajeEstado = `${estadoBot}\n\n${estadoServidor}`

    await client.reply(m.chat, mensajeEstado, m)
  }
};