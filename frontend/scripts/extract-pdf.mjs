import fs from 'fs';
import path from 'path';
import { createCanvas } from 'canvas';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

const pdfPath = process.argv[2];
const outDir = process.argv[3] || 'd:/vipizza/temp-pdf-pages';

if (!pdfPath) {
  console.error('Usage: node extract-pdf.mjs <pdf-path> [out-dir]');
  process.exit(1);
}

fs.mkdirSync(outDir, { recursive: true });

const data = new Uint8Array(fs.readFileSync(pdfPath));
const doc = await getDocument({ data, useSystemFonts: true }).promise;

console.log('TOTAL_PAGES', doc.numPages);

for (let i = 1; i <= Math.min(doc.numPages, 20); i++) {
  const page = await doc.getPage(i);
  const textContent = await page.getTextContent();
  const text = textContent.items.map((item) => item.str).join(' ');
  if (text.trim()) {
    console.log(`\n--- PAGE ${i} TEXT ---\n${text.slice(0, 3000)}`);
  }

  const viewport = page.getViewport({ scale: 1.5 });
  const canvas = createCanvas(viewport.width, viewport.height);
  const ctx = canvas.getContext('2d');
  await page.render({ canvasContext: ctx, viewport }).promise;
  const outFile = path.join(outDir, `page-${String(i).padStart(2, '0')}.png`);
  fs.writeFileSync(outFile, canvas.toBuffer('image/png'));
  console.log('SAVED_IMAGE', outFile);
}
