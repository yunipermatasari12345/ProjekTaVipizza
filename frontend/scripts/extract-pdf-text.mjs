import fs from 'fs';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

const pdfPath = process.argv[2];
const data = new Uint8Array(fs.readFileSync(pdfPath));
const doc = await getDocument({ data, useSystemFonts: true }).promise;

const keywords = ['mockup', 'tampilan', 'halaman', 'login', 'dashboard', 'beranda', 'menu', 'warna', 'desain', 'interface', 'antarmuka', 'figma', 'prototype', 'wireframe', 'pemesanan', 'admin', 'pelanggan'];

for (let i = 1; i <= doc.numPages; i++) {
  const page = await doc.getPage(i);
  const textContent = await page.getTextContent();
  const text = textContent.items.map((item) => item.str).join(' ');
  const lower = text.toLowerCase();
  const hit = keywords.some((k) => lower.includes(k));
  if (hit && text.trim().length > 80) {
    console.log(`\n========== PAGE ${i} ==========\n`);
    console.log(text.slice(0, 4000));
  }
}
