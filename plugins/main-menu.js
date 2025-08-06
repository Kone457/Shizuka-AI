const handler = async (m, { conn, usedPrefix }) => {
  // Reacción del bot al recibir el comando
  await conn.sendMessage(m.chat, { react: { text: '🧨', key: m.key } });

  const plugins = Object.values(global.plugins || {}).filter(p => !p?.disabled);

  // --- Variables para la apariencia de canal (puedes personalizarlas) ---
  const botname = 'Shizuka-AI';
  const textbot = 'Asistente virtual de WhatsApp';
  const banner = 'https://qu.ax/diNXY.jpg';
  const redes = 'https://chat.whatsapp.com/G5v3lHn3w0x04kP2b39q31';

  // --- Mapeo de categorías con decoraciones mejoradas ---
  const categoryMap = {
    main:          '🌟 𝗖𝗼𝗺𝗮𝗻𝗱𝗼𝘀 𝗣𝗿𝗶𝗻𝗰𝗶𝗽𝗮𝗹𝗲𝘀',
    rg:            '📝 𝗥𝗲𝗴𝗶𝘀𝘁𝗿𝗼',
    serbot:        '🤖 𝗦𝘂𝗯-𝗕𝗼𝘁',
    info:          '📋 𝗜𝗻𝗳𝗼𝗿𝗺𝗮𝗰𝗶𝗼́𝗻 𝗱𝗲𝗹 𝗕𝗼𝘁',
    descargas:     '🚀 𝗗𝗲𝘀𝗰𝗮𝗿𝗴𝗮𝘀',
    buscadores:    '🔍 𝗕𝘂𝘀𝗰𝗮𝗱𝗼𝗿𝗲𝘀',
    ia:            '🧠 𝗜𝗻𝘁𝗲𝗹𝗶𝗴𝗲𝗻𝗰𝗶𝗮 𝗔𝗜',
    imagen:        '🖼️ 𝗚𝗲𝗻𝗲𝗿𝗮𝗱𝗼𝗿 𝗱𝗲 𝗜𝗺𝗮́𝗴𝗲𝗻𝗲𝘀',
    transformador: '🔄 𝗖𝗼𝗻𝘃𝗲𝗿𝘀𝗼𝗿𝗲𝘀',
    fun:           '🎉 𝗗𝗶𝘃𝗲𝗿𝘀𝗶𝗼́𝗻 𝘆 𝗝𝘂𝗲𝗴𝗼𝘀',
    game:          '🎮 𝗝𝘂𝗲𝗴𝗼𝘀',
    anime:         '🎌 𝗔𝗻𝗶𝗺𝗲',
    gacha:         '🎰 𝗚𝗮𝗰𝗵𝗮',
    grupo:         '👥 𝗖𝗼𝗺𝗮𝗻𝗱𝗼𝘀 𝗱𝗲 𝗚𝗿𝘂𝗽𝗼',
    group:         '👥 𝗖𝗼𝗺𝗮𝗻𝗱𝗼𝘀 𝗱𝗲 𝗚𝗿𝘂𝗽𝗼',
    text:          '✒️ 𝗘𝗳𝗲𝗰𝘁𝗼𝘀 𝗱𝗲 𝗧𝗲𝘅𝘁𝗼',
    rpg:           '🪄 𝗥𝗣𝗚 𝘆 𝗘𝗰𝗼𝗻𝗼𝗺𝗶́𝗮',
    sticker:       '🧧 𝗦𝘁𝗶𝗰𝗸𝗲𝗿𝘀',
    tools:         '🔧 𝗛𝗲𝗿𝗿𝗮𝗺𝗶𝗲𝗻𝘁𝗮𝘀 𝗨́𝘁𝗶𝗹𝗲𝘀',
    nsfw:          '🔞 𝗖𝗼𝗻𝘁𝗲𝗻𝗶𝗱𝗼 +18',
    owner:         '👑 𝗖𝗼𝗺𝗮𝗻𝗱𝗼𝘀 𝗱𝗲 𝗣𝗿𝗼𝗽𝗶𝗲𝘁𝗮𝗿𝗶𝗼',
  };

  // --- Lógica para obtener datos dinámicos ---
  const date = new Date();
  const options = {
    year: 'numeric', month: 'long', day: 'numeric',
    timeZone: 'America/Mexico_City',
  };
  const fecha = date.toLocaleDateString('es-ES', options);
  const hora = date.toLocaleTimeString('es-ES', { timeZone: 'America/Mexico_City' });
  
  const hour = date.getHours();
  let saludo;
  if (hour >= 5 && hour < 12) {
    saludo = 'Buenos días';
  } else if (hour >= 12 && hour < 19) {
    saludo = 'Buenas tardes';
  } else {
    saludo = 'Buenas noches';
  }
  
  const _uptime = process.uptime() * 1000;
  const uptime = clockString(_uptime);
  const totalreg = Object.keys(global.db.data.users).length;
  let totalCommands = 0;
  
  // --- Agrupa comandos por categoría (manteniendo la lógica original) ---
  const categoryCommands = {};
  for (let plugin of plugins) {
    const tags = Array.isArray(plugin.tags) ? plugin.tags : (plugin.tags ? [plugin.tags] : []);
    const helps = Array.isArray(plugin.help) ? plugin.help : (plugin.help ? [plugin.help] : []);
    
    if (helps.length > 0) totalCommands += helps.length;
    
    for (let tag of tags) {
      if (!categoryMap[tag]) continue;
      if (!categoryCommands[tag]) categoryCommands[tag] = new Set();
      helps.forEach(h => {
        if (typeof h === 'string') categoryCommands[tag].add(h.trim());
      });
    }
  }

  // --- Construye el menú con la nueva decoración ---
  let menu = `
╭━━━❪ ✨ 𝑺𝒉𝒊𝒛𝒖𝒌𝒂-𝑨𝑰 ✨ ❫━━━╮
│
│ 🤖 *Versión:* v1.0.0
│ 👤 *Creador:* Carlos
│ 👋 ${saludo}, @${m.sender.split('@')[0]}
│ 🗓️ *Fecha:* ${fecha}
│ ⏰ *Hora:* ${hora}
╰━━━━━━━━━━━━━━━━━━━━━╯
╭━━━❪ 📊 𝗘𝘀𝘁𝗮𝗱𝗶́𝘀𝘁𝗶𝗰𝗮𝘀 ❫━━━━╮
│
│ 🕒 *Actividad:* ${uptime}
│ 👥 *Usuarios:* ${totalreg}
│ 📚 *Comandos:* ${totalCommands}
╰━━━━━━━━━━━━━━━━━━━━╯
`
  for (let [tag, label] of Object.entries(categoryMap)) {
    const cmds = categoryCommands[tag];
    if (!cmds || cmds.size === 0) continue;
    menu += `╭─┈➤ 『 ${label} 』
│
`;
    for (let cmd of [...cmds].sort()) {
      menu += `│ ◦ ${usedPrefix}${cmd}\n`;
    }
    menu += `╰───────────────\n\n`;
  }
  menu += '> _Creado por Carlos_';

  // --- Envía el mensaje solo con la imagen completa y el texto del menú ---
  await conn.sendMessage(m.chat, {
    image: { url: banner },
    caption: menu,
  }, { quoted: m });
};

handler.command = /^(menu|help|comandos)$/i;
export default handler;

function clockString(ms) {
  let d = Math.floor(ms / (1000 * 60 * 60 * 24))
  let h = Math.floor((ms / (1000 * 60 * 60)) % 24)
  let m = Math.floor((ms / (1000 * 60)) % 60)
  let s = Math.floor((ms / 1000) % 60)
  let dDisplay = d > 0 ? d + (d === 1 ? " día, " : " días, ") : ""
  let hDisplay = h > 0 ? h + (h === 1 ? " hora, " : " horas, ") : ""
  let mDisplay = m > 0 ? m + (m === 1 ? " minuto, " : " minutos, ") : ""
  let sDisplay = s > 0 ? s + (s === 1 ? " segundo" : " segundos") : ""
  return dDisplay + hDisplay + mDisplay + sDisplay
}
