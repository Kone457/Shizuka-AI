export default {
  command: ['gid', 'groupid', 'idgrupo'],
  category: 'info',

  run: async (client, m) => {

    
    if (!m.isGroup) {
      return m.reply('🕷️ Este comando solo funciona en grupos.')
    }

    const groupId = m.chat

    let text = `
🕸️ 𝑰𝑫 𝑫𝑬𝑳 𝑮𝑹𝑼𝑷𝑶 🕸️

🕷️ ID:
${groupId}
`.trim()

    await client.sendMessage(
      m.chat,
      { text },
      { quoted: m }
    )
  }
}