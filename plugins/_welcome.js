import fetch from 'node-fetch'

export async function before(m, { conn, participants }) {
  if (!m.messageStubType || !m.isGroup || !(m.messageStubType == 28 || m.messageStubType == 32)) return

  const miembro = participants.length - 1
  const nombre = await conn.getName(m.messageStubParameters[0]) || 'Desconocido'
  const avatar = await conn.profilePictureUrl(m.messageStubParameters[0], 'image').catch(_ => 'https://cdn.discordapp.com/embed/avatars/0.png')

  const urlPopCat = `https://api.popcat.xyz/v2/goodbyecard?background=https://cdn.popcat.xyz/goodbye-bg.png&text1=${encodeURIComponent(nombre)}&text2=${encodeURIComponent('Ha abandonado la Comunidad Pop Cat')}&text3=${encodeURIComponent(`Quedan ${miembro} miembros`)}&avatar=${encodeURIComponent(avatar)}`
  const imgDespedida = await (await fetch(urlPopCat)).buffer()

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

  const despedida = `
👋 *@${m.messageStubParameters[0].split('@')[0]} ha salido del grupo*  
La Comunidad Pop Cat se despide con respeto 🐾  
Ahora somos ${miembro} miembros  
`.trim()

  await conn.sendMini(
    m.chat,
    '💨 𝘿𝙚𝙨𝙥𝙚𝙙𝙞𝙙𝙖 💨',
    dev,
    despedida,
    imgDespedida,
    imgDespedida,
    redes,
    fkontak
  )
}