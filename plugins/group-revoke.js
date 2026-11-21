let handler = async (m, { conn }) => {
  try {
    const grupoID = m.chat
    
    await conn.groupRevokeInvite(grupoID)

    const nuevoEnlace = await conn.groupInviteCode(grupoID)
    const enlaceCompleto = 'https://chat.whatsapp.com/' + nuevoEnlace

    await conn.reply(m.sender, 
`✿ *العملية تمت بنجاح يا فندم.*

❖ *لينك الدعوة القديم اتلغى.*
✰ *لينك دخول جديد اتولد:*\n${enlaceCompleto}

✦ *Sistema listo para nuevas instrucciones.*`, 
      m)
  } catch (error) {
    console.error(error)
    await m.reply(`️❏ *خطأ في عملية تجديد اللينك.*

❏ تفاصيل تقنية: ${error.message}
⌦ اتأكد إن tenga privilegios administrativos para completar esta orden.`)
  }
}

handler.help = ['revoke']
handler.tags = ['group']
handler.command = ['revoke', 'restablecer']
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler