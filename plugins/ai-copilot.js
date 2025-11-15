import fetch from 'node-fetch';

let handler = async (m, { conn }) => {
  try {
    const sender = m.sender;
    const senderName = await conn.getName(sender);

    const endpoint = 'https://api.nekolabs.web.id/ai/copilot';
    const res = await fetch(endpoint);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();

    const text = json?.result?.text || '✨ El copilot no respondió.';
    const caption = `🤖 *Copilot*\n${text}\n\n✨ Para ${senderName}`;

    await conn.sendMessage(
      m.chat,
      {
        text: caption,
        mentions: [sender]
      },
      { quoted: m }
    );

  } catch (error) {
    console.error('❌ Error en nekolabs-copilot:', error);
    m.reply('> *Error al consultar a Copilot.* Intenta nuevamente más tarde.');
  }
};

handler.help = ['copilot'];
handler.tags = ['ai'];
handler.command = ['copilot'];

export default handler;