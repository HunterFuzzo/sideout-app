import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distHtmlPath = path.resolve(__dirname, '../dist/index.html');
const targetBundlePath = path.resolve(__dirname, '../../src/bundleHtml.js');

if (fs.existsSync(distHtmlPath)) {
  const html = fs.readFileSync(distHtmlPath, 'utf8');
  const jsContent = `export const htmlContent = ${JSON.stringify(html)};\n`;
  fs.writeFileSync(targetBundlePath, jsContent, 'utf8');
  console.log(`✅ Inlined client bundle written to ${targetBundlePath} (${(html.length / 1024).toFixed(1)} KB)`);
} else {
  console.error(`❌ Dist HTML not found at ${distHtmlPath}`);
  process.exit(1);
}
