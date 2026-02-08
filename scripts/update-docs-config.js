const fs = require('fs');
const path = require('path');

const DOCS_JSON_PATH = process.argv[2];
const TYPESCRIPT_DOCS_PATH = process.argv[3];

console.log('--- Documentation Sync Debug ---');
console.log('DOCS_JSON_PATH:', DOCS_JSON_PATH);
console.log('TYPESCRIPT_DOCS_PATH:', TYPESCRIPT_DOCS_PATH);

if (!DOCS_JSON_PATH || !TYPESCRIPT_DOCS_PATH) {
  console.error('Missing arguments');
  process.exit(1);
}

let jsTsGroup = null;

function findGroup(items) {
  if (!items || !Array.isArray(items)) return;
  for (const item of items) {
    if (typeof item !== 'object') continue;
    if (item.group === 'JS/TS') {
      jsTsGroup = item;
      return;
    }
    if (item.pages) findGroup(item.pages);
    if (jsTsGroup) return;
  }
}

try {
  const content = fs.readFileSync(DOCS_JSON_PATH, 'utf8');
  const config = JSON.parse(content);
  const navigation = config.navigation || config.tabs || config.nav || [];
  
  findGroup(navigation);

  if (!jsTsGroup) {
    console.error('JS/TS group not found');
    process.exit(1);
  }

  const files = fs.readdirSync(TYPESCRIPT_DOCS_PATH)
    .filter(f => f.endsWith('.mdx'))
    .sort()
    .map(f => 'sdk-reference/typescript/' + path.basename(f, '.mdx'));

  jsTsGroup.pages = files;

  fs.writeFileSync(DOCS_JSON_PATH, JSON.stringify(config, null, 2) + '\n');
  console.log('Successfully updated docs.json');
} catch (err) {
  console.error('Execution error:', err.message);
  process.exit(1);
}
