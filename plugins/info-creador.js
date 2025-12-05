let handler = async (m, { conn }) => {
  let mensaje = `
👥 *Equipo de รɧıʑนʞศ*

🌟 *Gracias por usar la bot* 🌟
  `.trim();

  await conn.sendMessage(m.chat, {
    image: { url: 'https://ik.imagekit.io/ybi6xmp5g/Dev.png' },
    caption: mensaje,
    footer: 'Pulsa un botón para abrir el enlace',
    buttons: [
      { buttonId: 'id1', buttonText: { displayText: '📲 Carlos' }, type: 1, url: 'https://wa.me/5355699866' },
      { buttonId: 'id2', buttonText: { displayText: '📲 David' }, type: 1, url: 'https://wa.me/595975677765' }
    ],
    headerType: 4
  }, { quoted: m });
}

handler.help = ['creador']
handler.tags = ['info']
handler.command = ['team', 'creador', 'owner']

export default handler