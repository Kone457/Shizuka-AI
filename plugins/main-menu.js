const handler = async (m, { conn, usedPrefix }) => {
  // Obtiene todos los plugins activos
  const plugins = Object.values(global.plugins || {}).filter(p => !p?.disabled)

  // Mapeo de categorías y sus emojis/etiquetas
  const categoryMap = {
    
    info:       '📋 𝐼𝑁𝐹𝑂𝑅𝑀𝐴𝐶𝐼𝑂𝑁',
    buscadores: '🔍 𝐵𝑈𝑆𝐶𝐴𝐷𝑂𝑅𝐸𝑆',
    descargas: '🚀 𝐷𝐸𝑆𝐶𝐴𝑅𝐺𝐴𝑆',
    group:      '👥 𝐺𝑅𝑈𝑃𝑂𝑆',
    rpg:        '🪄 𝑅𝑃𝐺',
    anime:      '🏵️  𝐴𝑁𝐼𝑀𝐸',
    fun:        '🎉 𝐷𝐼𝑉𝐸𝑅𝑆𝐼𝑂𝑁',
    text:       '✨ 𝐹𝐸𝐶𝑇𝑂𝑆 𝐷𝐸 𝑇𝐸𝑋𝑇𝑂',
    tools:      '🔧 𝐻𝐸𝑅𝑅𝐴𝑀𝐼𝐸𝑁𝑇𝐴𝑆',
    sticker:    '🧧 𝑆𝑇𝐼𝐶𝐾𝐸𝑅',
    owner:      '👑 𝑂𝑊𝑁𝐸𝑅'
  }

  // Agrupa comandos por categoría
  const categoryCommands = {}
  for (let plugin of plugins) {
    const tags = Array.isArray(plugin.tags) ? plugin.tags : (plugin.tags ? [plugin.tags] : [])
    const helps = Array.isArray(plugin.help) ? plugin.help : (plugin.help ? [plugin.help] : [])
    for (let tag of tags) {
      if (!categoryMap[tag]) continue
      if (!categoryCommands[tag]) categoryCommands[tag] = new Set()
      helps.forEach(h => {
        if (typeof h === 'string') categoryCommands[tag].add(h.trim())
      })
    }
  }

  // Construye el menú dinámico
  let menu = '╭─『 𝙎𝙝𝙞𝙯𝙪𝙠𝙖-𝘼𝙄 』\n│\n'
  for (let [tag, label] of Object.entries(categoryMap)) {
    const cmds = categoryCommands[tag]
    if (!cmds || cmds.size === 0) continue
    menu += `├ ${label}\n`
    for (let cmd of [...cmds].sort()) {
      menu += `│ ◦ ${usedPrefix}${cmd}\n`
    }
    menu += '│\n'
  }
  menu += '╰─────────────────\n\n _*Bot creado por Carlos*_'

  // Envía el mensaje con imagen y menú
  await conn.sendMessage(m.chat, {
    image: { url: 'https://qu.ax/diNXY.jpg' },
    caption: menu
  }, { quoted: m })
}

handler.command = /^(menu|help|comandos)$/i
export default handler