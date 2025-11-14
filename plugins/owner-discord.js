import fetch from 'node-fetch'

const DISCORD_WEBHOOK = 'https://discord.com/api/webhooks/1436892691433521183/C_wUqs-yclWsiUS6gxvZuedIAxEnRI5UUKSUh-uYhAbrfDg_HhfXawcSjz1gmSuaovWc'

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