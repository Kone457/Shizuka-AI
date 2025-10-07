import fetch from 'node-fetch';

var handler = async (m, { conn, args, usedPrefix, command }) => {
    const emoji = '🎧';

    if (!args[0]) {
        return conn.reply(m.chat, `${emoji} Por favor, ingresa un enlace de SoundCloud.`, m);
    }

    try {
        await conn.reply(m.chat, `${emoji} Un momento, estoy procesando tu pista...`, m);

        const scData = await soundclouddl(args[0]);

        if (!scData || !scData.url) {
            return conn.reply(m.chat, "❌ No se pudo obtener el audio.", m);
        }

        await conn.sendFile(
            m.chat,
            scData.url,
            `${scData.title}.mp3`,
            `${emoji} Aquí tienes: *${scData.title}* por *${scData.username}* 🎶`,
            m
        );
    } catch (error) {
        return conn.reply(m.chat, `❌ Error: ${error.message}`, m);
    }
};

handler.help = ['soundcloud'].map((v) => v + ' *<link>*');
handler.tags = ['descargas'];
handler.command = ['soundcloud', 'scdl'];
handler.group = true;
handler.register = true;
handler.coin = 200;
handler.limit = true;

export default handler;

async function soundclouddl(trackUrl) {
    const headers = {
        'accept-encoding': 'gzip, deflate, br, zstd',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0'
    };

    const html = await (await fetch(trackUrl, { headers })).text();
    const jsonRaw = html.match(/<script>window.__sc_hydration = (.+?);<\/script>/)?.[1];
    if (!jsonRaw) throw Error("No se encontró el JSON de hidratación.");

    const json = JSON.parse(jsonRaw);
    const trackData = json?.[7]?.data;
    const ddjsKey = html.match(/window\.ddjskey = '(.+?)';/)?.[1];
    const stream_url = trackData?.media?.transcodings?.[3]?.url;
    const track_authorization = trackData?.track_authorization;

    if (!ddjsKey || !track_authorization || !stream_url) throw Error("Datos incompletos.");

    const clientJs = await (await fetch('https://a-v2.sndcdn.com/assets/0-b9979956.js', { headers })).text();
    const client_id = clientJs.match(/"client_id=(.+?)"\)/)?.[1];
    if (!client_id) throw Error("Client ID no encontrado.");

    const datadomeRes = await (await fetch('https://dwt.soundcloud.com/js/', {
        method: 'POST',
        headers: { Referer: 'https://soundcloud.com/', ...headers },
        body: new URLSearchParams({ ddk: ddjsKey })
    })).json();
    const datadome = datadomeRes?.cookie?.split('; ')?.[0]?.split('=')?.[1];
    if (!datadome) throw Error("Datadome vacío.");

    const hlsUrl = new URL(stream_url);
    hlsUrl.search = new URLSearchParams({ client_id, track_authorization });

    const hlsData = await (await fetch(hlsUrl, {
        headers: { 'x-datadome-clientid': datadome, ...headers }
    })).json();

    return {
        title: trackData.title || 'Sin título',
        username: trackData.user?.username || 'Desconocido',
        url: hlsData.url
    };
}