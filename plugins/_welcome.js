import { WAMessageStubType } from '@whiskeysockets/baileys'
import fetch from 'node-fetch'

export async function before(m, { conn, participants, groupMetadata }) {
  try {
    // Si no es stub event o no es grupo, seguir con lo de siempre
    if (!m.messageStubType || !m.isGroup) return true

    // Asegúrate de que el chat tenga la bienvenida activa
    const chat = global.db?.data?.chats?.[m.chat] || {}
    if (!chat.welcome) return true

    // Cantidad base de miembros
    let groupSize = (participants || []).length
    // Ajustes según tipo de stub (27: add, 28/32: remove)
    if (m.messageStubType === 27) groupSize++
    if (m.messageStubType === 28 || m.messageStubType === 32) groupSize--

    const groupName = groupMetadata?.subject || 'este grupo'
    const params = m.messageStubParameters || [] // array de jid(s) implicados

    // Fondo por defecto para la tarjeta
    const background = 'https://cdn.popcat.xyz/welcome-bg.png'

    // Procesar cada usuario que entra/sale
    for (const userJid of params) {
      if (!userJid) continue
      const mention = userJid.split('@')[0]
      const userName = await conn.getName(userJid).catch(() => mention)

      // Obtener avatar del usuario (con fallback)
      const avatar = await conn.profilePictureUrl(userJid, 'image').catch(() => 'https://cdn.discordapp.com/embed/avatars/0.png')

      // Texto según entrada o salida
      const isJoin = m.messageStubType === 27
      const text2 = isJoin ? `Bienvenido a ${groupName}` : `Ha salido de ${groupName}`
      const text3 = `Miembro ${groupSize}`

      // Construir URL de Popcat (encodeURIComponent en cada parte)
      const popcatUrl = `https://api.popcat.xyz/v2/welcomecard?background=${encodeURIComponent(background)}&text1=${encodeURIComponent(userName)}&text2=${encodeURIComponent(text2)}&text3=${encodeURIComponent(text3)}&avatar=${encodeURIComponent(avatar)}`

      // Descargar imagen (si falla, usamos avatar como imagen fallback)
      let imgBuffer = null
      try {
        const resp = await fetch(popcatUrl)
        if (!resp.ok) throw new Error('Popcat API no respondió')
        imgBuffer = await resp.buffer()
      } catch (err) {
        // fallback: intenta bajar la avatar o deja buffer vacío
        try {
          const resp2 = await fetch(avatar)
          imgBuffer = await resp2.buffer()
        } catch (err2) {
          imgBuffer = Buffer.from('') // vacío si todo falla
        }
      }

      // Caption (puedes usar global.welcom1 / global.welcom2 si los tienes)
      const caption = isJoin
        ? `👋 Bienvenido @${mention}\n\n${global.welcom1 || ''}`.trim()
        : `👋 Adiós @${mention}\n\n${global.welcom2 || ''}`.trim()

      // Enviar la imagen generada con mención
      try {
        await conn.sendMessage(m.chat, {
          image: imgBuffer,            // Buffer con la imagen (Popcat o fallback)
          caption,
          mentions: [userJid]
        })
      } catch (sendErr) {
        // Intento alternativo por si la firma de sendMessage espera objeto { image: { url: ... } }
        try {
          await conn.sendMessage(m.chat, {
            image: { url: imgBuffer },
            caption,
            mentions: [userJid]
          })
        } catch (finalErr) {
          console.error('No se pudo enviar la bienvenida/despedida:', finalErr)
        }
      }
    }
  } catch (e) {
    console.error('Error en before (welcome/despedida):', e)
  }

  return true
}