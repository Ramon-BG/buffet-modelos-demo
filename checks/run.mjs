import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const suites = ['test-draft.mjs', 'test-presentation.mjs', 'test-conversation.mjs', 'test-order-editing.mjs'];
for (const suite of suites) {
  const path = fileURLToPath(new URL(suite, import.meta.url));
  const result = spawnSync(process.execPath, [path], { stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}
console.log('All four suites passed.');
