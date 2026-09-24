let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!m.isGroup) {
    return m.reply('❌ Este comando solo se puede utilizar dentro de un grupo.');
  }

  const chat = globalThis.db.data.chats[m.chat] ||= {};

  if (command === 'setwelcome') {
    if (!text) {
      return m.reply(`
╔═══❖•°•°•°❖•°•°•°❖═══╗
🌟  **CONFIGURAR BIENVENIDA**  🌟
╚═══❖•°•°•°❖•°•°•°❖═══╝

Por favor, escribe el mensaje que deseas establecer.

📌 **Variables disponibles:**
• @user (Mencionar al usuario)
• @group (Nombre del grupo)
• @desc (Descripción del grupo)
• @action (Acción de entrada)
• %users (Total de miembros)

💡 **Ejemplo de uso:**
${usedPrefix + command} 🌟 ¡Hola @user! Bienvenido a @group. Lee las reglas.
      `.trim());
    }

    chat.sWelcome = text;
    return m.reply('✅ ¡El mensaje de bienvenida se ha actualizado!');
  }

  if (command === 'setbye') {
    if (!text) {
      return m.reply(`
╔═══❖•°•°•°❖•°•°•°❖═══╗
💔  **CONFIGURAR DESPEDIDA**  💔
╚═══❖•°•°•°❖•°•°•°❖═══╝

Por favor, escribe el mensaje personalizado que deseas establecer.

📌 **Variables disponibles:**
• @user (Mencionar al usuario)
• @group (Nombre del grupo)
• @action (Acción de salida/eliminación)
• %users (Total de miembros actual)

💡 **Ejemplo de uso:**
${usedPrefix + command} 💔 Adiós @user, esperamos que vuelvas pronto a @group.
      `.trim());
    }

    chat.sBye = text;
    return m.reply('✅ ¡El mensaje de despedida se ha actualizado!');
  }
};

handler.command = ['setwelcome', 'setbye'];
handler.group = true;
handler.admin = true;

export default handler;
