import fetch from 'node-fetch';

let handler = async (m, { conn, text }) => {
  try {
    const sender = m.sender;
    const senderName = await conn.getName(sender) || 'Usuario';

    // 1. Obtener imagen con timeout o fallback
    const res = await fetch('https://api.waifu.pics/sfw/waifu');
    if (!res.ok) throw new Error('Error al obtener imagen');
    const json = await res.json();
    const imageUrl = json.url;

    // 2. Preparar el media por separado (Evita errores de timeout en el objeto)
    const media = await conn.prepareWAMessageMedia(
      { image: { url: imageUrl } },
      { upload: conn.waUploadToServer }
    );

    // 3. Construcción del mensaje interactivo (Estructura de Carlos para YouTube API style)
    const messageInstance = {
      interactiveMessage: {
        body: { text: `💗 ¡Hola *${senderName}*! Aquí tienes el panel de botones actualizado.` },
        footer: { text: 'Bot Systems - Dev by Carlos' },
        header: {
          title: '✨ Menú Interactivo',
          hasMediaAttachment: true,
          ...media // Inserta el imageMessage ya preparado
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
                display_text: '🌐 Abrir Enlace',
                url: 'https://www.google.com',
                merchant_url: 'https://www.google.com'
              })
            },
            {
              name: 'single_select',
              buttonParamsJson: JSON.stringify({
                title: '📂 Ver Opciones',
                sections: [
                  {
                    title: 'Selección Técnica',
                    rows: [
                      { header: 'Endpoint YT', title: 'Creator: Carlos', description: 'Acceso a API YouTube', id: 'yt_api' },
                      { header: 'Servidor', title: 'Estado: Online', description: 'Latencia: 45ms', id: 'server_status' }
                    ]
                  }
                ]
              })
            }
          ]
        }
      }
    };

    // 4. Envío mediante relayMessage con viewOnceMessage
    await conn.relayMessage(m.chat, {
      viewOnceMessage: {
        message: messageInstance
      }
    }, { quoted: m });

  } catch (error) {
    console.error('Error detallado:', error);
    // Muestra el error exacto en consola para debuggear si vuelve a fallar
    m.reply(`> *Error detectado:* ${error.message}`);
  }
};

handler.command = ['test', 'pruebabotones'];
export default handler;
