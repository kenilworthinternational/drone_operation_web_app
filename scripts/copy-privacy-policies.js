const fs = require('fs');
const path = require('path');

const sourceDir = path.join(__dirname, '..', 'privacy-policy');
const targetDir = path.join(__dirname, '..', 'public');

if (!fs.existsSync(sourceDir)) {
  console.warn('privacy-policy folder not found, skipping copy.');
  process.exit(0);
}

const files = fs.readdirSync(sourceDir).filter((file) => file.endsWith('.html'));

if (files.length === 0) {
  console.warn('No privacy policy HTML files found.');
  process.exit(0);
}

files.forEach((file) => {
  const source = path.join(sourceDir, file);
  const target = path.join(targetDir, file);
  fs.copyFileSync(source, target);
  console.log(`Copied ${file} -> public/${file}`);
});
