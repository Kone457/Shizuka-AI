let handler = async (m, { conn }) => {
  let mensaje = `
👥 *Equipo de รɧıʑนʞศ*

🌟 *Gracias por usar la bot* 🌟
  `.trim();

  await conn.sendMessage(m.chat, {
    image: { url: 'https://ik.imagekit.io/ybi6xmp5g/Dev.png' },
    caption: mensaje,
    footer: 'Pulsa un botón para obtener el enlace',
    buttons: [
      { buttonId: 'carlos', buttonText: { displayText: '📲 Carlos' }, type: 1 },
      { buttonId: 'david', buttonText: { displayText: '📲 David' }, type: 1 }
    ],
    headerType: 4
  }, { quoted: m });
}

handler.before = async (m, { conn }) => {
  if (m.message?.buttonsResponseMessage?.selectedButtonId === 'carlos') {
    await conn.sendMessage(m.chat, { text: '👉 https://wa.me/5355699866' }, { quoted: m })
  }
  if (m.message?.buttonsResponseMessage?.selectedButtonId === 'david') {
    await conn.sendMessage(m.chat, { text: '👉 https://wa.me/595975677765' }, { quoted: m })
  }
}

handler.help = ['creador']
handler.tags = ['info']
handler.command = ['team', 'creador', 'owner']

export default handler