// Runs the pure-logic checks with Node's built-in TypeScript stripping. Fails on any "FAIL" line.
import { execFileSync } from 'node:child_process';
import { readdirSync } from 'node:fs';

let failed = false;
for (const f of readdirSync(new URL('.', import.meta.url)).filter((n) => n.endsWith('.test.ts'))) {
  const out = execFileSync(process.execPath, ['--experimental-strip-types', '--no-warnings', new URL(f, import.meta.url).pathname], { encoding: 'utf8' });
  process.stdout.write(`# ${f}\n${out}`);
  if (out.includes('FAIL')) failed = true;
}
process.exit(failed ? 1 : 0);
