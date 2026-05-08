import fetch from 'node-fetch';
import sharp from 'sharp';

export class Upscaler {
  endpoint = 'https://luca115-best-upscaling-models.hf.space';
  cdn = 'https://cdn.adoolab.xyz/api/upload';
  models = [
    '4xRealHATGANSharper',
    '4xRealHATGAN',
    '4xNomos8kSCHAT-L',
    '4xNomosWebPhoto_RealPLKSR'
  ];
  ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36';

  async _fetch(url, opts = {}) {
    const res = await fetch(url, {
      ...opts,
      headers: { 'User-Agent': this.ua, Referer: 'https://upsampler.com/', ...opts.headers },
    });
    if (!res.ok) throw new Error(`${url} responded ${res.status}`);
    return res;
  }

  async _upload(imageUrl) {
    const img = await this._fetch(imageUrl);
    const fileBuffer = Buffer.from(await img.arrayBuffer());
    const fileName = imageUrl.split('/').pop() || 'image.jpg';
    const boundary = '----FormBoundary' + Math.random().toString(36).slice(2);
    const header = Buffer.from(
      `--${boundary}\r\nContent-Disposition: form-data; name="files"; filename="${fileName}"\r\nContent-Type: application/octet-stream\r\n\r\n`
    );
    const footer = Buffer.from(`\r\n--${boundary}--\r\n`);

    const res = await this._fetch(`${this.endpoint}/gradio_api/upload`, {
      method: 'POST',
      headers: { 'Content-Type': `multipart/form-data; boundary=${boundary}` },
      body: Buffer.concat([header, fileBuffer, footer]),
    });
    return (await res.json())[0];
  }

  async _process(remotePath, model, sessionHash) {
    const res = await this._fetch(`${this.endpoint}/gradio_api/queue/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: [{ path: remotePath, meta: { _type: 'gradio.FileData' } }, model],
        fn_index: 1,
        session_hash: sessionHash,
      }),
    });
    return (await res.json()).event_id;
  }

  async _waitResult(sessionHash) {
    const res = await this._fetch(`${this.endpoint}/gradio_api/queue/data?session_hash=${sessionHash}`, {
      headers: { Accept: 'text/event-stream' },
    });

    let buffer = '';
    const decoder = new TextDecoder();
    const reader = res.body.getReader();

    while (true) {
      const { done, value } = await reader.read();
      if (done) throw new Error('SSE stream closed without result');
      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split('\n');
      buffer = lines.pop();

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        try {
          const msg = JSON.parse(line.slice(6));
          if (msg.msg === 'process_completed') {
            if (!msg.success) throw new Error('Processing failed');
            const outputs = msg.output.data[0];
            return {
              url: outputs[outputs.length - 1].url,
              duration: msg.output.duration,
            };
          }
        } catch (e) {
          if (e.message === 'Processing failed') throw e;
        }
      }
    }
  }

  async _convertToJpg(webpBuffer) {
    return await sharp(webpBuffer).jpeg({ quality: 90 }).toBuffer();
  }

  async _uploadCdn(jpgBuffer, filename) {
    const base64 = jpgBuffer.toString('base64');
    const res = await fetch(this.cdn, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        filename,
        data: base64,
        mimetype: 'image/jpeg',
        expiration: '24h',
      }),
    });
    if (!res.ok) throw new Error(`CDN upload failed: ${res.status}`);
    return await res.json();
  }

  async upscale(imageUrl, model) {
    try {
      if (!imageUrl) throw new Error('imageUrl is required');
      model = model || this.models[0];
      if (!this.models.includes(model)) throw new Error(`Invalid model. Valid: ${this.models.join(', ')}`);

      const sessionHash = Math.random().toString(36).slice(2, 14);
      const remotePath = await this._upload(imageUrl);
      await this._process(remotePath, model, sessionHash);
      const result = await this._waitResult(sessionHash);

      const dlRes = await this._fetch(result.url);
      const webpBuffer = Buffer.from(await dlRes.arrayBuffer());
      const jpgBuffer = await this._convertToJpg(webpBuffer);

      const filename = `upscaled_${Date.now()}.jpg`;
      const cdn = await this._uploadCdn(jpgBuffer, filename);

      return {
        status: true,
        data: {
          source: imageUrl,
          model,
          url: cdn.url,
          duration: +result.duration.toFixed(2),
        },
      };
    } catch (e) {
      return {
        status: false,
        msg: e instanceof Error ? e.message : String(e),
      };
    }
  }
}

let handler = async (m, { conn, args }) => {
  const quoted = m.quoted ? m.quoted : null;
  const mime = quoted?.mimetype || '';
  if (!mime || !mime.startsWith('image/')) {
    return conn.reply(m.chat, '⚠️ Responde a una *imagen* con el comando `.hd`.', m);
  }

  const img = await quoted.download();
  if (!img) return conn.reply(m.chat, '❌ No se pudo obtener la imagen.', m);

  const uploadRes = await fetch('https://telegra.ph/upload', {
    method: 'POST',
    body: img,
    headers: { 'Content-Type': 'image/jpeg' }
  });
  const json = await uploadRes.json();
  const imageUrl = 'https://telegra.ph' + json[0].src;

  const model = args[0];
  const upscaler = new Upscaler();
  const result = await upscaler.upscale(imageUrl, model);

  if (!result.status) {
    return conn.reply(m.chat, `❌ Error: ${result.msg}`, m);
  }

  const txt = `*乂 H D - U P S C A L E R 乂*\n\n` +
              `*» Modelo* : ${result.data.model}\n` +
              `*» Upscaled* : ${result.data.url}\n` +
              `*» Tiempo* : ${result.data.duration}s\n`;

  await conn.sendFile(m.chat, result.data.url, 'upscaled.jpg', txt, m);
};

handler.help = ['hd'];
handler.tags = ['tools'];
handler.command = ['hd','upscale'];

export default handler;