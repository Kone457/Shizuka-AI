import fetch from 'node-fetch'

export async function before(m, { conn, participants, groupMetadata }) {
  if (!m.messageStubType || !m.isGroup) return

  const chat = global.db.data.chats[m.chat]
  if (!chat.welcome) return

  const user = m.messageStubParameters?.[0]
  if (!user) return

  const nombre = await conn.getName(user).catch(_ => 'Miembro')
  const avatar = await conn.profilePictureUrl(user, 'image').catch(_ => 'https://cdn.discordapp.com/embed/avatars/0.png')
  const groupName = groupMetadata?.subject || 'el grupo'

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

  // BIENVENIDA
  if (m.messageStubType === 27) {
    const miembro = participants.length + 1
    const url = `https://api.popcat.xyz/v2/welcomecard?background=https://cdn.popcat.xyz/welcome-bg.png&text1=${encodeURIComponent(nombre)}&text2=${encodeURIComponent(`Bienvenido a ${groupName}`)}&text3=${encodeURIComponent(`Miembro ${miembro}`)}&avatar=${encodeURIComponent(avatar)}`
    const res = await fetch(url)
    const imgBienvenida = Buffer.from(await res.arrayBuffer())

    const caption = `🎉 *@${user.split('@')[0]} se ha unido a ${groupName}*\nBienvenido 🐾\n> Eres el miembro número ${miembro}`

    await conn.sendMessage(m.chat, {
      image: imgBienvenida,
      caption,
      contextInfo: { mentionedJid: [user] }
    }, { quoted: fkontak })
    console.log(`[✔️] Bienvenida enviada a ${nombre}`)
  }

  // DESPEDIDA
  if (m.messageStubType === 28 || m.messageStubType === 32) {
    const miembro = participants.length - 1
    const url = `https://api.popcat.xyz/v2/goodbyecard?background=https://cdn.popcat.xyz/goodbye-bg.png&text1=${encodeURIComponent(nombre)}&text2=${encodeURIComponent(`Ha salido de ${groupName}`)}&text3=${encodeURIComponent(`Quedan ${miembro} miembros`)}&avatar=${encodeURIComponent(avatar)}`
    const res = await fetch(url)
    const contentType = res.headers.get('content-type') || ''
    if (!contentType.includes('image')) {
      console.log(`[⚠️] La API no devolvió imagen válida: ${contentType}`)
      return
    }

    const imgDespedida = Buffer.from(await res.arrayBuffer())
    const caption = `👋 *@${user.split('@')[0]} ha salido de ${groupName}*\nNos despedimos con respeto 🐾\n> Ahora somos ${miembro} miembros`

    await conn.sendMessage(m.chat, {
      image: imgDespedida,
      caption,
      contextInfo: { mentionedJid: [user] }
    }, { quoted: fkontak })
    console.log(`[✔️] Despedida enviada a ${nombre}`)
  }
}