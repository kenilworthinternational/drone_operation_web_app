/**
 * Compact PHP vs Node audit summary.
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const servicesDir = path.join(root, 'src/api/services');
const nodeDir = path.join(root, 'src/api/services NodeJs');
const srcDir = path.join(root, 'src');

function walk(dir, files = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory() && !['node_modules', 'build', 'scripts'].includes(e.name)) walk(p, files);
    else if (/\.(jsx?|tsx?)$/.test(e.name)) files.push(p);
  }
  return files;
}

const sources = walk(srcDir).map((f) => ({
  file: path.relative(root, f).replace(/\\/g, '/'),
  content: fs.readFileSync(f, 'utf8'),
}));

function parseLegacyPhp(filePath) {
  const c = fs.readFileSync(filePath, 'utf8');
  const file = path.relative(root, filePath).replace(/\\/g, '/');
  const out = [];
  const re = /(\w+):\s*builder\.(query|mutation)\(\{[\s\S]*?url:\s*['"]([^'"]+)['"]/g;
  let m;
  while ((m = re.exec(c)) !== null) {
    const [, name, , url] = m;
    if (url.startsWith('/api/')) continue; // assetsApi hybrid — Node
    const hooks = [
      `use${name.charAt(0).toUpperCase() + name.slice(1)}Query`,
      `use${name.charAt(0).toUpperCase() + name.slice(1)}Mutation`,
      `useLazy${name.charAt(0).toUpperCase() + name.slice(1)}Query`,
    ];
    const usages = [];
    for (const src of sources) {
      if (src.file === file) continue;
      if (src.file.includes('api/services/') && !src.file.includes('NodeJs')) continue;
      if (hooks.some((h) => src.content.includes(h)) || src.content.includes(`endpoints.${name}.initiate`)) {
        usages.push(src.file);
      }
    }
    out.push({ file, name, url, usages: [...new Set(usages)].sort() });
  }
  return out;
}

const php = fs
  .readdirSync(servicesDir)
  .filter((f) => f.endsWith('.js') && f !== 'allEndpoints.js')
  .flatMap((f) => parseLegacyPhp(path.join(servicesDir, f)));

const phpUsed = php.filter((e) => e.usages.length > 0);
const phpUnused = php.filter((e) => e.usages.length === 0);

const nodeModules = fs.readdirSync(nodeDir).filter((f) => f.endsWith('.js') && f !== 'allEndpoints.js');

console.log(JSON.stringify({
  summary: {
    phpEndpointCount: php.length,
    phpStillUsedInUi: phpUsed.length,
    phpUnusedInUi: phpUnused.length,
    nodeApiFiles: nodeModules.length,
  },
  phpByService: Object.fromEntries(
    [...new Set(php.map((p) => p.file))].sort().map((f) => [
      f.replace('src/api/services/', ''),
      {
        total: php.filter((p) => p.file === f).length,
        used: php.filter((p) => p.file === f && p.usages.length).length,
      },
    ])
  ),
  phpStillUsed: phpUsed.map((e) => ({
    endpoint: e.name,
    phpUrl: e.url,
    service: e.file.replace('src/api/services/', ''),
    screens: e.usages,
  })),
  phpUnused: phpUnused.map((e) => ({ endpoint: e.name, phpUrl: e.url, service: e.file.replace('src/api/services/', '') })),
  nodeApiModules: nodeModules.map((f) => f.replace('.js', '')).sort(),
}, null, 2));
