import { createHash } from 'crypto'

const Reg = /\|?(.*)([.|] *?)([0-9]*)$/i
const AVISOS_GROUP_JID = '120363402449121688@g.us' // Grupo de avisos
const CANAL_ID = '120363400241973967@newsletter' // Canal al que se enviará el mensaje

let handler = async function (m, { conn, text, usedPrefix, command }) {
  const user = global.db.data.users[m.sender]
  const name2 = conn.getName(m.sender)
  const whe = m.quoted?.sender || m.mentionedJid?.[0] || m.sender
  const perfil = await conn.profilePictureUrl(whe, 'image').catch(_ => 'https://qu.ax/XGJKb.jpg')
  const perfilImg = perfil || 'https://qu.ax/fYpnX.jpg'
  const dev = 'Carlos ✨ '

  if (user.registered) {
    return m.reply(`💛 Ya estás registrado.\n¿Deseas volver a registrarte?\nUsa *${usedPrefix}unreg* para eliminar tu registro.`)
  }

  if (!Reg.test(text)) {
    return m.reply(`❌ Formato incorrecto\n\nUsa: ${usedPrefix + command} nombre.edad\nEjemplo: *${usedPrefix + command} ${name2}.20*`)
  }

  let [_, name, splitter, age] = text.match(Reg)
  if (!name || !age) return m.reply('💛 Nombre o edad no válidos.')
  if (name.length >= 100) return m.reply('💛 El nombre es demasiado largo.')
  age = parseInt(age)
  if (age < 5 || age > 1000) return m.reply('*Edad ingresada no válida*')

  user.name = name.trim()
  user.age = age
  user.regTime = +new Date
  user.registered = true
  user.money += 600
  user.estrellas += 15
  user.exp += 245
  user.joincount += 5

  const sn = createHash('md5').update(m.sender).digest('hex')

  const regbot = `
╭───── ❍ ✦ ❍ ─────╮
│   *🌸 REGISTRO COMPLETADO 🌸*
╰───── ❍ ✦ ❍ ─────╯

👤 *Nombre:* ${name}
🎂 *Edad:* ${age} años

🎁 *Bienvenido al universo Shizuka:*
┆💫 15 Estrellas
┆🪙 5 Coins
┆📈 245 Exp
┆🎟️ 12 Tokens

🔮 Usa *#perfil* para ver tu carta astral.
✨ Que tus datos conecten con emociones.\n\n
https://whatsapp.com/channel/0029VbAVMtj2f3EFmXmrzt0v
`

  // Mensaje privado
  await conn.sendMessage(m.chat, {
    text: regbot,
    contextInfo: {
      externalAdReply: {
        title: '📌 REGISTRADO EN SHIZUKA',
        body: '✨ Has sido vinculado con los hilos del destino.',
        thumbnailUrl: 'https://qu.ax/XGJKb.jpg',
        sourceUrl: 'https://shizuka.bot/perfil',
        mediaType: 1,
        showAdAttribution: false,
        renderLargerThumbnail: true
      }
    }
  }, { quoted: m })

  await m.react('📪')

  // Mensaje al grupo de avisos
  const channelMessage = `
╭━🌟 𝓢𝓱𝓲𝔃𝓾𝓴𝓪 𝓝𝓸𝓽𝓲𝓯𝓲𝓬𝓪𝓬𝓲𝓸𝓷  ━╮
┃ 🆕 *¡Nueva alma conectada al sistema...!*
┃
┃ 🖋️ *Usuario:* ${m.pushName || 'Anónimo'}
┃ 📖 *Nombre real:* ${user.name}
┃ 🎂 *Edad:* ${user.age} años
┃ 💌 *Descripción:* ${user.descripcion || 'Sin descripción'}
┃ 🔐 *ID:* ${sn}
┃
┃ ✨ _Los datos bailan entre bytes y constelaciones..._
╰━━━━━━━━━━━━━━━━━━━━━━━╯

🌈 *Shizuka celebra la llegada con magia y emoción.*
`

  await conn.sendMessage(AVISOS_GROUP_JID, {
    text: channelMessage,
    contextInfo: {
      externalAdReply: {
        title: '📌 NUEVO REGISTRO EN SHIZUKA',
        body: '🧡 Magia, datos y emociones en cada conexión.',
        thumbnailUrl: perfilImg, // <-- aquí usamos la foto del usuario
        sourceUrl: 'https://shizuka.bot/perfil',
        mediaType: 1,
        showAdAttribution: false,
        renderLargerThumbnail: true
      }
    }
  }, { quoted: null })

  // Mensaje al canal
  const canalMessage = `
🎉 *Nuevo Registro en Shizuka* 🎉

🖋️ *Usuario:* ${m.pushName || 'Anónimo'}
📖 *Nombre:* ${user.name}
🎂 *Edad:* ${user.age} años
📝 *ID de Usuario:* ${sn}

🌸 ¡Bienvenid@ al sistema de Shizuka! 🌸
`

  try {
    await conn.sendMessage(CANAL_ID, {
      text: canalMessage,
      contextInfo: {
        externalAdReply: {
          title: '📌 NUEVO REGISTRO',
          body: '💫 Un nuevo usuario se une a Shizuka.',
          thumbnailUrl: perfilImg, 
          sourceUrl: 'https://shizuka.bot/perfil',
          mediaType: 1,
          showAdAttribution: false,
          renderLargerThumbnail: true
        }
      }
    })
    console.log("Mensaje con imagen enviado al canal correctamente.")
  } catch (e) {
    console.error("Error al enviar el mensaje al canal:", e)
  }
}

handler.help = ['register']
handler.tags = ['user']
handler.command = ['verify', 'verificar', 'reg', 'register', 'registrar']

export default handler