/**
 * Audit PHP (legacy) vs Node API usage in dsms_frontend.
 * Run: node scripts/audit-api-usage.js
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
    if (e.isDirectory() && !['node_modules', 'build'].includes(e.name)) walk(p, files);
    else if (/\.(jsx?|tsx?)$/.test(e.name)) files.push(p);
  }
  return files;
}

const allSource = walk(srcDir).map((f) => ({
  file: path.relative(root, f).replace(/\\/g, '/'),
  content: fs.readFileSync(f, 'utf8'),
}));

function extractExports(filePath) {
  const c = fs.readFileSync(filePath, 'utf8');
  const block = c.match(/export const \{([^}]+)\}/s);
  if (!block) return [];
  return block[1]
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function extractEndpoints(filePath, backend) {
  const c = fs.readFileSync(filePath, 'utf8');
  const file = path.relative(root, filePath).replace(/\\/g, '/');
  const exports = extractExports(filePath);
  const results = [];

  const endpointBlocks = [...c.matchAll(/(\w+):\s*builder\.(query|mutation)\(\{/g)];
  for (const match of endpointBlocks) {
    const name = match[1];
    const start = match.index;
    const slice = c.slice(start, start + 800);
    const urlMatch =
      slice.match(/url:\s*['"]([^'"]+)['"]/) ||
      slice.match(/nodePost\(`\$\{base\}([^`]+)`/) ||
      slice.match(/url:\s*`([^`]+)`/);
    const url = urlMatch ? urlMatch[1] : '(queryFn)';
    const fullUrl = url.startsWith('/') ? url : url.startsWith('(') ? url : url;
    const hookQuery = exports.find((h) => h === `use${name.charAt(0).toUpperCase() + name.slice(1)}Query`);
    const hookMutation = exports.find((h) => h === `use${name.charAt(0).toUpperCase() + name.slice(1)}Mutation`);
    const hookLazy = exports.find((h) => h.startsWith(`useLazy${name.charAt(0).toUpperCase() + name.slice(1)}`));
    const hooks = [hookQuery, hookMutation, hookLazy].filter(Boolean);

    const isNodeUrl = fullUrl.startsWith('/api/') || backend === 'node';
    const usages = [];
    for (const hook of hooks.length ? hooks : [`use${name.charAt(0).toUpperCase() + name.slice(1)}Query`]) {
      const re = new RegExp(`\\b${hook}\\b`);
      for (const src of allSource) {
        if (re.test(src.content)) usages.push(src.file);
      }
    }
    // also baseApi.endpoints.name.initiate
    const initRe = new RegExp(`endpoints\\.${name}\\.initiate`);
    for (const src of allSource) {
      if (initRe.test(src.content)) usages.push(src.file);
    }

    results.push({
      backend,
      file,
      name,
      url: fullUrl,
      isNodeUrl,
      hooks,
      usages: [...new Set(usages)].sort(),
    });
  }
  return results;
}

const legacyFiles = fs
  .readdirSync(servicesDir)
  .filter((f) => f.endsWith('.js') && f !== 'allEndpoints.js');
const nodeFiles = fs.readdirSync(nodeDir).filter((f) => f.endsWith('.js') && f !== 'allEndpoints.js');

let all = [];
for (const f of legacyFiles) {
  all = all.concat(extractEndpoints(path.join(servicesDir, f), 'php'));
}
for (const f of nodeFiles) {
  all = all.concat(extractEndpoints(path.join(nodeDir, f), 'node'));
}

const phpUsed = all.filter((e) => e.backend === 'php' && !e.isNodeUrl && e.usages.length > 0);
const phpUnused = all.filter((e) => e.backend === 'php' && !e.isNodeUrl && e.usages.length === 0);
const phpMixedNode = all.filter((e) => e.backend === 'php' && e.isNodeUrl);
const nodeUsed = all.filter((e) => e.backend === 'node' && e.usages.length > 0);
const nodeUnused = all.filter((e) => e.backend === 'node' && e.usages.length === 0);

function printSection(title, items) {
  console.log(`\n${'='.repeat(72)}`);
  console.log(title + ` (${items.length})`);
  console.log('='.repeat(72));
  for (const e of items.sort((a, b) => a.name.localeCompare(b.name))) {
    console.log(`\n  ${e.name}`);
    console.log(`    URL: ${e.url}`);
    console.log(`    Defined: ${e.file}`);
    if (e.usages.length) {
      console.log(`    Used in (${e.usages.length}):`);
      e.usages.slice(0, 8).forEach((u) => console.log(`      - ${u}`));
      if (e.usages.length > 8) console.log(`      ... +${e.usages.length - 8} more`);
    } else {
      console.log('    Used in: (none found)');
    }
  }
}

console.log('DSMS Frontend API Audit — PHP vs Node');
console.log(`Scanned ${allSource.length} source files`);
console.log(`Legacy PHP service endpoints: ${all.filter((e) => e.backend === 'php' && !e.isNodeUrl).length}`);
console.log(`Node service endpoints: ${all.filter((e) => e.backend === 'node').length}`);
console.log(`assetsApi Node-hybrid endpoints: ${phpMixedNode.length}`);

printSection('STILL USING PHP APIs (used in UI)', phpUsed);
printSection('PHP APIs DEFINED BUT NOT USED IN UI', phpUnused);
printSection('NODE APIs IN USE', nodeUsed);
printSection('NODE APIs DEFINED BUT NOT USED', nodeUnused.slice(0, 40));
if (nodeUnused.length > 40) console.log(`\n  ... +${nodeUnused.length - 40} more unused Node endpoints`);
