import moment from 'moment-timezone';

let handler = async (m, { conn }) => {
  try {
    const now = moment().tz("America/Havana").format("HH:mm:ss");

    await conn.sendMessage(m.chat, {
      interactiveMessage: {
        body: { text: `🕒 Hora actual: ${now}` },
        nativeFlowMessage: {
          buttons: [
            {
              name: 'single_select',
              buttonParamsJson: JSON.stringify({
                title: 'Opciones del reloj',
                sections: [
                  {
                    title: 'Acciones',
                    rows: [
                      { title: 'Actualizar ⏱️', id: 'refresh' },
                      { title: 'Ver fecha 📅', id: 'date' }
                    ]
                  }
                ]
              })
            }
          ]
        }
      }
    }, { quoted: m });

  } catch (error) {
    console.error(error);
    m.reply('❏ *Error*');
  }
};

handler.help = ['1'];
handler.tags = ['test'];
handler.command = ['1'];

export default handler;