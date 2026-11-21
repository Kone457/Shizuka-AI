let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!m.isGroup) {
    return m.reply('❌ الأمر ده للجروبات بس.');
  }

  const chat = globalThis.db.data.chats[m.chat] ||= {};

  if (command === 'setwelcome') {
    if (!text) {
      return m.reply(`
╔═══❖•°•°•°❖•°•°•°❖═══╗
🌟  **إعداد رسالة الترحيب**  🌟
╚═══❖•°•°•°❖•°•°•°❖═══╝

من فضلك اكتب الرسالة que deseas establecer.

📌 **Variables disponibles:**
• @user (Mencionar al usuario)
• @group (Nombre del grupo)
• @desc (Descripción del grupo)
• @action (Acción de entrada)
• %users (Total de miembros)

💡 **Ejemplo de uso:**
🌟  **إعداد رسالة الترحيب**  🌟
      `.trim());
    }

    chat.sWelcome = text;
    return m.reply('✅ رسالة الترحيب اتحدثت!');
  }

  if (command === 'setbye') {
    if (!text) {
      return m.reply(`
╔═══❖•°•°•°❖•°•°•°❖═══╗
💔  **إعداد رسالة الوداع**  💔
╚═══❖•°•°•°❖•°•°•°❖═══╝

من فضلك اكتب الرسالة personalizado que deseas establecer.

📌 **Variables disponibles:**
• @user (Mencionar al usuario)
• @group (Nombre del grupo)
• @action (Acción de salida/eliminación)
• %users (Total de miembros actual)

💡 **Ejemplo de uso:**
💔  **إعداد رسالة الوداع**  💔
      `.trim());
    }

    chat.sBye = text;
    return m.reply('✅ رسالة الوداع اتحدثت!');
  }
};

handler.command = ['setwelcome', 'setbye'];
handler.group = true;
handler.admin = true;

export default handler;
