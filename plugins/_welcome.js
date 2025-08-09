import { WAMessageStubType } from '@whiskeysockets/baileys'
import fetch from 'node-fetch'

export async function before(m, { conn, participants, groupMetadata }) {
  if (!m.messageStubType || !m.isGroup) return true
  
  const fkontak = { 
    "key": { 
      "participants": "0@s.whatsapp.net", 
      "remoteJid": "status@broadcast", 
      "fromMe": false, 
      "id": "Halo" 
    }, 
    "message": { 
      "contactMessage": { 
        "vcard": `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD` 
      }
    }, 
    "participant": "0@s.whatsapp.net"
  }  

  // Configuración inicial
  let ppBienvenida = await conn.profilePictureUrl(m.messageStubParameters[0], 'image').catch(_ => 'https://qu.ax/rnsuj.jpg') // Imagen de bienvenida (predeterminada o perfil)
  let ppDespedida = 'https://qu.ax/OTGDz.jpg' // Imagen personalizada para despedida (enlace alternativo)
  
  let imgBienvenida = await (await fetch(ppBienvenida)).buffer()
  let imgDespedida = await (await fetch(ppDespedida)).buffer() // Buffer de la imagen de despedida
  
  let chat = global.db.data.chats[m.chat]
  let groupSize = participants.length

  // Ajustar tamaño del grupo
  m.messageStubType == 27 ? groupSize++ : 
  (m.messageStubType == 28 || m.messageStubType == 32) && groupSize--

  // Mensaje de BIENVENIDA (imagen de perfil o predeterminada)
  if (chat.welcome && m.messageStubType == 27) {
    const mention = m.messageStubParameters[0].split('@')[0]
    const bienvenida = `
☠️ *▄︻デ══━💀 @${mention}...*  
*Tu huella digital ha sido rastreada. Bienvenido a la red oscura.*

${global.welcom1}

✦ Presas en el sistema: ${groupSize}
*No escaparás...*
> Tu alma ahora es nuestra 👁️`.trim()
    
    await conn.sendMini(
      m.chat, 
      'ﮩ٨ـﮩﮩ٨ــ𝙉𝙪𝙚𝙫𝙖 𝙑𝙞𝙘𝙩𝙞𝙢𝙖ﮩ٨ـﮩﮩ٨ــ',
      dev, 
      bienvenida, 
      imgBienvenida, 
      imgBienvenida, 
      redes, 
      fkontak
    )
  }

  // Mensaje de DESPEDIDA (imagen personalizada)
  if (chat.welcome && (m.messageStubType == 28 || m.messageStubType == 32)) {
    const mention = m.messageStubParameters[0].split('@')[0]
    const bye = `
☠️ *▄︻デ══━💀 @${mention}...*  
*¡Señal perdida! El objetivo ha abandonado la red oscura.*

${global.welcom2}

✦ Sobrevivientes: ${groupSize} 
*La cacería no termina...*
> Tu sangre aún nos pertenece 🩸`.trim()
    
    await conn.sendMini(
      m.chat, 
      'ﮩ٨ـﮩﮩ٨ــ𝘿𝙚𝙨𝙘𝙤𝙣𝙚𝙘𝙩𝙖𝙙𝙤ﮩ٨ـﮩﮩ٨ــ',
      dev, 
      bye, 
      imgDespedida, // Imagen diferente para despedida
      imgDespedida, 
      redes, 
      fkontak
    )
  }
}