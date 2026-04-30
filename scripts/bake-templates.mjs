import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '..');
const srcDir = 'C:/Users/nakat/projects/race-analyzer-メモ/プロンプトテンプレ';

const stages = ['stage1', 'stage2', 'stage3'];

for (const s of stages) {
  const txt = readFileSync(`${srcDir}/${s}.txt`, 'utf8');
  // Defensive escape (verified upstream that none of these patterns occur):
  const escaped = txt
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\$\{/g, '\\${');
  const varName = `${s}Template`;
  const out = `export const ${varName} = \`${escaped}\`;\n`;
  writeFileSync(`${repoRoot}/src/templates/${s}.ts`, out);
  console.log(`wrote ${s}: ${txt.length} chars`);
}
