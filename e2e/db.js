// Shared DB access for e2e cleanup hooks. server/src/db/pool.js's own
// `dotenv/config` import loads `.env` relative to process.cwd(), which is
// the repo root here (Playwright runs from root, not server/) — so it
// silently loads nothing and the pool ends up with empty credentials.
// This populates process.env from server/.env *before* pool.js is
// evaluated. A static `import { pool } from '../server/src/db/pool.js'`
// wouldn't work here even after this fix: ESM evaluates an imported
// module's whole dependency graph before the importing file's own
// top-level code runs, regardless of where the import statement sits in
// the file — so pool.js would still run first. The dynamic import()
// below is a normal runtime expression, sequenced after the env is set.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '..', 'server', '.env');

// server/.env has mixed CRLF/LF line endings, and JS regex `.` doesn't
// match `\r` — trimming each line first (not just the captured value)
// avoids the match silently failing on the CRLF ones.
for (const rawLine of fs.readFileSync(envPath, 'utf8').split('\n')) {
  const match = rawLine.trim().match(/^([A-Z_]+)=(.*)$/);
  if (match) process.env[match[1]] ??= match[2];
}

const { pool } = await import('../server/src/db/pool.js');
export { pool };
