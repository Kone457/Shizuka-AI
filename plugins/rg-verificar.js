import { createHash } from 'crypto'
import moment from 'moment-timezone'
import fetch from 'node-fetch'
import dotenv from 'dotenv'
dotenv.config()

const Reg = /\|?(.*)([.|] *?)([0-9]*)$/i

let handler = async function (m, { conn, text, args, usedPrefix, command }) {
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
✨ Que tus datos conecten con emociones.
`

  await conn.sendMessage(m.chat, {
    text: regbot,
    contextInfo: {
      externalAdReply: {
        title: '📌 REGISTRADO EN SHIZUKA',
        body: '✨ Has sido vinculado con los hilos del destino.',
        thumbnailUrl: perfilImg,
        sourceUrl: 'https://shizuka.bot/perfil',
        mediaType: 1,
        showAdAttribution: false,
        renderLargerThumbnail: true
      }
    }
  }, { quoted: m })

  await m.react('📪')

  // 📤 Envío a Discord usando token y canal ID
  const discordBotToken = process.env.DISCORD_BOT_TOKEN
  const discordChannelId = process.env.DISCORD_CHANNEL_ID

  const discordMessage = {
    content: `🌸 **Nuevo registro en Shizuka** 🌸`,
    embeds: [{
      title: 'Registro completado',
      color: 0xf9a8d4,
      thumbnail: { url: perfilImg },
      fields: [
        { name: '👤 Usuario', value: m.pushName || 'Anónimo', inline: true },
        { name: '📖 Nombre real', value: user.name, inline: true },
        { name: '🎂 Edad', value: `${user.age} años`, inline: true },
        { name: '🔐 ID', value: sn, inline: false },
        { name: '💌 Descripción', value: user.descripcion || 'Sin descripción', inline: false }
      ],
      footer: {
        text: `Registrado por ${dev} • ${moment().tz('America/Havana').format('DD/MM/YYYY HH:mm:ss')}`
      }
    }]
  }

  try {
    await fetch(`https://discord.com/api/v10/channels/${discordChannelId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bot ${discordBotToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(discordMessage)
    })
  } catch (err) {
    console.error('❌ Error al enviar mensaje a Discord:', err)
  }
}

handler.help = ['register']
handler.tags = ['user']
handler.command = ['verify', 'verificar', 'reg', 'register', 'registrar']

export default handler