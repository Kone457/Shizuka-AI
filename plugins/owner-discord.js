import fetch from 'node-fetch'

const DISCORD_WEBHOOK = 'https://discord.com/api/webhooks/1452139458706145288/2K6mPF2V-o2d_Yz_XhBjxrO7FPv_mHhBiycsqI4zMSQHz7n_Kh_pfz8K2c5aqrcxZRxC'

var handler = async (m, { text }) => {
  if (!text) return m.reply('> Escribe el mensaje que quieres enviar a Discord.')

  try {
    await fetch(DISCORD_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: text })
    })

    await m.reply('> Mensaje enviado  ✅')
  } catch (error) {
    console.error(error)
    await m.reply('> Ocurrió un error al enviar el mensaje a Discord ❌')
  }
}

handler.help = ['send <texto>']
handler.tags = ['owner']
handler.command = ['send']
handler.owner = true

export default handler