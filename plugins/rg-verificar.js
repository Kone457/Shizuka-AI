import { createHash } from 'crypto'

// ▶️ JID de tu canal WhatsApp
const NEWSLETTER_JID = '120363400241973967@newsletter'

// Regex: nombre.edad  (ej: Mitsuri.20 o Mitsuri|20)
const Reg = /\|?(.*)([.|]\s*?)([0-9]{1,4})$/i

let handler = async function (m, { conn, text, usedPrefix, command }) {
  const user = global.db?.data?.users?.[m.sender] || (global.db.data.users[m.sender] = {})
  const name2 = conn.getName(m.sender)
  const dev = 'Carlos ✨ '

  // Defaults seguros
  user.money = Number.isFinite(user.money) ? user.money : 0
  user.estrellas = Number.isFinite(user.estrellas) ? user.estrellas : 0
  user.exp = Number.isFinite(user.exp) ? user.exp : 0
  user.joincount = Number.isFinite(user.joincount) ? user.joincount : 0

  if (user.registered) {
    return m.reply(`💛 Ya estás registrado.\n¿Deseas volver a registrarte?\nUsa *${usedPrefix}unreg* para eliminar tu registro.`)
  }

  if (!Reg.test(text || '')) {
    return m.reply(`❌ Formato incorrecto\n\nUsa: ${usedPrefix + command} nombre.edad\nEjemplo: *${usedPrefix + command} ${name2}.20*`)
  }

  let [_, name, splitter, age] = text.match(Reg)
  if (!name || !age) return m.reply('💛 Nombre o edad no válidos.')
  if (name.length >= 100) return m.reply('💛 El nombre es demasiado largo.')
  age = parseInt(age)
  if (age < 5 || age > 1000) return m.reply('*Edad ingresada no válida*')

  // Guardar registro
  user.name = name.trim()
  user.age = age
  user.regTime = +new Date()
  user.registered = true

  // Recompensas
  user.money += 600       // 600 Coins
  user.estrellas += 15    // 15 Estrellas
  user.exp += 245         // 245 Exp
  user.joincount += 5     // 5 Tokens

  const sn = createHash('md5').update(m.sender).digest('hex')

  const regbot = `
╭───── ❍ ✦ ❍ ─────╮
│   *🌸 REGISTRO COMPLETADO 🌸*
╰───── ❍ ✦ ❍ ─────╯

👤 *Nombre:* ${user.name}
🎂 *Edad:* ${user.age} años

🎁 *Bienvenido al universo Shizuka:*
┆💫 15 Estrellas
┆🪙 600 Coins
┆📈 245 Exp
┆🎟️ 5 Tokens

🔮 Usa *#perfil* para ver tu carta astral.
✨ Que tus datos conecten con emociones.
`.trim()

  // 📩 Confirmación solo al chat del usuario
  await conn.sendMessage(m.chat, { text: regbot }, { quoted: m })
  await m.react('📪')

  // 📡 Publicación en el canal WhatsApp
  const channelMessage = `
╭━━━━━━━━ 🌟 ＳＨＩＺＵＫＡ ＮＯＴＩＦＩＣＡＣＩＯ́Ｎ ━━━━━━━━╮
┃ 🆕 *¡Nueva alma conectada al sistema...!*
┃ 
┃ 🖋️ *Usuario:* ${m.pushName || 'Anónimo'}
┃ 📖 *Nombre real:* ${user.name}
┃ 🎂 *Edad:* ${user.age} años
┃ 💌 *Descripción:* ${user.descripcion || 'Sin descripción'}
┃ 🔐 *ID:* ${sn}
┃ 
┃ ✨ _Los datos bailan entre bytes y constelaciones..._
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯

🌈 *Shizuka Bot celebra la llegada con magia y emoción.*
📝 Por: ${dev}
`.trim()

  try {
    await conn.sendMessage(NEWSLETTER_JID, { text: channelMessage })
    await m.react('✅')
  } catch (e) {
    console.error('❌ Error enviando al canal:', e)
    await m.react('⚠️')
    await conn.sendMessage(m.chat, { text: '⚠️ No se pudo publicar en el canal.' }, { quoted: m })
  }
}

handler.help = ['register']
handler.tags = ['user']
handler.command = ['verify', 'verificar', 'reg', 'register', 'registrar']

export default handler