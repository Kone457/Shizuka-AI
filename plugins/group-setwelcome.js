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

من فضلك اكتب الرسالة اللي عايز تحطها.

📌 **المتغيرات المتاحة:**
• @user (منشن المستخدم)
• @group (اسم الجروب)
• @desc (وصف الجروب)
• @action (سبب الدخول)
• %users (إجمالي الأعضاء)

💡 **مثال للاستخدام:**
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

من فضلك اكتب الرسالة المخصصة اللي عايز تحطها.

📌 **المتغيرات المتاحة:**
• @user (منشن المستخدم)
• @group (اسم الجروب)
• @action (سبب الخروج/الطرد)
• %users (إجمالي الأعضاء حالياً)

💡 **مثال للاستخدام:**
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
