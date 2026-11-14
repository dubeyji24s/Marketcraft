// Packs client/dist-preview into one self-contained HTML page (for a claude.ai artifact).
import fs from 'node:fs';
const dir = 'client/dist-preview/assets';
const files = fs.readdirSync(dir);
const js = fs.readFileSync(`${dir}/${files.find((f) => f.endsWith('.js'))}`, 'utf8').replaceAll('</script', '<\\/script');
const css = fs.readFileSync(`${dir}/${files.find((f) => f.endsWith('.css'))}`, 'utf8');
fs.mkdirSync('preview', { recursive: true });
fs.writeFileSync('preview/marketcraft-preview.html', `<title>Marketcraft</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=Outfit:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>${css}</style>
<div id="root"></div>
<script type="module">${js}</script>
`);
console.log('wrote preview/marketcraft-preview.html');
