import { Llama } from "@spoky/nex";

const handler = async (m, { conn, text }) => {
  if (!text) {
    await conn.sendMessage(m.chat, { react: { text: '⚠️', key: m.key } });
    return m.reply('Ingresa una pregunta para *LLama*.');
  }

  try {
    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

    const ai = await Llama(text).catch(err => err);

    if (!ai || ai.error) {
      await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
      return m.reply(`Error en scraper:\n${JSON.stringify(ai, null, 2)}`);
    }

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
    await conn.sendMessage(m.chat, { text: ai.result || ai.text || String(ai) }, { quoted: m });

  } catch (e) {
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
    m.reply(`Error inesperado:\n${e?.stack || e}`);
  }
};

handler.command = ['llama'];
handler.tags = ['ai'];
handler.help = ['llama'];
handler.group = true;

export default handler;