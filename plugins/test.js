import fetch from 'node-fetch';
// Importamos la función directamente de la librería
import pkg from '@whiskeysockets/baileys';
const { prepareWAMessageMedia } = pkg;

let handler = async (m, { conn, text }) => {
  try {
    const sender = m.sender;
    const senderName = await conn.getName(sender) || 'Usuario';

    const res = await fetch('https://api.waifu.pics/sfw/waifu');
    if (!res.ok) throw new Error('Error al obtener imagen');
    const json = await res.json();
    const imageUrl = json.url;

    // AHORA: Usamos la función importada correctamente
    // Pasamos conn.waUploadToServer como el cargador oficial
    const media = await prepareWAMessageMedia(
      { image: { url: imageUrl } },
      { upload: conn.waUploadToServer }
    );

    const messageInstance = {
      interactiveMessage: {
        body: { text: `💗 ¡Hola *${senderName}*! Soy Carlos, aquí tienes el panel de botones.` },
        footer: { text: 'Baileys Multi-Button System' },
        header: {
          title: '✨ Menú Interactivo',
          hasMediaAttachment: true,
          imageMessage: media.imageMessage // Asignamos el nodo generado
        },
        nativeFlowMessage: {
          buttons: [
            {
              name: 'quick_reply',
              buttonParamsJson: JSON.stringify({
                display_text: '✅ Confirmar Test',
                id: 'test_ready'
              })
            },
            {
              name: 'cta_url',
              buttonParamsJson: JSON.stringify({
                display_text: '🌐 Canal de Carlos',
                url: 'https://www.google.com'
              })
            },
            {
              name: 'single_select',
              buttonParamsJson: JSON.stringify({
                title: '📂 Ver Opciones',
                sections: [
                  {
                    title: 'Secciones Disponibles',
                    rows: [
                      { header: 'API YT', title: 'Configuración', description: 'Ajustes del endpoint', id: 'yt_config' }
                    ]
                  }
                ]
              })
            }
          ]
        }
      }
    };

    await conn.relayMessage(m.chat, {
      viewOnceMessage: {
        message: messageInstance
      }
    }, { quoted: m });

  } catch (error) {
    console.error('Error en el plugin:', error);
    m.reply(`> *Error detectado:* ${error.message}`);
  }
};

handler.command = ['test', 'pruebabotones'];
export default handler;
