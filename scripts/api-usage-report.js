/**
 * Read-only audit: defined vs used RTK Query endpoints, direct fetch URLs,
 * and resource/upload paths in dsms_frontend.
 *
 * Usage: node scripts/api-usage-report.js [--json]
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'src');
const API_DIR = path.join(SRC, 'api');

function walk(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, acc);
    else if (/\.(js|jsx|ts|tsx)$/.test(entry.name)) acc.push(full);
  }
  return acc;
}

function rel(p) {
  return path.relative(ROOT, p).replace(/\\/g, '/');
}

function read(file) {
  return fs.readFileSync(file, 'utf8');
}

function isApiServiceFile(file) {
  return file.startsWith(API_DIR) && file.endsWith('.js');
}

/** Parse endpoint blocks from RTK injectEndpoints files */
function parseApiEndpoints(file, content) {
  const endpoints = [];
  const isNode = file.includes(`${path.sep}services NodeJs${path.sep}`);
  const isPhp = file.includes(`${path.sep}services${path.sep}`) && !isNode;

  // endpointName: builder.query|mutation({ ... url: '...' | `...`
  const blockRe = /(\w+)\s*:\s*builder\.(query|mutation)\s*\(\s*\{([\s\S]*?)\n\s*\}\s*,?\s*\)/g;
  let m;
  while ((m = blockRe.exec(content)) !== null) {
    const name = m[1];
    const kind = m[2];
    const body = m[3];
    let url = null;
    let method = null;
    let backend = isNode ? 'node' : isPhp ? 'php' : 'mixed';

    const urlMatch = body.match(/url\s*:\s*(['"`])([\s\S]*?)\1/);
    if (urlMatch) url = urlMatch[2].trim();

    const methodMatch = body.match(/method\s*:\s*['"](\w+)['"]/);
    if (methodMatch) method = methodMatch[1];

    if (body.includes('nodeBackendBaseQuery') || body.includes('getNodeBackendUrl()')) {
      backend = 'node';
    }
    if (body.includes('queryFn') && body.includes('getNodeBackendUrl')) {
      backend = 'node';
    }
    if (url && url.startsWith('/api/')) backend = 'node';
    if (url && !url.startsWith('/') && !url.startsWith('http')) backend = backend === 'node' ? 'node' : 'php';

    // Exported hook names
    const hookQuery = `use${name.charAt(0).toUpperCase()}${name.slice(1)}Query`;
    const hookMutation = `use${name.charAt(0).toUpperCase()}${name.slice(1)}Mutation`;
    const hookLazy = `useLazy${name.charAt(0).toUpperCase()}${name.slice(1)}Query`;

    endpoints.push({
      name,
      kind,
      url,
      method,
      backend,
      serviceFile: rel(file),
      hooks: [hookQuery, hookMutation, hookLazy],
    });
  }

  // queryFn-only endpoints with fetch URLs
  const queryFnRe = /(\w+)\s*:\s*builder\.(query|mutation)\s*\(\s*\{[\s\S]*?queryFn[\s\S]*?fetch\s*\(\s*[`'"]([^`'"]+)[`'"]/g;
  while ((m = queryFnRe.exec(content)) !== null) {
    const existing = endpoints.find((e) => e.name === m[1]);
    if (existing) {
      if (!existing.url) existing.url = m[3];
      existing.backend = 'node';
    }
  }

  return endpoints;
}

function findUsages(allFiles, endpoint) {
  const patterns = [
    ...endpoint.hooks,
    `baseApi.endpoints.${endpoint.name}`,
    `.endpoints.${endpoint.name}.`,
    `${endpoint.name}.initiate`,
  ];
  const hits = [];
  for (const file of allFiles) {
    if (isApiServiceFile(file)) continue;
    const content = read(file);
    for (const pat of patterns) {
      if (content.includes(pat)) {
        hits.push(rel(file));
        break;
      }
    }
  }
  // Also check api service file exports used elsewhere via destructuring from api module
  return [...new Set(hits)].sort();
}

function scanDirectFetches(allFiles) {
  const results = [];
  const fetchRe = /fetch\s*\(\s*[`'"]([^`'"]+)[`'"]/g;
  const templateFetchRe = /fetch\s*\(\s*`([^`]+)`/g;
  const getNodeRe = /getNodeBackendUrl\(\)\s*}\/([^`'"]+)/g;
  const apiBaseRe = /API_BASE_URL\s*}\s*([^`'"]+)|`\$\{API_BASE_URL\}([^`'"]+)`/g;

  for (const file of allFiles) {
    const content = read(file);
    let m;
    while ((m = fetchRe.exec(content)) !== null) {
      results.push({ url: m[1], file: rel(file), type: 'fetch-literal' });
    }
    while ((m = templateFetchRe.exec(content)) !== null) {
      if (m[1].includes('${')) {
        results.push({ url: m[1], file: rel(file), type: 'fetch-template' });
      }
    }
    while ((m = getNodeRe.exec(content)) !== null) {
      results.push({ url: `/api/${m[1]}`.replace(/\/+/g, '/').replace('/api/api/', '/api/'), file: rel(file), type: 'node-template' });
    }
  }
  return results;
}

function scanResourcePaths(allFiles) {
  const pathRe = /['"`](\/uploads\/[^'"`]+)['"`]|['"`](\/documents\/[^'"`]+)['"`]/g;
  const resourceTypeRe = /getResourceUrl\s*\(\s*['"](\w+)['"]/g;
  const resolveMediaRe = /resolveMediaUrl\s*\([^,]+,\s*['"](\w+)['"]/g;
  const hits = new Map();

  for (const file of allFiles) {
    const content = read(file);
    let m;
    while ((m = pathRe.exec(content)) !== null) {
      const p = m[1].replace(/\$\{[^}]+\}/g, '*');
      const key = p;
      if (!hits.has(key)) hits.set(key, []);
      hits.get(key).push(rel(file));
    }
    while ((m = resourceTypeRe.exec(content)) !== null) {
      const key = `TYPE:${m[1]}`;
      if (!hits.has(key)) hits.set(key, []);
      hits.get(key).push(rel(file));
    }
    while ((m = resolveMediaRe.exec(content)) !== null) {
      const key = `TYPE:${m[1]}`;
      if (!hits.has(key)) hits.set(key, []);
      hits.get(key).push(rel(file));
    }
  }

  return [...hits.entries()]
    .map(([pathOrType, files]) => ({ pathOrType, files: [...new Set(files)].sort() }))
    .sort((a, b) => a.pathOrType.localeCompare(b.pathOrType));
}

function loadBackendResourceUrls() {
  const backendFile = path.join(ROOT, '..', 'dsms_backend_dev', 'shared', 'config', 'resourceLocations.js');
  if (!fs.existsSync(backendFile)) return {};
  const content = read(backendFile);
  const section = content.match(/const RESOURCE_URLS = \{([\s\S]*?)\};/);
  if (!section) return {};
  const urls = {};
  const lineRe = /(\w+)\s*:\s*`([^`]+)`/g;
  let m;
  while ((m = lineRe.exec(section[1])) !== null) {
    urls[m[1]] = m[2];
  }
  return urls;
}

function loadFrontendResourcePaths() {
  const file = path.join(SRC, 'utils', 'resourceUrls.js');
  if (!fs.existsSync(file)) return {};
  const content = read(file);
  const section = content.match(/export const RESOURCE_URL_PATHS = \{([\s\S]*?)\};/);
  if (!section) return {};
  const urls = {};
  const lineRe = /(\w+)\s*:\s*'([^']+)'/g;
  let m;
  while ((m = lineRe.exec(section[1])) !== null) {
    urls[m[1]] = m[2];
  }
  return urls;
}

function main() {
  const allFiles = walk(SRC);
  const apiFiles = allFiles.filter(isApiServiceFile);

  const allEndpoints = [];
  for (const file of apiFiles) {
    const content = read(file);
    allEndpoints.push(...parseApiEndpoints(file, content));
  }

  const used = [];
  const unused = [];
  for (const ep of allEndpoints) {
    const usageFiles = findUsages(allFiles, ep);
    const row = { ...ep, usedIn: usageFiles, used: usageFiles.length > 0 };
    if (row.used) used.push(row);
    else unused.push(row);
  }

  const directFetches = scanDirectFetches(allFiles);
  const resourceUsage = scanResourcePaths(allFiles);
  const backendUrls = loadBackendResourceUrls();
  const frontendUrls = loadFrontendResourcePaths();

  const phpUsed = used.filter((e) => e.backend === 'php');
  const phpUnused = unused.filter((e) => e.backend === 'php');
  const nodeUsed = used.filter((e) => e.backend === 'node');
  const nodeUnused = unused.filter((e) => e.backend === 'node');

  const frontendTypes = new Set(Object.keys(frontendUrls));
  const backendTypes = new Set(Object.keys(backendUrls));
  const usedTypes = new Set(
    resourceUsage.filter((r) => r.pathOrType.startsWith('TYPE:')).map((r) => r.pathOrType.replace('TYPE:', ''))
  );

  const report = {
    generatedAt: new Date().toISOString(),
    summary: {
      totalEndpoints: allEndpoints.length,
      usedEndpoints: used.length,
      unusedEndpoints: unused.length,
      php: { defined: allEndpoints.filter((e) => e.backend === 'php').length, used: phpUsed.length, unused: phpUnused.length },
      node: { defined: allEndpoints.filter((e) => e.backend === 'node').length, used: nodeUsed.length, unused: nodeUnused.length },
      directFetchCalls: directFetches.length,
      resourceTypesInFrontendConfig: frontendTypes.size,
      resourceTypesInBackendConfig: backendTypes.size,
      backendResourceTypesNotInFrontendConfig: [...backendTypes].filter((t) => !frontendTypes.has(t)).sort(),
      frontendResourceTypesNotInBackendConfig: [...frontendTypes].filter((t) => !backendTypes.has(t)).sort(),
    },
    baseUrls: {
      php: {
        development: 'https://drone-admin-test.kenilworthinternational.com/api/',
        production: 'https://drone-admin.kenilworthinternational.com/api/',
        configFile: 'src/config/config.js (API_BASE_URL)',
      },
      node: {
        development: 'https://dsms-web-api-dev.kenilworthinternational.com',
        production: 'https://dsms-web-api.kenilworthinternational.com',
        configFile: 'src/api/services NodeJs/nodeBackendConfig.js (getNodeBackendUrl)',
      },
    },
    usedEndpoints: used.sort((a, b) => a.name.localeCompare(b.name)),
    unusedEndpoints: unused.sort((a, b) => a.name.localeCompare(b.name)),
    directFetchCalls: directFetches,
    resourceLocations: {
      frontendConfig: frontendUrls,
      backendConfig: backendUrls,
      usageInCode: resourceUsage,
      backendTypesNeverReferencedInWeb: [...backendTypes].filter((t) => !usedTypes.has(t)).sort(),
      backendTypesReferencedInWeb: [...backendTypes].filter((t) => usedTypes.has(t)).sort(),
      hardcodedUploadPathsInWeb: resourceUsage.filter((r) => !r.pathOrType.startsWith('TYPE:')),
    },
  };

  const jsonOut = process.argv.includes('--json');
  if (jsonOut) {
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  const lines = [];
  lines.push('# DSMS Web — API & Resource Usage Report');
  lines.push('');
  lines.push(`Generated: ${report.generatedAt}`);
  lines.push('');
  lines.push('> Read-only audit. No code was changed.');
  lines.push('');
  lines.push('## Summary');
  lines.push('');
  lines.push(`| Metric | Count |`);
  lines.push(`|--------|------:|`);
  lines.push(`| RTK endpoints defined | ${report.summary.totalEndpoints} |`);
  lines.push(`| RTK endpoints **used** in UI | ${report.summary.usedEndpoints} |`);
  lines.push(`| RTK endpoints **unused** (defined only in api/) | ${report.summary.unusedEndpoints} |`);
  lines.push(`| PHP-backed endpoints (used / unused) | ${report.summary.php.used} / ${report.summary.php.unused} |`);
  lines.push(`| Node-backed endpoints (used / unused) | ${report.summary.node.used} / ${report.summary.node.unused} |`);
  lines.push(`| Direct \`fetch()\` / template URL calls | ${report.summary.directFetchCalls} |`);
  lines.push('');
  lines.push('## Base URL locations');
  lines.push('');
  lines.push('| Backend | Dev | Prod | Config |');
  lines.push('|---------|-----|------|--------|');
  lines.push(`| **PHP** | ${report.baseUrls.php.development} | ${report.baseUrls.php.production} | \`${report.baseUrls.php.configFile}\` |`);
  lines.push(`| **Node** | ${report.baseUrls.node.development} | ${report.baseUrls.node.production} | \`${report.baseUrls.node.configFile}\` |`);
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('## Used APIs');
  lines.push('');
  for (const ep of report.usedEndpoints) {
    lines.push(`### \`${ep.name}\` (${ep.backend}, ${ep.kind})`);
    lines.push(`- **URL:** \`${ep.url || '(queryFn / dynamic)'}\`${ep.method ? ` · **${ep.method}**` : ''}`);
    lines.push(`- **Defined in:** \`${ep.serviceFile}\``);
    lines.push(`- **Used in:** ${ep.usedIn.map((f) => `\`${f}\``).join(', ')}`);
    lines.push('');
  }
  lines.push('---');
  lines.push('');
  lines.push('## Unused APIs (defined in RTK, not referenced in src outside api/)');
  lines.push('');
  if (report.unusedEndpoints.length === 0) {
    lines.push('_None — every injected endpoint appears referenced._');
  } else {
    lines.push('| Endpoint | Backend | Kind | URL | Service file |');
    lines.push('|----------|---------|------|-----|--------------|');
    for (const ep of report.unusedEndpoints) {
      lines.push(`| \`${ep.name}\` | ${ep.backend} | ${ep.kind} | \`${ep.url || '-'}\` | \`${ep.serviceFile}\` |`);
    }
  }
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('## Direct fetch / non-RTK API calls');
  lines.push('');
  lines.push('| URL pattern | File |');
  lines.push('|-------------|------|');
  for (const f of report.directFetchCalls) {
    lines.push(`| \`${f.url}\` | \`${f.file}\` |`);
  }
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('## Resource locations');
  lines.push('');
  lines.push('### Configured in `src/utils/resourceUrls.js` (used by `getResourceUrl`)');
  lines.push('');
  lines.push('| Type | Path |');
  lines.push('|------|------|');
  for (const [type, p] of Object.entries(report.resourceLocations.frontendConfig)) {
    lines.push(`| \`${type}\` | \`${p}\` |`);
  }
  lines.push('');
  lines.push('### Backend `resourceLocations.js` — referenced in web via `getResourceUrl` / `resolveMediaUrl`');
  lines.push('');
  for (const t of report.resourceLocations.backendTypesReferencedInWeb) {
    const usage = report.resourceLocations.usageInCode.find((u) => u.pathOrType === `TYPE:${t}`);
    lines.push(`- **\`${t}\`** → \`${report.resourceLocations.backendConfig[t]}\`${usage ? ` — ${usage.files.map((f) => `\`${f}\``).join(', ')}` : ''}`);
  }
  lines.push('');
  lines.push('### Backend resource types **not** referenced in web (no `getResourceUrl(\'TYPE\')` usage)');
  lines.push('');
  if (report.resourceLocations.backendTypesNeverReferencedInWeb.length === 0) {
    lines.push('_All backend resource types appear referenced (by type or hardcoded path)._');
  } else {
    for (const t of report.resourceLocations.backendTypesNeverReferencedInWeb) {
      lines.push(`- \`${t}\` → \`${report.resourceLocations.backendConfig[t]}\``);
    }
  }
  lines.push('');
  lines.push('### Hardcoded `/uploads/` or `/documents/` paths in web (outside `resourceUrls.js`)');
  lines.push('');
  for (const row of report.resourceLocations.hardcodedUploadPathsInWeb) {
    lines.push(`- \`${row.pathOrType}\` — ${row.files.map((f) => `\`${f}\``).join(', ')}`);
  }
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('_Re-run: `node scripts/api-usage-report.js` (markdown to stdout) or `--json` for machine output._');

  const outPath = path.join(ROOT, 'WEB_API_USAGE_REPORT.md');
  const md = lines.join('\n');
  fs.writeFileSync(outPath, md, 'utf8');
  console.log(md);
  console.log(`\n\n[Written to ${rel(outPath)}]`);
}

main();
