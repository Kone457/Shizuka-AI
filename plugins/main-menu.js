export default {
  command: ['menu', 'help'],
  category: 'info',

  run: async (client, m) => {

    const rows = []

    for (const [cmd, data] of global.comandos.entries()) {
      rows.push({
        title: cmd,
        description: data.category || 'general',
        id: cmd
      })
    }

    const sections = [
      {
        title: 'Comandos disponibles',
        rows
      }
    ]

    await client.sendMessage(
      m.chat,
      {
        listMessage: {
          title: '📜 MENÚ PRINCIPAL',
          description: 'Selecciona un comando:',
          footerText: 'Bot • Carlos',
          buttonText: 'Abrir menú',
          sections
        }
      },
      { quoted: m }
    )
  }
}