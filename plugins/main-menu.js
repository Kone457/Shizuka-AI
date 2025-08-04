let handler = async (m, { conn, args }) => {
    let userId = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.sender
    let user = global.db.data.users[userId]
    let name = conn.getName(userId)
    let _uptime = process.uptime() * 1000
    let uptime = clockString(_uptime)
    let totalreg = Object.keys(global.db.data.users).length
    let totalCommands = Object.values(global.plugins).filter((v) => v.help && v.tags).length
    
    let txt = `
╭━━〔 🌟 𝘽𝙞𝙚𝙣𝙫𝙚𝙣𝙞𝙙𝙤 🌟 〕━╮
┃ ¡Hola @${userId.split('@')[0]}!
┃ Soy *${botname}*, tu asistente virtual.
╰━━━━━━━━━━━━━━━━━━━━╯

╭━━━〔 📊 𝙀𝙨𝙩𝙖𝙙𝙞́𝙨𝙩𝙞𝙘𝙖𝙨 〕━━━╮
┃ 🕒 Tiempo activo: *${uptime}*
┃ 👥 Usuarios registrados: *${totalreg}*
┃ 📚 Comandos disponibles: *${totalCommands}*
╰━━━━━━━━━━━━━━━━━━━━━╯

╭━━━〔 𝙄𝙣𝙛𝙤-𝘽𝙤𝙩 ☄️ 〕━━━╮
┃ 🛠️ #menu       » Lista de comandos
┃ ⏱️ #uptime     » Tiempo activo del bot
┃ 💻 #sc         » Repositorio oficial
┃ 🧠 #staff      » Desarrolladores
┃ 🧑‍💼 #creador   » Contacto del creador
┃ 📊 #status     » Estado actual del bot
┃ 🔗 #links      » Enlaces oficiales
┃ 🧾 #infobot    » Información general
┃ 📶 #ping       » Latencia de conexión
┃ 🚀 #speed      » Estadísticas de velocidad
╰━━━━━━━━━━━━━━━━━━━━╯

╭━━━〔 🧍 Registro 〕━━━╮
┃ 📝 #reg        » Registrarse
┃ ❌ #unreg      » Borrar registro
┃ 🧑‍💻 #profile   » Tu perfil
┃ 🔢 #myns       » Número de serie
╰━━━━━━━━━━━━━━━━━━╯

╭━━━〔 📥 Descargas 〕━━━╮
┃ 🎵 #play       » Música por nombre
┃ 🎧 #ytmp3      » Audio desde YouTube
┃ 🎞️ #ytmp4      » Video desde YouTube
┃ 🎬 #tiktok     » Video desde TikTok
┃ 📷 #instagram  » Media desde Instagram
┃ 📘 #facebook   » Video desde Facebook
┃ 🐦 #twitter    » Descarga desde Twitter
┃ 🎼 #spotify    » Canción desde Spotify
┃ 📂 #mediafire  » Archivos de MediaFire
┃ 📦 #mega       » Archivos de Mega
╰━━━━━━━━━━━━━━━━━━━━╯

╭━━━〔 🔍 𝘽𝙪𝙨𝙘𝙖𝙙𝙤𝙧𝙚𝙨 〕━━━╮
┃ 🌐 #google        » Buscar en Google
┃ 🖼️ #imagen        » Imágenes desde Google
┃ 📌 #pinterest     » Buscar en Pinterest
┃ 🎥 #yts           » Videos en YouTube
┃ 📦 #npmjs         » Paquetes NPM
┃ 🧬 #github        » Repositorios GitHub
┃ 🎌 #infoanime     » Info de Anime
╰━━━━━━━━━━━━━━━━━━━╯

╭━━〔 ♻️ 𝘾𝙤𝙣𝙫𝙚𝙧𝙩𝙞𝙙𝙤𝙧𝙚𝙨 〕━╮
┃ 🎶 #tomp3         » Video a MP3
┃ 🎞️ #tovideo       » Convertir a video
┃ 🔗 #tourl         » Archivo a enlace
┃ 🗣️ #tts           » Texto a voz
┃ 🌀 #togif         » Video a GIF
╰━━━━━━━━━━━━━━━━━━━╯

╭━〔 🤖 𝙄𝙣𝙩𝙚𝙡𝙞𝙜𝙚𝙣𝙘𝙞𝙖 𝘼𝙧𝙩𝙞𝙛𝙞𝙘𝙞𝙖𝙡 〕━╮
┃ 💬 #ia            » Chat con IA
┃ 🤖 #gemini        » Gemini AI
┃ 🎨 #dalle         » Generar imágenes (IA)
┃ 💡 #flux          » Imágenes Flux
┃ 😺 #simi          » Habla con SimSimi
╰━━━━━━━━━━━━━━━━━━━━━━━╯

╭━〔 🎌 𝘼𝙣𝙞𝙢𝙚 & 𝘼𝙘𝙘𝙞𝙤𝙣𝙚𝙨 〕━╮
┃ 💘 #waifu         » Imagen waifu
┃ 🤗 #hug           » Abrazo
┃ 😘 #kiss          » Beso
┃ 👋 #pat           » Acariciar
┃ 👋 #slap          » Bofetada
┃ 😠 #angry         » Enfadarse
┃ 😄 #happy         » Alegría
┃ 😢 #sad           » Tristeza
┃ ❤️ #love          » Amor
┃ 😭 #cry           » Llorar
┃ 💃 #dance         » Bailar
┃ 😴 #sleep         » Dormir
╰━━━━━━━━━━━━━━━━━━━╯

╭━━━〔 🧩 𝙎𝙩𝙞𝙘𝙠𝙚𝙧𝙨 〕━━━╮
┃ 🖼️ #sticker       » Crear sticker
┃ 🧬 #emojimix      » Fusionar emojis
┃ 💧 #wm            » Marca de agua
┃ ✏️ #take          » Renombrar sticker
╰━━━━━━━━━━━━━━━━━╯

╭━━━〔 📎 𝘿𝙚𝙨𝙘𝙖𝙧𝙜𝙖𝙨 〕━━━╮
┃ 🎵 #play          » Descargar audio
┃ 🎬 #play2         » Descargar video
┃ 🕺 #tiktok         » Videos de TikTok
┃ 📘 #facebook       » Videos de Facebook
┃ 🐦 #twitter        » Videos de Twitter
┃ 📷 #instagram      » Medios de Instagram
┃ 📂 #mediafire      » Archivos MediaFire
┃ 📦 #mega           » Archivos Mega
┃ 🧊 #terabox        » Descargas de Terabox
┃ 🧬 #gitclone       » Clonar de GitHub
┃ 📥 #pinvid         » Videos de Pinterest
┃ 🛠 #apk            » APKs de Aptoide
╰━━━━━━━━━━━━━━━━━━━╯

╭━━〔 💰 𝙀𝙘𝙤𝙣𝙤𝙢í𝙖 〕━━╮
┃ 🛠️ #work        » Trabaja por ${moneda}
┃ 🎲 #suerte      » Apuesta tu ${moneda}
┃ 💣 #crime       » Realiza un crimen
┃ 🎰 #ruleta      » Juega a la ruleta
┃ 🏦 #casino      » Prueba suerte en el casino
┃ 🎰 #slot        » Slot de la fortuna
┃ 👛 #cartera     » Ver billetera
┃ 🏛️ #bank        » Ver cuenta bancaria
┃ 💳 #depositar   » Deposita ${moneda}
┃ 🏧 #retirar     » Retira del banco
┃ 🔁 #transfer    » Transferir ${moneda}/XP
┃ ⛏️ #minar       » Trabajo de minería
┃ 🛒 #buy         » Comprar con XP
┃ 📆 #daily       » Recompensa diaria
┃ 🎁 #cofre       » Cofre diario
┃ 📅 #semanal     » Regalo semanal
┃ 📆 #mensual     » Recompensa mensual
┃ 🦹 #robar       » Roba ${moneda}
┃ 🧠 #robarxp     » Roba experiencia
┃ 🏆 #baltop      » Ranking global
┃ 🧭 #aventura    » Viaje de aventura
┃ 💉 #curar       » Recupera tu salud
┃ 🐗 #cazar       » Caza animales
┃ 🎒 #inventario  » Ver inventario
┃ 🏰 #mazmorra    » Explora mazmorras
┃ 🎃 #halloween   » Evento especial
┃ 🎄 #navidad     » Regalo navideño
╰━━━━━━━━━━━━━━━━━━╯

╭━〔 🎴 𝙂𝙖𝙘𝙝𝙖 & 𝙋𝙚𝙧𝙨𝙤𝙣𝙖𝙟𝙚𝙨 〕━╮
┃ 🎎 #rw          » Waifu o husbando random
┃ 📥 #claim       » Reclamar personaje
┃ 📜 ##waifus     » Tus personajes
┃ 🎭 #wimage      » Imagen aleatoria
┃ 🧾 #winfo       » Info del personaje
┃ 🎁 #regalar     » Regala personaje
┃ 🗳️ #votar       » Vota por personaje
┃ 🔝 #waifustop   » Ranking waifus
╰━━━━━━━━━━━━━━━━━━━━━━━━╯

╭━━〔 🖼️ 𝙎𝙩𝙞𝙘𝙠𝙚𝙧𝙨 〕━━╮
┃ 🧷 #sticker     » Crear sticker
┃ ✍️ #setmeta     » Fijar autor del pack
┃ 🧹 #delmeta     » Eliminar pack
┃ 👤 #pfp         » Foto de perfil
┃ 🧾 #qc          » Sticker con texto
┃ 📤 #img         » Sticker a imagen
┃ 💬 #attp        » Sticker estilo texto
┃ 💞 #emojimix    » Fusión de emojis
┃ 🖋️ #wm          » Marcar sticker
╰━━━━━━━━━━━━━━━━━╯

╭━━〔 🧰 𝙃𝙚𝙧𝙧𝙖𝙢𝙞𝙚𝙣𝙩𝙖𝙨 〕━━╮
┃ ➗ #calcular    » Resolver ecuaciones
┃ 🌦️ #clima       » Clima de un país
┃ 🕒 #horario     » Hora global
┃ 🧪 #fake        » Mensaje falso
┃ 🖼️ #hd          » Mejorar imagen
┃ ✒️ #letra       » Cambiar fuente
┃ 👁️ #ver         » Ver imágenes fugaces
┃ 🎶 #shazam      » Detectar canción
┃ 📡 #ss          » Estado de una web
┃ 🔍 #tamaño      » Escalar imágenes
┃ 🗣️ #say         » Repetir texto
┃ 📝 #todoc       » Documento multimedia
┃ 🌍 #traducir    » Traductor universal
╰━━━━━━━━━━━━━━━━╯

╭━━〔 👤 𝙋𝙚𝙧𝙛𝙞𝙡 〕━━╮
┃ 📝 #reg         » Registro de usuario
┃ ❌ #unreg       » Eliminar registro
┃ 🧑‍💻 #profile    » Mostrar perfil
┃ 💍 #marry       » Proponer matrimonio
┃ 💔 #divorce     » Divorciarse
┃ 🚻 #setgenero   » Establecer género
┃ 🧽 #delgenero   » Borrar género
┃ 🎂 #setbirth    » Registrar cumpleaños
┃ 🗑️ #delbirth    » Borrar cumpleaños
┃ 🧾 #setdesc     » Descripción personal
┃ ✂️ #deldesc     » Quitar descripción
┃ 🏅 #lb          » Top de usuarios
┃ 🆙 #level       » Nivel de experiencia
┃ 💎 #premium     » Activar premium
┃ 💌 #confesar    » Declarar sentimientos
╰━━━━━━━━━━━━━━━━━╯

╭━━〔 👥 𝙂𝙧𝙪𝙥𝙤𝙨 〕━━╮
┃ 📢 #tag           » Mencionar a todos
┃ 🏷️ #gp            » Información del grupo
┃ 🧍 #linea         » Usuarios en línea
┃ 🎉 #setwelcome    » Mensaje de bienvenida
┃ 👋 #setbye        » Mensaje de despedida
┃ 🔗 #link          » Enlace del grupo
┃ 👑 #admin         » Mencionar admins
┃ ♻️ #revoke        » Restablecer enlace
┃ 🔓 #group open    » Abrir grupo
┃ 🔒 #group close   » Cerrar grupo
┃ 👢 #kick          » Eliminar usuario
┃ ➕ #add           » Agregar usuario
┃ 📈 #promote       » Promover a admin
┃ 📉 #demote        » Quitar admin
┃ 🖼️ #gpbanner      » Cambiar imagen del grupo
┃ ✏️ #gpname        » Cambiar nombre
┃ 📝 #gpdesc        » Cambiar descripción
┃ ⚠️ #warn          » Dar advertencia
┃ ✅ #unwarn        » Quitar advertencia
┃ 🗂️ #advlist       » Ver advertidos
┃ ⚙️ #bot on        » Encender bot
┃ 📴 #bot off       » Apagar bot
┃ 🔇 #mute          » Silenciar usuario
┃ 🔊 #unmute        » Quitar silencio
┃ 📊 #poll          » Crear encuesta
┃ 🗑️ #delete        » Borrar mensaje
┃ 👻 #fantasmas     » Ver inactivos
┃ 🧹 #kickfantasmas » Eliminar inactivos
┃ 🧙 #invocar       » Invocar a todos
┃ 🌟 #setemoji      » Establecer emoji
┃ 🔢 #kicknum       » Kick por código país
╰━━━━━━━━━━━━━━━━━━╯

╭━━〔 🎌 𝘼𝙣𝙞𝙢𝙚 〕━━╮
┃ 😡 #angry         » Estar enojado
┃ 😬 #bite          » Morder a alguien
┃ 😛 #bleh          » Sacar lengua
┃ 😊 #blush         » Sonrojarse
┃ 😑 #bored         » Estar aburrido
┃ 😢 #cry           » Llorar
┃ 🤗 #cuddle        » Acurrucarse
┃ 💃 #dance         » Bailar un rato
┃ 🥴 #drunk         » Estar borracho
┃ 🍔 #comer         » Comer algo
┃ 🤦 #facepalm      » Palmada en la cara
┃ 😄 #happy         » Estar feliz
┃ 🤝 #hug           » Abrazar
┃ 💋 #kiss          » Dar un beso
┃ 😂 #laugh         » Reír
┃ 👅 #lick          » Lamer (sano)
┃ ❤️ #love          » Enamorarse
┃ 🖐️ #pat          » Acariciar
┃ 👈 #poke          » Picar a alguien
┃ 😤 #pout          » Puchero
┃ 👊 #punch         » Puñetazo amistoso
┃ 🏃 #run           » Correr
┃ 😔 #sad           » Mostrar tristeza
┃ 😱 #scared        » Asustado
┃ 🙈 #shy           » Timidez
┃ ✋ #slap          » Bofetada
┃ 🌞 #dias          » Buenos días
┃ 🌙 #noches        » Buenas noches
┃ 💤 #sleep         » Dormir
┃ 🤔 #think         » Pensar en algo
╰━━━━━━━━━━━━━━━━━╯


  `.trim()

  await conn.sendMessage(m.chat, { 
      text: txt,
      contextInfo: {
          mentionedJid: [m.sender, userId],
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
              newsletterJid: channelRD.id,
              newsletterName: channelRD.name,
              serverMessageId: -1,
          },
          forwardingScore: 999,
          externalAdReply: {
              title: botname,
              body: textbot,
              thumbnailUrl: banner,
              sourceUrl: redes,
              mediaType: 1,
              showAdAttribution: true,
              renderLargerThumbnail: true,
          },
      },
  }, { quoted: m })

}

handler.help = ['menu']
handler.tags = ['main']
handler.command = ['menu', 'menú', 'help']

export default handler

function clockString(ms) {
    let seconds = Math.floor((ms / 1000) % 60)
    let minutes = Math.floor((ms / (1000 * 60)) % 60)
    let hours = Math.floor((ms / (1000 * 60 * 60)) % 24)
    return `${hours}h ${minutes}m ${seconds}s`
}
