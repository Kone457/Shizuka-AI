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

  let chat = global.db.data.chats[m.chat]
  let groupSize = participants.length

  // Ajustar tamaño del grupo según el tipo de evento
  m.messageStubType == 27 ? groupSize++ : 
  (m.messageStubType == 28 || m.messageStubType == 32) && groupSize--

  // 🎉 BIENVENIDA con imagen generada por Delirius API
  if (chat.welcome && m.messageStubType == 27) {
    const mention = m.messageStubParameters[0].split('@')[0]
    const nombre = await conn.getName(m.messageStubParameters[0])
    const fotoPerfil = await conn.profilePictureUrl(m.messageStubParameters[0], 'image').catch(_ => 'https://i.postimg.cc/Hk6hNCDw/quotedelirius.jpg')

    const texto = `Welcome to the official Delirius API 😈`
    const footer = `${nombre} 😨`
    const apiDelirius = `https://delirius-apiofc.vercel.app/canvas/quote?image=${encodeURIComponent(fotoPerfil)}&text=${encodeURIComponent(texto)}&footer=${encodeURIComponent(footer)}`

    let imgDelirius
    try {
      const res = await fetch(apiDelirius)
      if (!res.ok) throw new Error('API Delirius falló')
      imgDelirius = await res.buffer()
    } catch (err) {
      console.error('⚠️ Error al generar imagen Delirius:', err)
      imgDelirius = await (await fetch('https://i.postimg.cc/Hk6hNCDw/quotedelirius.jpg')).buffer()
    }

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
      imgDelirius, 
      imgDelirius, 
      redes, 
      fkontak
    )
  }

  // 💀 DESPEDIDA con imagen personalizada
  if (chat.welcome && (m.messageStubType == 28 || m.messageStubType == 32)) {
    const mention = m.messageStubParameters[0].split('@')[0]
    const imgDespedida = await (await fetch('https://qu.ax/cLXXz.jpg')).buffer()

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
      imgDespedida, 
      imgDespedida, 
      redes, 
      fkontak
    )
  }
}