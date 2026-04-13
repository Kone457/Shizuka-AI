import fs from 'fs'
import { v4 as uuidv4 } from 'uuid'

const obtenerPersonajes = () => {
  try {
    const contenido = fs.readFileSync('./lib/characters.json', 'utf-8')
    return JSON.parse(contenido)
  } catch (error) {
    console.error('[Error] characters.json:', error)
    return []
  }
}

const reservarPersonaje = (chatId, userId, personaje, db) => {
  db.chats[chatId].personajesReservados ||= []
  db.chats[chatId].personajesReservados.push({ userId, ...personaje })
}

const msToTime = (duration) => {
  const seconds = Math.floor((duration / 1000) % 60)
  const minutes = Math.floor((duration / (1000 * 60)) % 60)
  const s = seconds.toString().padStart(2, '0')
  const m = minutes.toString().padStart(2, '0')
  return m === '00'
    ? `${s} segundo${s > 1 ? 's' : ''}`
    : `${m} minuto${m > 1 ? 's' : ''}, ${s} segundo${s > 1 ? 's' : ''}`
}

export default {
  command: ['rollwaifu', 'roll', 'rw', 'rf'],
  category: 'gacha',
  run: async (client, m, args) => {
    const db = global.db.data
    const chatId = m.chat
    const userId = m.sender
    const chat = (db.chats[chatId] ||= { users: {}, personajesReservados: [] })
    chat.users ||= {}
    chat.personajesReservados ||= []

    const user = (chat.users[userId] ||= {})
    const now = Date.now()

    if (chat.adminonly || !chat.gacha)
      return m.reply(`✎ Estos comandos están desactivados en este grupo.`)

    const cooldown = user.rwCooldown || 0
    const restante = cooldown - now
    if (restante > 0) {
      return m.reply(`⏳ Espera *${msToTime(restante)}* para volver a usar este comando.`)
    }

    const personajes = obtenerPersonajes()
    const personaje = personajes[Math.floor(Math.random() * personajes.length)]
    if (!personaje) return m.reply('❌ No se encontró ningún personaje disponible.')

    const idUnico = uuidv4().slice(0, 8)

    const reservado = chat.personajesReservados.find((p) => p.name === personaje.name)

    const poseedor = Object.entries(chat.users).find(
      ([_, u]) =>
        Array.isArray(u.characters) && u.characters.some((c) => c.name === personaje.name),
    )

    let estado = 'Libre'
    if (poseedor) {
      const [id] = poseedor
      estado = `Reclamado por ${db.users[id]?.name || 'Alguien'}`
    } else if (reservado) {
      estado = `Reservado por ${db.users[reservado.userId]?.name || 'Alguien'}`
    }

    user.rwCooldown = now + 15 * 60000

    const valorPersonaje =
      typeof personaje.value === 'number' ? personaje.value.toLocaleString() : '0'

    const mensaje = `➩ Nombre › *${personaje.name || 'Desconocido'}*

⚥ Género › *${personaje.gender || 'Desconocido'}*
⛁ Valor › *${valorPersonaje}*
♡ Estado › *${estado}*
❖ Fuente › *${personaje.source || 'Desconocido'}*

${dev}`

    try {
      const imagenUrl = personaje.url || null

      if (imagenUrl) {
        await client.sendMessage(
          chatId,
          {
            image: { url: imagenUrl },
            caption: mensaje,
          },
          { quoted: m },
        )
      } else {
        await m.reply(mensaje)
      }

      if (!poseedor) {
        reservarPersonaje(
          chatId,
          userId,
          {
            ...personaje,
            id: idUnico,
            reservedBy: userId,
            reservedUntil: now + 20000,
            expiresAt: now + 60000,
          },
          db,
        )
      }
    } catch (e) {
      user.rwCooldown = 0
      console.error(e)
      return m.reply(msgglobal)
    }
  },
}