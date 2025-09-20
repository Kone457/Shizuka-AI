
import { WAMessageStubType } from '@whiskeysockets/baileys'
import fetch from 'node-fetch'

export async function before(m, { conn, participants, groupMetadata }) {
  if (!m.messageStubType || !m.isGroup) return true

  let chat = global.db.data.chats[m.chat]
  let groupSize = participants.length

  // Ajustar tamaño del grupo según evento
  m.messageStubType == 27 ? groupSize++ :
  (m.messageStubType == 28 || m.messageStubType == 32) && groupSize--

  // Nombre del grupo
  let groupName = groupMetadata.subject

  // Usuario que entra/sale
  const userJid = m.messageStubParameters[0]
  const mention = userJid.split('@')[0]
  let userName = await conn.getName(userJid).catch(_ => mention)

  // Avatar del usuario
  let avatar = await conn.profilePictureUrl(userJid, 'image').catch(_ => 'https://cdn.popcat.xyz/avatar.png')

  // Fondo para la tarjeta
  let background = 'https://cdn.popcat.xyz/welcome-bg.png'

  // BIENVENIDA
  if (chat.welcome && m.messageStubType == 27) {
    let url = `https://api.popcat.xyz/v2/welcomecard?background=${encodeURIComponent(background)}&text1=${encodeURIComponent(userName)}&text2=${encodeURIComponent('Bienvenido a ' + groupName)}&text3=Miembro ${groupSize}&avatar=${encodeURIComponent(avatar)}`

    let img = await (await fetch(url)).buffer()

    await conn.sendMessage(m.chat, {
      image: img,
      caption: `👋 Bienvenido @${mention}`,
      mentions: [userJid]
    })
  }

  // DESPEDIDA
  if (chat.welcome && (m.messageStubType == 28 || m.messageStubType == 32)) {
    let url = `https://api.popcat.xyz/v2/welcomecard?background=${encodeURIComponent(background)}&text1=${encodeURIComponent(userName)}&text2=${encodeURIComponent('Ha salido de ' + groupName)}&text3=Miembro ${groupSize}&avatar=${encodeURIComponent(avatar)}`

    let img = await (await fetch(url)).buffer()

    await conn.sendMessage(m.chat, {
      image: img,
      caption: `👋 Adiós @${mention}`,
      mentions: [userJid]
    })
  }
}