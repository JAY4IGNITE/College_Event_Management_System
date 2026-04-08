const fs = require('fs');
const path = require('path');
const { Readable } = require('stream');
const { finished } = require('stream/promises');

const ASSETS_DIR = path.join(__dirname, 'presentation_assets');
const FONTS_DIR = path.join(ASSETS_DIR, 'fonts');

if (!fs.existsSync(ASSETS_DIR)) fs.mkdirSync(ASSETS_DIR, { recursive: true });
if (!fs.existsSync(FONTS_DIR)) fs.mkdirSync(FONTS_DIR, { recursive: true });

async function downloadFile(url, dest) {
    const res = await fetch(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
    });
    if (!res.ok) throw new Error(`Failed to download ${url}: ${res.statusText}`);
    const fileStream = fs.createWriteStream(dest, { flags: 'wx' });
    await finished(Readable.fromWeb(res.body).pipe(fileStream));
}

async function fetchText(url) {
    const res = await fetch(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
    });
    if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.statusText}`);
    return await res.text();
}

async function run() {
    try {
        console.log('Downloading GSAP...');
        const gsapPath = path.join(ASSETS_DIR, 'gsap.min.js');
        if (!fs.existsSync(gsapPath)) await downloadFile('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js', gsapPath);

        console.log('Downloading Feather Icons...');
        const featherPath = path.join(ASSETS_DIR, 'feather.min.js');
        if (!fs.existsSync(featherPath)) await downloadFile('https://unpkg.com/feather-icons', featherPath);

        console.log('Downloading Google Fonts CSS...');
        let css = await fetchText('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Inter:wght@400;500;600&display=swap');

        const urlRegex = /url\((https:\/\/[^)]+)\)/g;
        let match;
        const fontUrls = [];
        while ((match = urlRegex.exec(css)) !== null) {
            fontUrls.push(match[1]);
        }

        console.log(`Found ${fontUrls.length} fonts. Downloading...`);
        for (let i = 0; i < fontUrls.length; i++) {
            const fontUrl = fontUrls[i];
            const fontName = `font_${i}.woff2`;
            const fontPath = path.join(FONTS_DIR, fontName);
            try {
                if (!fs.existsSync(fontPath)) {
                    await downloadFile(fontUrl, fontPath);
                }
            } catch (e) {
                console.error('Error downloading font', fontUrl, e);
            }
            css = css.replace(fontUrl, `fonts/${fontName}`);
        }

        fs.writeFileSync(path.join(ASSETS_DIR, 'fonts.css'), css);
        console.log('Done!');
    } catch (e) {
        console.error('Fatal Error:', e);
    }
}

run();
