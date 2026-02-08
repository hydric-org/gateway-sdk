import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'tsup';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const constantsPath = path.resolve(__dirname, '../../constants.json');
const constants = JSON.parse(fs.readFileSync(constantsPath, 'utf8'));
const baseApiUrl = constants.BASE_API_URL;

export default defineConfig({
  entry: ['src/index.ts', 'src/types.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  minify: true,
  treeshake: true,
  env: {
    BASE_API_URL: baseApiUrl!,
    DASHBOARD_URL: constants.DASHBOARD_URL!,
  },
});
