import fs from 'fs';
import path from 'path';
import { createCanvas } from 'canvas';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

const pdfPath = process.argv[2];
const pageNum = parseInt(process.argv[3], 10);
const outDir = process.argv[4] || 'd:/vipizza/temp-pdf-pages';

const data = new Uint8Array(fs.readFileSync(pdfPath));
const doc = await getDocument({ data, useSystemFonts: true }).promise;
const page = await doc.getPage(pageNum);
const viewport = page.getViewport({ scale: 2 });

const canvas = createCanvas(viewport.width, viewport.height);
const ctx = canvas.getContext('2d');

// Patch drawImage agar render tidak gagal pada gambar embedded
const origDrawImage = ctx.drawImage.bind(ctx);
ctx.drawImage = (...args) => {
  try {
    origDrawImage(...args);
  } catch {
    // skip broken embedded images
  }
};

await page.render({ canvasContext: ctx, viewport }).promise;

fs.mkdirSync(outDir, { recursive: true });
const outFile = path.join(outDir, `page-${pageNum}.png`);
fs.writeFileSync(outFile, canvas.toBuffer('image/png'));
console.log('Saved:', outFile);
