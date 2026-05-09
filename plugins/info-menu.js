import moment from 'moment-timezone'

const BANNER_URL = `${banner}`

const CATEGORY_META = {
  main: '⊹ Main ⊹',
  rg: '⊹ Registro ⊹',
  info: '⊹ Información ⊹',
  ia: '⊹ Inteligencia AI ⊹',
  buscadores: '⊹ Buscadores ⊹',
  descargas: '⊹ Descargas ⊹',
  imagen: '⊹ Imágenes ⊹',
  fun: '⊹ Diversión ⊹',
  game: '⊹ Juegos ⊹',
  anime: '⊹ Anime ⊹',
  grupo: '⊹ Admins ⊹',
  gacha: '⊹ Gacha ⊹',
  text: '⊹ Efectos ⊹',
  rpg: '⊹ Economía ⊹',
  sticker: '⊹ Stickers ⊹',
  tools: '⊹ Útilidades ⊹',
  nsfw: '⊹ NSFW ⊹',
  serbot: '⊹ Sub-bots ⊹',
  owner: '⊹ Dueño ⊹'
}

let handler = async (m, { conn }) => {
  try {

    await conn.sendMessage(m.chat, {
      react: { text: '💔', key: m.key }
    })

    const pluginsActivos = Object.values(global.plugins || {}).filter(p => !p?.disabled)
    const pluginsCount = pluginsActivos.length

    const jam = moment.tz('America/Havana').format('HH:mm:ss')
    const fecha = moment.tz('America/Havana').format('DD/MM/YYYY')
    const hora = moment.tz('America/Havana').format('hh:mm A')

    const byTag = {}

    for (const plugin of pluginsActivos) {
      const tags = Array.isArray(plugin.tags)
        ? plugin.tags
        : (plugin.tags ? [plugin.tags] : [])

      const helps = Array.isArray(plugin.help)
        ? plugin.help
        : (plugin.help ? [plugin.help] : [])

      for (const tag of tags) {
        if (!CATEGORY_META[tag]) continue

        if (!byTag[tag]) byTag[tag] = new Set()

        for (const h of helps) {
          if (typeof h === 'string' && h.trim()) {
            byTag[tag].add(h.trim())
          }
        }
      }
    }

    let menuTexto = ''

    menuTexto += `╭─ׅ─ׅ┈ ─๋︩︪─☪︎︎︎̸⃘̸࣭ٜ࣪࣪࣪۬◌⃘۪֟፝֯۫۫︎⃪𐇽۫۬❖⃘࣭ٜ࣪࣪࣪۬☪︎︎︎︎̸─ׅ─ׅ┈ ─๋︩︪─╮\n`
    menuTexto += `╭╼⬪࣪ꥈ𑁍⃪࣭۪ٜ 𝐌𝐄𝐍𝐔 ໑⃪࣭۪ٜ݊݊݊݊𑁍ꥈ࣪⬪\n`
    menuTexto += `┃֪࣪  ╰─ׅ─ׅ┈ ─๋︩︪─☪︎︎︎̸⃘̸࣭ٜ࣪࣪࣪۬◌⃘۪֟፝֯۫۫︎⃪𐇽۫۬❖⃘࣭ٜ࣪࣪࣪۬☪︎︎︎︎̸─ׅ─ׅ┈ ─๋︩︪─╯\n`

    menuTexto += `├ׁ̟̇❍✎ 𝐔𝐬𝐮𝐚𝐫𝐢𝐨 » ${m.pushName || 'Usuario'}\n`
    menuTexto += `├ׁ̟̇❍✎ 𝐅𝐞𝐜𝐡𝐚 » ${fecha}\n`
    menuTexto += `├ׁ̟̇❍✎ 𝐇𝐨𝐫𝐚 » ${hora}\n`
    menuTexto += `├ׁ̟̇❍✎ 𝐂𝐨𝐦𝐚𝐧𝐝𝐨𝐬 » ${pluginsCount}\n`

    menuTexto += `╰─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╯\n\n`

    for (const tag of Object.keys(CATEGORY_META)) {
      const set = byTag[tag]

      if (!set || set.size === 0) continue

      const cmds = [...set].sort()

      menuTexto += `╭─ׅ─ׅ┈ ─๋︩︪─☪︎︎︎̸⃘̸࣭ٜ࣪࣪࣪۬◌⃘۪֟፝֯۫۫︎⃪𐇽۫۬❖⃘࣭ٜ࣪࣪࣪۬☪︎︎︎︎̸─ׅ─ׅ┈ ─๋︩︪─╮\n`
      menuTexto += `╭╼⬪࣪ꥈ𑁍⃪࣭۪ٜ ${CATEGORY_META[tag]} ໑⃪࣭۪ٜ݊݊݊݊𑁍ꥈ࣪⬪\n`
      menuTexto += `┃֪࣪  ╰─ׅ─ׅ┈ ─๋︩︪─☪︎︎︎̸⃘̸࣭ٜ࣪࣪࣪۬◌⃘۪֟፝֯۫۫︎⃪𐇽۫۬❖⃘࣭ٜ࣪࣪࣪۬☪︎︎︎︎̸─ׅ─ׅ┈ ─๋︩︪─╯\n`

      menuTexto += cmds.map(c => `├ׁ̟̇❍✎ .${c}`).join('\n') + '\n'

      menuTexto += `╰─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╯\n\n`
    }

    await conn.sendMessage(m.chat, {
      image: { url: BANNER_URL },
      caption: menuTexto.trim()
    }, { quoted: m })

  } catch (e) {
    await conn.sendMessage(m.chat, {
      text: `✿ Error: ${e.message || e}`
    }, { quoted: m })
  }
}

handler.help = ['menu']
handler.tags = ['info']
handler.command = ['menu', 'help']

export default handler