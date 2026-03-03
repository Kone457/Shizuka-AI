export default {
  command: ['ping', 'p'],
  category: 'info',
  run: async (client, m) => {
    const start = performance.now();
    
    await client.sendMessage(m.chat, { 
      text: `🏓 *Pong!*\n> Tiempo ⏱️ ${(performance.now() - start).toFixed(2)}ms` 
    }, { quoted: m });
  },
};
