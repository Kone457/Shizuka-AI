import speedTest from 'speedtest-net';

const handler = async (m) => {
    m.react("🚀")
    try {
        const test = await speedTest({ acceptLicense: true, acceptGdpr: true });
        let response = `*ＩＮＦＯ - ＳＰＥＥＤＴＥＳＴ*

*» Descarga:* ${(test.download.bandwidth / 125000).toFixed(2)} Mbps
*» Carga:* ${(test.upload.bandwidth / 125000).toFixed(2)} Mbps
*» Ping:* ${test.ping.latency} ms
*» ISP:* ${test.isp}
*» Servidor:* ${test.server.name} (${test.server.location})`;

        await m.reply(response);
    } catch (e) {
        console.error(e);
        return m.reply('*[❗] Error al realizar el speedtest:* ' + e.message);
    }
};
handler.help = ['speedtest'];
handler.tags = ['main'];
handler.command = /^(speedtest?|test?speed)$/i;
export default handler;