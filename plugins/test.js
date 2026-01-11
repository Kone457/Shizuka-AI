import fetch from 'node-fetch';

let handler = async (m, { conn, text }) => {
  try {
    const sender = m.sender;
    const senderName = await conn.getName(sender);

    const res = await fetch('https://api.waifu.pics/sfw/waifu');
    const json = await res.json();
    const imageUrl = json.url;

    const caption = `💗 Aquí tienes ${senderName}...\n> Este es un plugin de prueba con todos los tipos de botones soportados por Baileys. ✨`;

    const buttons = [
      { buttonId: 'id1', buttonText: { displayText: 'Botón 1' }, type: 1 },
      { buttonId: 'id2', buttonText: { displayText: 'Botón 2' }, type: 1 }
    ];

    const sections = [
      {
        title: 'Sección de Prueba',
        rows: [
          { title: 'Opción 1', rowId: 'row1', description: 'Descripción de la opción 1' },
          { title: 'Opción 2', rowId: 'row2', description: 'Descripción de la opción 2' }
        ]
      }
    ];


    const nativeFlowButtons = [
      {
        name: 'quick_reply',
        buttonParamsJson: JSON.stringify({
          display_text: 'Respuesta Rápida 1',
          id: 'quick1'
        })
      },
      {
        name: 'cta_url',
        buttonParamsJson: JSON.stringify({
          display_text: 'Visitar Google',
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
          title: 'Seleccionar una opción',
          sections: [
            {
              title: 'Opciones',
              rows: [
                { header: 'H1', title: 'Título 1', description: 'Desc 1', id: 'id1' },
                { header: 'H2', title: 'Título 2', description: 'Desc 2', id: 'id2' }
              ]
            }
          ]
        })
      }
    ];


    await conn.sendMessage(
      m.chat,
      {
        image: { url: imageUrl },
        caption,
        footer: 'Baileys Button Test',
        buttons: buttons, 
        viewOnce: true,
        headerType: 4,
        nativeFlowMessage: {
          buttons: nativeFlowButtons
        },
        mentions: [sender]
      },
      { quoted: m }
    );


    await conn.sendMessage(
      m.chat,
      {
        text: 'Haz clic para ver la lista de opciones:',
        footer: 'Prueba de List Message',
        buttonText: 'Ver Lista',
        sections: sections
      },
      { quoted: m }
    );

  } catch (error) {
    console.error(error);
    m.reply('> *Error al ejecutar el plugin de prueba.*');
  }
};

handler.help = ['test'];
handler.tags = ['test'];
handler.command = ['test', 'pruebabotones'];

export default handler;
