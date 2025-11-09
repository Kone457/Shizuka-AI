import { createHash } from 'crypto'
import fetch from 'node-fetch'

const Reg = /\|?(.*)([.|] *?)([0-9]*)$/i
const CANAL_ID = '120363400241973967@newsletter' // Canal al que se enviará el mensaje
const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1436892691433521183/C_wUqs-yclWsiUS6gxvZuedIAxEnRI5UUKSUh-uYhAbrfDg_HhfXawcSjz1gmSuaovWc'

let handler = async function (m, { conn, text, usedPrefix, command }) {
  const user = global.db.data.users[m.sender]
  const name2 = conn.getName(m.sender)
  const whe = m.quoted?.sender || m.mentionedJid?.[0] || m.sender
  const perfil = await conn.profilePictureUrl(whe, 'image').catch(_ => 'https://qu.ax/XGJKb.jpg')
  const perfilImg = perfil || 'https://qu.ax/fYpnX.jpg'

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
  user.regTime = +new Date()
  user.registered = true
  user.money += 600
  user.estrellas += 15
  user.exp += 245
  user.joincount += 5

  const sn = createHash('md5').update(m.sender).digest('hex')

  // 🌟 Mensaje privado al usuario
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

  // 🎉 Mensaje al canal de difusión
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
    console.log("Mensaje enviado al canal correctamente.")
  } catch (e) {
    console.error("Error al enviar el mensaje al canal:", e)
  }

  // 🌐 Enviar registro al webhook de Discord con embed rojo
  try {
    await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        embeds: [
          {
            title: "Nuevo registro en Shizuka 🎉",
            color: 16711680, // rojo
            fields: [
              { name: "Usuario", value: m.pushName || 'Anónimo', inline: true },
              { name: "Nombre", value: user.name, inline: true },
              { name: "Edad", value: String(user.age), inline: true },
              { name: "ID", value: sn, inline: true },
              { name: "Descripción", value: user.descripcion || 'Sin descripción', inline: false }
            ],
            thumbnail: { url: perfilImg },
            timestamp: new Date()
          }
        ]
      })
    })
    console.log("Registro enviado al webhook de Discord correctamente (embed rojo).")
  } catch (e) {
    console.error("❌ Error al enviar registro al webhook:", e)
  }
}

handler.help = ['register']
handler.tags = ['user']
handler.command = ['verify', 'verificar', 'reg', 'register', 'registrar']

export default handler