/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs');
const path = require('path');

const DOCS_JSON_PATH = process.argv[2];
const TYPESCRIPT_DOCS_PATH = process.argv[3];

console.log(`Starting documentation sync...`);
console.log(`Config path: ${DOCS_JSON_PATH}`);
console.log(`Docs source: ${TYPESCRIPT_DOCS_PATH}`);

if (!DOCS_JSON_PATH || !TYPESCRIPT_DOCS_PATH) {
  console.error('Missing required arguments.');
  process.exit(1);
}

let jsTsGroup = null;

function findGroup(items) {
  if (!items || !Array.isArray(items)) return;

  for (const item of items) {
    // If it's a string skip it
    if (typeof item !== 'object') continue;

    if (item.group === 'JS/TS') {
      console.log('Found "JS/TS" group.');
      jsTsGroup = item;
      return;
    }

    if (item.pages && Array.isArray(item.pages)) {
      findGroup(item.pages);
      if (jsTsGroup) return;
    }
  }
}

try {
  if (!fs.existsSync(DOCS_JSON_PATH)) {
    throw new Error(`File not found: ${DOCS_JSON_PATH}`);
  }

  const docsConfig = JSON.parse(fs.readFileSync(DOCS_JSON_PATH, 'utf8'));
  const navigation = docsConfig.navigation || docsConfig.tabs || docsConfig.nav || [];

  if (navigation.length === 0) {
    console.warn('Warning: Navigation seems empty or not found in docs.json');
  }

  findGroup(navigation);

  if (!jsTsGroup) {
    console.error('ERROR: Could not find "JS/TS" group in docs.json navigation structure.');
    console.log('Available navigation structure:', JSON.stringify(navigation, null, 2));
    process.exit(1);
  }

  if (!fs.existsSync(TYPESCRIPT_DOCS_PATH)) {
    throw new Error(`Source directory not found: ${TYPESCRIPT_DOCS_PATH}`);
  }

  const files = fs
    .readdirSync(TYPESCRIPT_DOCS_PATH)
    .filter((f) => f.endsWith('.mdx'))
    .sort();

  console.log(`Found ${files.length} documentation files.`);

  const pages = files.map((f) => 'sdk-reference/typescript/' + path.basename(f, '.mdx'));
  jsTsGroup.pages = pages;

  fs.writeFileSync(DOCS_JSON_PATH, JSON.stringify(docsConfig, null, 2) + '\n');
  console.log('Successfully updated docs.json with pages:');
  pages.forEach((p) => console.log(`  - ${p}`));
} catch (error) {
  console.error('ERROR during script execution:');
  console.error(error.stack || error.message);
  process.exit(1);
}
