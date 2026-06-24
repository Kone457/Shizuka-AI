let handler = async (m, { conn }) => {
  try {
    const grupoID = m.chat
    
    await conn.groupRevokeInvite(grupoID)

    const nuevoEnlace = await conn.groupInviteCode(grupoID)
    const enlaceCompleto = 'https://chat.whatsapp.com/' + nuevoEnlace

    await conn.reply(m.sender, 
`✿ *Operación ejecutada con éxito, señor.*

❖ *Enlace de invitación anterior revocado.*
✰ *Nuevo canal de acceso generado:*\n${enlaceCompleto}

✦ *Sistema listo para nuevas instrucciones.*`, 
      m)
  } catch (error) {
    console.error(error)
    await m.reply(`️❏ *Error en la operación de restablecimiento del enlace.*

❏ Detalles técnicos: ${error.message}
⌦ Asegúrate de que tenga privilegios administrativos para completar esta orden.`)
  }
}

handler.help = ['revoke']
handler.tags = ['group']
handler.command = ['revoke', 'restablecer']
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler