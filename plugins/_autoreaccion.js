let handler = (m) => m;

handler.before = async function (m, { conn, isAdmin, isBotAdmin, isOwner }) {
  if (m.isGroup && !isBotAdmin) return;

  
  const chat = global.db.data.chats[m.chat];
  if (!chat.reaction) return; 

  if (!m.text) return;

  const emojiResponses = {
    "hola": "👋",
    "gracias": "🙏",
    "adiós": "👋",
    "jaja": "😂",
    "triste": "😢",
    "genial": "😎",
    "amor": "❤️",
    "ok": "👌",
    "wow": "😮",
    "ayuda": "❓",
    "bien": "😊",
    "mal": "😞",
    "feliz": "😁",
    "sí": "✅",
    "no": "❌",
    "comida": "🍕",
    "fiesta": "🎉",
    "musica": "🎵",
    "dinero": "💵",
    "trabajo": "💼",
    "casa": "🏠",
    "sol": "☀️",
    "lluvia": "🌧️",
    "noche": "🌙",
    "estrella": "⭐",
    "fuego": "🔥",
    "agua": "💧",
    "corazón": "💖",
    "beso": "💋",
    "abrazo": "🤗",
    "tiempo": "⏰",
    "café": "☕",
    "idea": "💡",
    "regalo": "🎁",
    "carro": "🚗",
    "viaje": "✈️",
    "teléfono": "📱",
    "computadora": "💻",
    "error": "❗",
    "robot": "🤖",
    "estrella fugaz": "🌠",
    "flor": "🌸",
    "árbol": "🌳",
    "montaña": "⛰️",
    "mar": "🌊",
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
    console.log("Reaccionado con:", emojiToReact);
  } catch (err) {
    console.error("Error al reaccionar:", err);
  }

  return true;
};

export default handler;
