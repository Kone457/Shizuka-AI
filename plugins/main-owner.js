
export default {
  command: ['creator', 'owner', 'creador'],
  category: 'info',

  run: async (client, m) => {

    const owner = '5355699866@s.whatsapp.net'
    const botname = 'รђเzยкค-คเ'
    const banner = ''

    const ownerNumber = owner.split('@')[0]

    const text = `
╭━〔 ˚୨•(=^●ω●^=)• ⊹ 𝑪𝑹𝑬𝑨𝑫𝑶𝑹 ⊹ 〕━╮

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
N:;Creador;;;
FN:Creador
TEL;type=CELL;type=VOICE;waid=${ownerNumber}:${ownerNumber}
END:VCARD
`.trim()

    await client.sendMessage(
      m.chat,
      {
        text: text,
        contacts: {
          displayName: 'Creador',
          contacts: [{ vcard }]
        }
      },
      { quoted: m }
    )
  }
}