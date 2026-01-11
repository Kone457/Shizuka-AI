import fetch from 'node-fetch';

let handler = async (m, { conn, text }) => {
  try {
    const sender = m.sender;
    const senderName = await conn.getName(sender);

    const res = await fetch('https://api.waifu.pics/sfw/waifu');
    const json = await res.json();
    const imageUrl = json.url;

    // 1. Mensaje con botones interactivos Native Flow (estándar actual de WhatsApp)
    // Estos son los que permiten URLs, Llamadas y Listas internas
    const interactiveMessage = {
      body: { text: `💗 ¡Hola ${senderName}! Aquí tienes el panel de pruebas completo.` },
      footer: { text: 'Baileys Multi-Button Test' },
      header: {
        title: 'Panel Interactivo',
        hasMediaAttachment: true,
        imageMessage: (await conn.prepareWAMessageMedia({ image: { url: imageUrl } }, { upload: conn.waUploadToServer })).imageMessage
      },
      nativeFlowMessage: {
        buttons: [
          {
            name: 'quick_reply',
            buttonParamsJson: JSON.stringify({
              display_text: 'Respuesta Rápida',
              id: 'quick_reply_id'
            })
          },
          {
            name: 'cta_url',
            buttonParamsJson: JSON.stringify({
              display_text: 'Abrir Enlace',
              url: 'https://www.google.com',
              merchant_url: 'https://www.google.com'
            })
          },
          {
            name: 'cta_call',
            buttonParamsJson: JSON.stringify({
              display_text: 'Llamar',
              phone_number: '123456789'
            })
          },
          {
            name: 'single_select',
            buttonParamsJson: JSON.stringify({
              title: 'Ver Menú',
              sections: [
                {
                  title: 'Opciones de Prueba',
                  rows: [
                    { header: 'Opción A', title: 'Título A', description: 'Descripción A', id: 'select_1' },
                    { header: 'Opción B', title: 'Título B', description: 'Descripción B', id: 'select_2' }
                  ]
                }
              ]
            })
          }
        ]
      }
    };

    // 2. Enviamos el mensaje interactivo usando relayMessage
    // Baileys requiere enviar estos nodos directamente para que WhatsApp los procese correctamente
    await conn.relayMessage(m.chat, {
      viewOnceMessage: {
        message: {
          interactiveMessage: interactiveMessage
        }
      }
    }, { quoted: m });

    // 3. Enviamos un List Message clásico (el botón que despliega un menú)
    const listMessage = {
      title: 'Menú de Lista Clásico',
      text: 'Este botón abre una lista de opciones separada:',
      footer: 'Prueba de Lista',
      buttonText: 'Seleccionar Opción',
      sections: [
        {
          title: 'Categorías',
          rows: [
            { title: 'Opción 1', rowId: 'row1', description: 'Esta es la opción 1' },
            { title: 'Opción 2', rowId: 'row2', description: 'Esta es la opción 2' }
          ]
        }
      ]
    };

    await conn.sendMessage(m.chat, listMessage, { quoted: m });

  } catch (error) {
    console.error('Error en el plugin de botones:', error);
    m.reply('> *Error al generar los botones interactivos.*');
  }
};

handler.help = ['testbuttons'];
handler.tags = ['test'];
handler.command = ['test', 'pruebabotones'];

export default handler;
