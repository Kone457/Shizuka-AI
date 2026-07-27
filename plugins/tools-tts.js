import axios from 'axios';

let handler = async (m, { conn, args }) => {
  const prompt = args.join(' ').trim();
  if (!prompt) return m.reply('《✧》 Ingresa un *texto* para convertirlo a voz.');

  try {
    const ngeloot = {
      raw_text: prompt,
      url: "https://filme.imyfone.com/text-to-speech/anime-text-to-speech/",
      product_id: "200054",
      convert_data: [{
        voice_id: "67ada61f-5d4b-11ee-a861-00163e2ac61b",
        speed: "1",
        volume: "50",
        text: prompt,
        pos: 0
      }]
    };

    const rekuesanu = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': '*/*',
        'User-Agent': 'Mozilla/5.0'
      },
    };

    const useanu = await axios.post(
      'https://voxbox-tts-api.imyfone.com/pc/v1/voice/tts',
      JSON.stringify(ngeloot),
      rekuesanu
    );

    const { oss_url } = useanu.data.data.convert_result[0];
    const audioBuffer = (await axios.get(oss_url, { responseType: 'arraybuffer' })).data;

    await conn.sendMessage(
      m.chat,
      { audio: audioBuffer, mimetype: 'audio/mp3', ptt: true },
      { quoted: m }
    );

  } catch (error) {
    console.error(error);
    await m.reply('❏ Ocurrió un error al procesar tu solicitud.');
  }
};

handler.help = ['tts'];
handler.tags = ['tools'];
handler.command = ['tts'];

export default handler;