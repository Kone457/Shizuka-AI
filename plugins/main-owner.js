
export default {
  command: ['creator', 'owner', 'creador'],
  category: 'info',

  run: async (client, m) => {

    const ownerNumber = '5355699866'
    const botname = 'รђเzยкค-คเ - ๓คgเςคl'

    const text = `
╭━〔 ˚୨•(=^●ω●^=)• ⊹ 𝑪𝑹𝑬𝑨𝑫𝑶𝑹 ⊹〕━╮

» ˚୨•(=^●ω●^=)• ⊹ Información ⊹

➤ Creador: @Oculto por privacidad
➤ Bot: ${botname}
➤ Contacto disponible abajo

──────────────

✧ Gracias por usar el bot ✧

╰━━━━━━━━━━━━━━━━━━━━╯
`.trim()

    const vcard = `
BEGIN:VCARD
VERSION:3.0
FN:Creador
TEL;type=CELL;type=VOICE;waid=${ownerNumber}:${ownerNumber}
END:VCARD
`.trim()

    await client.sendMessage(
      m.chat,
      { text },
      { quoted: m }
    )

  
    await client.sendMessage(
      m.chat,
      {
        contacts: {
          displayName: 'Creador',
          contacts: [{ vcard }]
        }
      },
      { quoted: m }
    )

  }
}