
import { WAMessageStubType } from '@whiskeysockets/baileys'
import fetch from 'node-fetch'

export async function before(m, { conn, participants, groupMetadata }) {
  try {
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

    const chat = global.db?.data?.chats?.[m.chat] || {}
    if (!chat.welcome) return true

    // Fotos por defecto (usadas como fallback)
    const ppFallback = 'https://qu.ax/rnsuj.jpg' // avatar fallback
    const ppDespedidaFallback = 'https://qu.ax/OTGDz.jpg' // despedida fallback

    // Cantidad base de miembros
    let groupSize = (participants || []).length
    if (m.messageStubType === 27) groupSize++
    if (m.messageStubType === 28 || m.messageStubType === 32) groupSize--

    const groupName = groupMetadata?.subject || 'este grupo'
    const userJid = (m.messageStubParameters && m.messageStubParameters[0]) || m.sender
    if (!userJid) return true
    const mention = userJid.split('@')[0]
    const userName = await conn.getName(userJid).catch(() => mention)

    // Avatares (try profile pic, fallback)
    const avatar = await conn.profilePictureUrl(userJid, 'image').catch(() => 'https://cdn.discordapp.com/embed/avatars/0.png')

    // Backgrounds (puedes cambiarlos)
    const backgroundJoin = 'https://cdn.popcat.xyz/welcome-bg.png'
    const backgroundLeave = 'https://cdn.popcat.xyz/welcome-bg.png' // puedes usar otro para despedida

    // Helper: genera imagen desde Popcat y devuelve Buffer (o fallback a avatar/fallbacks)
    const genPopcatImage = async (isJoin, userNameLocal, avatarUrl, groupNameLocal, groupSizeLocal) => {
      const text1 = userNameLocal
      const text2 = isJoin ? `Bienvenido a ${groupNameLocal}` : `Ha salido de ${groupNameLocal}`
      const text3 = `Miembro ${groupSizeLocal}`
      const bg = isJoin ? backgroundJoin : backgroundLeave

      const popcatUrl = `https://api.popcat.xyz/v2/welcomecard?background=${encodeURIComponent(bg)}&text1=${encodeURIComponent(text1)}&text2=${encodeURIComponent(text2)}&text3=${encodeURIComponent(text3)}&avatar=${encodeURIComponent(avatarUrl)}`

      try {
        const resp = await fetch(popcatUrl)
        if (!resp.ok) throw new Error('Popcat API no respondió')
        const buf = await resp.buffer()
        if (buf && buf.length) return buf
        throw new Error('Imagen vacía de Popcat')
      } catch (err) {
        // fallback: intenta bajar avatar, si falla usa imagen por defecto
        try {
          const r2 = await fetch(avatarUrl)
          if (r2.ok) return await r2.buffer()
        } catch (e) {}
        try {
          const r3 = await fetch(isJoin ? ppFallback : ppDespedidaFallback)
          if (r3.ok) return await r3.buffer()
        } catch (e) {}
        return Buffer.from('') // vacío si todo falla
      }
    }

    // --- BIENVENIDA ---
    if (m.messageStubType === 27) {
      const bienvenidaText = `
☠️ *▄︻デ══━💀 @${mention}...*  
*Tu huella digital ha sido rastreada. Bienvenido a la red oscura.*

${global.welcom1 || ''}

✦ Presas en el sistema: ${groupSize}
*No escaparás...*
> Tu alma ahora es nuestra 👁️`.trim()

      const imgBienvenida = await genPopcatImage(true, userName, avatar, groupName, groupSize)

      // Enviar con sendMini si existe, si no usar sendMessage como fallback
      try {
        if (typeof conn.sendMini === 'function') {
          await conn.sendMini(
            m.chat,
            'ﮩ٨ـﮩﮩ٨ــ𝙉𝙪𝙚𝙫𝙖 𝙑𝙞𝙘𝙩𝙞𝙢𝙖ﮩ٨ـﮩﮩ٨ــ',
            typeof dev !== 'undefined' ? dev : '',
            bienvenidaText,
            imgBienvenida,
            imgBienvenida,
            typeof redes !== 'undefined' ? redes : '',
            fkontak
          )
        } else {
          // fallback: enviar imagen con caption y mención
          await conn.sendMessage(m.chat, {
            image: imgBienvenida,
            caption: bienvenidaText,
            mentions: [userJid]
          }, { quoted: fkontak })
        }
      } catch (sendErr) {
        console.error('Error al enviar bienvenida:', sendErr)
        // último intento simple
        await conn.sendMessage(m.chat, { text: bienvenidaText }, { quoted: m })
      }
    }

    // --- DESPEDIDA ---
    if (m.messageStubType === 28 || m.messageStubType === 32) {
      const byeText = `
☠️ *▄︻デ══━💀 @${mention}...*  
*¡Señal perdida! El objetivo ha abandonado la red oscura.*

${global.welcom2 || ''}

✦ Sobrevivientes: ${groupSize} 
*La cacería no termina...*
> Tu sangre aún nos pertenece 🩸`.trim()

      const imgDespedida = await genPopcatImage(false, userName, avatar, groupName, groupSize)

      try {
        if (typeof conn.sendMini === 'function') {
          await conn.sendMini(
            m.chat,
            'ﮩ٨ـﮩﮩ٨ــ𝘿𝙚𝙨𝙘𝙤𝙣𝙚𝙘𝙩𝙖𝙙𝙤ﮩ٨ـﮩﮩ٨ــ',
            typeof dev !== 'undefined' ? dev : '',
            byeText,
            imgDespedida,
            imgDespedida,
            typeof redes !== 'undefined' ? redes : '',
            fkontak
          )
        } else {
          await conn.sendMessage(m.chat, {
            image: imgDespedida,
            caption: byeText,
            mentions: [userJid]
          }, { quoted: fkontak })
        }
      } catch (sendErr) {
        console.error('Error al enviar despedida:', sendErr)
        await conn.sendMessage(m.chat, { text: byeText }, { quoted: m })
      }
    }
  } catch (e) {
    console.error('Error en before (welcome/despedida):', e)
  }

  return true
}