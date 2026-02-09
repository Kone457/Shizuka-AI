import { gotScraping } from 'got-scraping';
import { fileTypeFromBuffer } from 'file-type';

class ITTCracker {
    constructor() {
        this.baseUrl = 'https://imagetotextconverter.net';
        this.apiUrl = 'https://itt2.imagetotextconverter.net';
        this._jwt = null;
        this._jwtExpiry = 0;
        this._bypassReferers = [
            '/handwriting-to-text', '/image-translator', '/image-compressor',
            '/reverse-image-search', '/jpg-to-pdf', '/png-to-pdf'
        ];
        this._currentReferer = 0;
        this.UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
    }

    _upd() { return (Math.random() * 1000).toString(); }
    _getBypassReferer() { return `${this.baseUrl}${this._bypassReferers[this._currentReferer % this._bypassReferers.length]}`; }
    _rotateReferer() { this._currentReferer++; }

    async getJwt() {
        const now = Math.floor(Date.now() / 1000);
        if (this._jwt && this._jwtExpiry > now + 10) return this._jwt;

        const res = await gotScraping({
            url: `${this.baseUrl}/gen-ref-jwt?upd=${this._upd()}`,
            method: 'POST',
            headers: {
                'User-Agent': this.UA,
                'Referer': this._getBypassReferer(),
                'Origin': this.baseUrl,
                'X-Requested-With': 'XMLHttpRequest',
                'Content-Type': 'application/json',
            },
            json: { method: 'V2' },
            throwHttpErrors: false,
        });

        const data = JSON.parse(res.body);
        if (res.statusCode !== 200) {
            this._rotateReferer();
            return this.getJwt(); // Retry with new referer
        }

        this._jwt = data.result.token;
        const payload = JSON.parse(Buffer.from(this._jwt.split('.')[1], 'base64url').toString());
        this._jwtExpiry = payload.exp;
        return this._jwt;
    }

    async ocrBase64(base64Image, ext = 'png') {
        const jwt = await this.getJwt();
        const res = await gotScraping({
            url: `${this.apiUrl}/file-to-text/?upd=${this._upd()}`,
            method: 'POST',
            headers: {
                'User-Agent': this.UA,
                'Referer': this._getBypassReferer(),
                'Origin': this.baseUrl,
                'Authorization': `Bearer ${jwt}`,
                'JVer': 'JwtV2',
                'Content-Type': 'application/json'
            },
            json: {
                ext: ext,
                tool_user: 'web',
                base64_image: base64Image,
            },
            throwHttpErrors: false,
        });

        if (res.statusCode === 401) {
            this._jwt = null;
            return this.ocrBase64(base64Image, ext);
        }

        const data = JSON.parse(res.body);
        if (data.code !== 200) throw new Error('Error al procesar la imagen');
        return data.response?.data || '';
    }
}

let handler = async (m, { conn, usedPrefix, command }) => {
    const q = m.quoted ? m.quoted : m;
    const mime = (q.msg || q).mimetype || q.mediaType || '';
    
    if (!/image\/(png|jpe?g|gif|bmp|webp)/.test(mime)) {
        return m.reply(`*⚠️ Responde a una imagen para extraer el texto.*\nEjemplo: Responde a una foto y escribe:\n${usedPrefix + command}`);
    }

    try {
        
        await m.reply('⏳ *Procesando imagen...*');
        
        const buffer = await q.download?.();
        if (!buffer) return m.reply('❌ Error al descargar la imagen.');

        const ft = await fileTypeFromBuffer(buffer);
        const ext = ft?.ext || 'png';
        const base64 = buffer.toString('base64');

        const cracker = new ITTCracker();
        const text = await cracker.ocrBase64(base64, ext);

        if (!text.trim()) return m.reply('⚠️ No se detectó texto en la imagen.');

        await m.reply(`📝 *TEXTO EXTRAÍDO:*\n\n${text.trim()}`);
        

    } catch (e) {
        console.error(e);
        m.reply(`❌ Error: ${e.message || 'Ocurrió un error inesperado.'}`);
    }
}

handler.help = ['ocr', 'totext']
handler.tags = ['tools']
handler.command = ['ocr', 'totext', 'imagetotext']

export default handler;