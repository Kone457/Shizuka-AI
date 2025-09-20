import { WAMessageStubType } from '@whiskeysockets/baileys'
import fetch from 'node-fetch'

export async function before(m, { conn, participants, groupMetadata }) {
  if (!m.messageStubType || !m.isGroup) return true
  
  const fkontak = { 
    key: { 
      participants: "0@s.whatsapp.net", 
      remoteJid: "status@broadcast", 
      fromMe: false, 
      id: "Halo" 
    }, 
    message: { 
      contactMessage: { 
        vcard: `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD` 
      }
    }, 
    participant: "0@s.whatsapp.net"
  }  

  let chat = global.db.data.chats[m.chat]
  let groupSize = participants.length

  // Ajustar tamaño del grupo
  if (m.messageStubType == 27) groupSize++
  if (m.messageStubType == 28 || m.messageStubType == 32) groupSize--

  const userJid = m.messageStubParameters[0]
  const mention = userJid.split('@')[0]
  const username = await conn.getName(userJid).catch(() => mention)
  const groupName = groupMetadata?.subject || 'el grupo'

  // Construcción de URL Popcat
  const avatar = await conn.profilePictureUrl(userJid, 'image').catch(_ => 'https://cdn.discordapp.com/embed/avatars/0.png')
  const background = 'https://cdn.popcat.xyz/welcome-bg.png'

  const urlWelcome = `https://api.popcat.xyz/v2/welcomecard?background=${encodeURIComponent(background)}&text1=${encodeURIComponent(username)}&text2=${encodeURIComponent('Bienvenido a ' + groupName)}&text3=${encodeURIComponent('Miembro ' + groupSize)}&avatar=${encodeURIComponent(avatar)}`
  
  const urlBye = `https://api.popcat.xyz/v2/welcomecard?background=${encodeURIComponent(background)}&text1=${encodeURIComponent(username)}&text2=${encodeURIComponent('Adiós de ' + groupName)}&text3=${encodeURIComponent('Miembro ' + groupSize)}&avatar=${encodeURIComponent(avatar)}`

  // BIENVENIDA
  if (chat.welcome && m.messageStubType == 27) {
    const bienvenida = `👋 Bienvenido @${mention} a *${groupName}*`
    const img = await (await fetch(urlWelcome)).buffer()

    await conn.sendMessage(m.chat, { 
      image: img, 
      caption: bienvenida, 
      mentions: [userJid] 
    }, { quoted: fkontak })
  }

  // DESPEDIDA
  if (chat.welcome && (m.messageStubType == 28 || m.messageStubType == 32)) {
    const bye = `👋 Adiós @${mention}, gracias por estar en *${groupName}*`
    const img = await (await fetch(urlBye)).buffer()

    await conn.sendMessage(m.chat, { 
      image: img, 
      caption: bye, 
      mentions: [userJid] 
    }, { quoted: fkontak })
  }
}