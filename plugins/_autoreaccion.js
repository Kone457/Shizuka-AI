let handler = (m) => m;

handler.before = async function (m, { conn, isAdmin, isBotAdmin, isOwner }) {
  if (m.isGroup && !isBotAdmin) return;

  
  const chat = global.db.data.chats[m.chat];
  if (!chat.reaction) return; 

  if (!m.text) return;

  const emojiResponses = {
    "مرحبا": "👋",
    "السلام عليكم": "🕌",
    "شكرا": "🙏",
    "وداعا": "👋",
    "هههه": "😂",
    "حزين": "😢",
    "رائع": "😎",
    "حب": "❤️",
    "تمام": "👌",
    "واو": "😮",
    "مساعدة": "❓",
    "كويس": "😊",
    "وحش": "😞",
    "مبروك": "😁",
    "نعم": "✅",
    "لا": "❌",
    "اكل": "🍕",
    "حفلة": "🎉",
    "موسيقى": "🎵",
    "فلوس": "💵",
    "شغل": "💼",
    "بيت": "🏠",
    "شمس": "☀️",
    "مطر": "🌧️",
    "ليل": "🌙",
    "نجمة": "⭐",
    "نار": "🔥",
    "مياه": "💧",
    "قلب": "💖",
    "بوسة": "💋",
    "حضن": "🤗",
    "وقت": "⏰",
    "قهوة": "☕",
    "فكرة": "💡",
    "هدية": "🎁",
    "عربية": "🚗",
    "سفر": "✈️",
    "تليفون": "📱",
    "كمبيوتر": "💻",
    "خطأ": "❗",
    "روبوت": "🤖",
    "شهب": "🌠",
    "زهرة": "🌸",
    "شجرة": "🌳",
    "جبل": "⛰️",
    "بحر": "🌊",
  };

  const lowerMessage = m.text.toLowerCase();
  let emojiToReact = null;

  for (const [key, emoji] of Object.entries(emojiResponses)) {
    if (lowerMessage.includes(key)) {
      emojiToReact = emoji;
      break;
    }
  }

  if (!emojiToReact) {
    const allEmojis = [
      "😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇", "🙂", "🙃", "😉", "😌",
      "😍", "🥰", "😘", "😗", "😙", "😚", "😋", "😛", "😜", "🤪", "😝", "🤑", "🤗", "🤭",
      "🤫", "🤔", "🤐", "🤨", "😐", "😑", "😶", "😏", "😒", "🙄", "😬", "🤥", "😌", "😔",
    ];
    emojiToReact = allEmojis[Math.floor(Math.random() * allEmojis.length)];
  }

  try {
    await m.react(emojiToReact);
    console.log("✰ تم التفاعل بـ:", emojiToReact);
  } catch (err) {
    console.error("❏ خطأ في التفاعل:", err);
  }

  return true;
};

export default handler;
