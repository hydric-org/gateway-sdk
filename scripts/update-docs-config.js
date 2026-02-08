/* eslint-disable no-inner-declarations */
const fs = require('fs');
const path = require('path');

const DOCS_JSON_PATH = process.argv[2];
const TYPESCRIPT_DOCS_PATH = process.argv[3];

if (!DOCS_JSON_PATH || !TYPESCRIPT_DOCS_PATH) {
  process.exit(1);
}

try {
  const config = JSON.parse(fs.readFileSync(DOCS_JSON_PATH, 'utf8'));
  const nav = config.navigation || [];

  // 1. Generate the local pages list
  const pages = fs
    .readdirSync(TYPESCRIPT_DOCS_PATH)
    .filter((f) => f.endsWith('.mdx'))
    .sort()
    .map((f) => 'sdk-reference/typescript/' + path.basename(f, '.mdx'));

  const newJsTsGroup = {
    group: 'JS/TS',
    pages: pages,
  };

  // 2. Find and replace or create
  let updated = false;

  function processLevel(items) {
    if (!items || !Array.isArray(items)) return;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      // If we found the existing group, replace it
      if (typeof item === 'object' && item.group === 'JS/TS') {
        items[i] = newJsTsGroup;
        updated = true;
        return;
      }

      // Recurse into pages if they are an array (sub-groups)
      if (item.pages && Array.isArray(item.pages)) {
        processLevel(item.pages);
        if (updated) return;
      }
    }
  }

  processLevel(nav);

  // 3. Fallback: If not found, try to find "SDK Reference" and push there
  if (!updated) {
    for (const item of nav) {
      if (item.group === 'SDK Reference') {
        if (!item.pages) item.pages = [];
        item.pages.push(newJsTsGroup);
        updated = true;
        break;
      }
    }
  }

  // 4. Ultimate fallback: just push to the end of navigation
  if (!updated) {
    nav.push(newJsTsGroup);
  }

  fs.writeFileSync(DOCS_JSON_PATH, JSON.stringify(config, null, 2) + '\n');
  console.log('Successfully updated docs.json with JS/TS group');
} catch (err) {
  console.error('Error:', err.message);
  process.exit(1);
}
