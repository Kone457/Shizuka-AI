import fetch from 'node-fetch'

let preguntasReto = [
  "😈 Llama a tu ex y dile que aún la amas",
  "🤡 Manda un audio cantando reggaeton desafinado",
  "💀 Publica en tu estado 'Estoy soltero' por 1 hora",
  "🖕 Dile a tu crush que te cae mal",
  "🤣 Haz 10 flexiones ahora mismo",
  "💔 Cambia tu foto de perfil por una de tu ex",
  "😭 Llama a tu mamá y dile 'te amo' llorando",
  "🤑 Manda $5 a un desconocido del grupo",
  "🍺 Toma un shot de lo que tengas cerca",
  "📱 Elimina a 3 contactos aleatorios",
  "🎤 Canta una canción de Shakira en voz alta",
  "👅 Lame tu codo (si puedes)",
  "🤮 Come algo que odies frente a cámara",
  "💩 Admite tu peor hábito asqueroso",
  "🛌 Acuéstate en el piso por 2 minutos",
  "🗣️ Grita 'soy un perdedor' 3 veces",
  "📸 Sube una foto tuya de bebé",
  "🤥 Di 3 mentiras sobre ti",
  "🤡 Haz un baile ridículo por 30 segundos",
  "💀 Cambia tu nombre en WhatsApp por 'Patético'",
  "🖤 Bloquea a alguien que te guste",
  "🤢 Bebe salsa picante pura",
  "🎭 Actúa como un mono por 1 minuto",
  "📞 Llama a un amigo y solo gruñe",
  "💔 Confiesa tu mayor fracaso amoroso",
  "🤑 Gasta $10 en algo inútil",
  "🍌 Come un plátano de forma sensual",
  "🤣 Ríete como villano por 10 segundos",
  "💩 Admite algo vergonzoso de tu infancia",
  "🤡 Haz un tiktok ridículo y compártelo",
  "🛑 Deja de usar redes por 24 horas",
  "🗑️ Tira algo que ames a la basura",
  "🎤 Rappea tu lista del supermercado",
  "💀 Habla como bebé por 5 mensajes",
  "🤮 Besa tu propio pie",
  "📸 Envía tu peor foto a todos tus contactos",
  "🖕 Insulta a tu mejor amigo (de broma)",
  "🤥 Inventa una enfermedad y actúala",
  "🍺 Bebe agua como si fuera vodka",
  "💔 Escribe una carta de amor a ti mismo",
  "🤡 Camina como pingüino por tu casa",
  "🎭 Imita a tu profesor más odiado",
  "📞 Llama a pizza y pide un helado",
  "🤑 Regala algo valioso a un extraño",
  "🤣 Cuenta el chiste más malo que sepas",
  "💀 Publica 'soy gay' en tu estado",
  "🤢 Come ajo crudo",
  "🗣️ Habla con acento extranjero falso todo el día",
  "📱 Usa fondo de pantalla de tu ex",
  "🛌 Duerme en el suelo esta noche",
  "🎤 Canta el himno nacional en ropa interior"
]

let preguntasVerdad = [
  "💀 ¿Alguna vez te has robado algo?",
  "🤡 ¿Cuál es tu mayor miedo?",
  "💔 ¿Alguna vez has hecho trampa en un examen?",
  "🖕 ¿Qué es lo más cobarde que has hecho?",
  "😏 Todavía piensas en tu ex",
  "🥺 Volverías con tu ex si ella te lo pide",
  "🤢 ¿Has orinado en la ducha?",
  "📸 ¿Tienes fotos comprometedoras en tu teléfono?",
  "🤑 ¿Cuánto dinero tienes ahorrado?",
  "🍺 ¿La última vez que vomitaste por alcohol?",
  "🤥 ¿Mientes seguido?",
  "💩 ¿Cuál es tu hábito más asqueroso?",
  "🎭 ¿Alguna vez te han arrestado?",
  "📞 ¿Has ghosteado a alguien?",
  "🤮 ¿Lo más repugnante que has comido?",
  "🛌 ¿Duermes desnudo?",
  "🗣️ ¿Has hablado mal de un amigo?",
  "🤣 ¿Te has meado de la risa?",
  "💀 ¿Has fingido un orgasmo?",
  "🖤 ¿Alguna vez has besado al mismo sexo?",
  "🤡 ¿Te gusta alguien del grupo?",
  "🍌 ¿Tienes fetiches raros?",
  "📱 ¿Revisas el teléfono de tu pareja?",
  "💔 ¿Has llorado por un ex?",
  "🤑 ¿Has pagado por sexo?",
  "🎤 ¿Cantas en el baño?",
  "🤥 ¿Has fingido estar enfermo para no trabajar?",
  "💩 ¿Te hueles los pedos?",
  "🤢 ¿Has comido comida del piso?",
  "🗑️ ¿Guardas cosas inútiles?",
  "🎭 ¿Te has hecho el muerto?",
  "📞 ¿Has llamado a tu ex borracho?",
  "🖕 ¿Odias a alguien de tu familia?",
  "🤣 ¿Te gustan los memes de tu ex?",
  "💀 ¿Has tenido sueños eróticos con famosos?",
  "🍺 ¿Te emborrachas solo?",
  "📸 ¿Te tomas selfies desnudo?",
  "🤡 ¿Crees en el amor?",
  "💔 ¿Has sido infiel?",
  "🤑 ¿Has pirateado algo?",
  "🎤 ¿Bailas frente al espejo?",
  "🤥 ¿Mientes en tu CV?",
  "💩 ¿Te limpias mal?",
  "🤮 ¿Has vomitado en público?",
  "🛌 ¿Roncas?",
  "🗣️ ¿Hablas dormido?",
  "📱 ¿Eres adicto al porno?",
  "💀 ¿Has stalkeado a alguien por horas?",
  "🤡 ¿Te da miedo el compromiso?",
  "🍌 ¿Tienes onlyfans?",
  "🖤 ¿Te has enamorado de un amigo?",
  "🎭 ¿Finges personalidad en redes?"
]

let handler = async (m, { conn, usedPrefix, command }) => {
  let tipo = command.toLowerCase()

  await conn.sendMessage(m.chat, {
    react: {
      text: '🎲',
      key: m.key
    }
  })

  if (tipo === 'reto') {
    let pregunta = preguntasReto[Math.floor(Math.random() * preguntasReto.length)]
    await conn.reply(m.chat, `🤡 *RETO PARA TI, PERDEDOR:*\n\n${pregunta}\n\n💔 *Ella te dejó por no aceptar retos como este*`, m)
  } 
  else if (tipo === 'verdad') {
    let pregunta = preguntasVerdad[Math.floor(Math.random() * preguntasVerdad.length)]
    await conn.reply(m.chat, `💀 *VERDAD QUE TE DUELE:*\n\n${pregunta}\n\n😭 *Responde o ella seguirá burlándose de ti*`, m)
  }
  else {
    let opcion = Math.random() < 0.5 ? 'reto' : 'verdad'
    let arrayPreguntas = opcion === 'reto' ? preguntasReto : preguntasVerdad
    let pregunta = arrayPreguntas[Math.floor(Math.random() * arrayPreguntas.length)]

    await conn.reply(m.chat, `🎭 *${opcion.toUpperCase()} (ALEATORIO):*\n\n${pregunta}\n\n🤣 *Ella apostó a que no te atreves*`, m)
  }
}

handler.help = ['reto', 'verdad']
handler.tags = ['fun']
handler.command = ['reto', 'verdad', 'retoo', 'verdadd']
handler.register = true

export default handler