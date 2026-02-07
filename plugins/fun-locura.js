let handler = async (m, { conn, participants }) => {
  const sender = m.sender
  
  if (!m.isGroup) return m.reply('💀 *Esto solo funciona en grupos*\n\n🖕 Ella te dejó por ser antisocial')
  
  await conn.sendMessage(m.chat, {
    react: {
      text: '🤡',
      key: m.key
    }
  })
  
  let acciones = [
    { tipo: 'humillacion', texto: '😭 @user se meó encima en público' },
    { tipo: 'humillacion', texto: '🤡 @user fue rechazado por 10 personas en un día' },
    { tipo: 'humillacion', texto: '💀 @user cayó en la calle y todos se rieron' },
    { tipo: 'humillacion', texto: '🖕 @user lloró viendo telenovela' },
    { tipo: 'humillacion', texto: '🤣 @user confesó amor a su ex y lo bloquearon' },
    { tipo: 'castigo', texto: '💔 @user debe usar foto de perfil de su ex por 24h' },
    { tipo: 'castigo', texto: '📱 @user debe eliminar Instagram por una semana' },
    { tipo: 'castigo', texto: '💰 @user debe pagar $10 al grupo' },
    { tipo: 'castigo', texto: '🎤 @user debe cantar reggaeton en el grupo' },
    { tipo: 'desafio', texto: '🔥 @user debe llamar a su crush ahora mismo' },
    { tipo: 'desafio', texto: '💀 @user debe publicar selfie feo en estado' },
    { tipo: 'desafio', texto: '🤡 @user debe hacer 20 flexiones y grabarlo' },
    { tipo: 'tragedia', texto: '😭 La ex de @user se casó con su mejor amigo' },
    { tipo: 'tragedia', texto: '💔 @user fue despedido por inútil' },
    { tipo: 'tragedia', texto: '🤣 La mamá de @user le dijo que es un fracaso' }
  ]
  
  let accion = acciones[Math.floor(Math.random() * acciones.length)]
  let texto = accion.texto.replace('@user', `@${sender.split('@')[0]}`)
  
  let mensaje = `🎲 *LOCURA DEL DÍA*\n\n`
  mensaje += `${texto}\n\n`
  
  if (accion.tipo === 'humillacion') {
    mensaje += `💀 *Ella ya lo sabía... todos se burlan de ti*`
  } else if (accion.tipo === 'castigo') {
    mensaje += `🖕 *Cumple o ella nunca te volverá a hablar*`
  } else if (accion.tipo === 'desafio') {
    mensaje += `🔥 *Si no lo haces, eres más cobarde de lo que ella pensaba*`
  } else {
    mensaje += `😭 *Tu vida es una tragedia cómica*`
  }
  
  await conn.reply(m.chat, mensaje, m, {
    mentions: [sender]
  })
}

handler.help = ['locura']
handler.tags = ['fun']
handler.command = ['locura', 'desgracia', 'humillacion']
handler.group = true
handler.register = true

export default handler