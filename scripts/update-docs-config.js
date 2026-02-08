/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs');
const path = require('path');

const DOCS_JSON_PATH = process.argv[2];
const TYPESCRIPT_DOCS_PATH = process.argv[3];

if (!DOCS_JSON_PATH || !TYPESCRIPT_DOCS_PATH) {
  process.exit(1);
}

let jsTsGroup = null;

function findGroup(items) {
  if (!items) return;
  for (const item of items) {
    if (item.group === 'JS/TS') {
      jsTsGroup = item;
      return;
    }
    if (item.pages && Array.isArray(item.pages)) {
      for (const subItem of item.pages) {
        if (typeof subItem === 'object' && subItem.group === 'JS/TS') {
          jsTsGroup = subItem;
          return;
        }
      }
      findGroup(item.pages.filter((p) => typeof p === 'object'));
      if (jsTsGroup) return;
    }
  }
}

try {
  const docsConfig = JSON.parse(fs.readFileSync(DOCS_JSON_PATH, 'utf8'));
  const navigation = docsConfig.navigation || docsConfig.tabs || [];
  findGroup(navigation);

  if (!jsTsGroup) {
    process.exit(1);
  }

  const files = fs
    .readdirSync(TYPESCRIPT_DOCS_PATH)
    .filter((f) => f.endsWith('.mdx'))
    .sort();

  const pages = files.map((f) => 'sdk-reference/typescript/' + path.basename(f, '.mdx'));
  jsTsGroup.pages = pages;

  fs.writeFileSync(DOCS_JSON_PATH, JSON.stringify(docsConfig, null, 2) + '\n');
  console.log('Success');
} catch (error) {
  process.exit(1);
}
