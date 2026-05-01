import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join } from 'node:path';
import { execSync } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '..');
const nodeModules = join(repoRoot, 'node_modules');

const ownPkg = JSON.parse(readFileSync(join(repoRoot, 'package.json'), 'utf8'));
const ownId = `${ownPkg.name}@${ownPkg.version}`;

const raw = execSync(
  `npx --yes license-checker --production --json --excludePackages "${ownId}"`,
  { cwd: repoRoot, encoding: 'utf8', maxBuffer: 50 * 1024 * 1024 }
);
const data = JSON.parse(raw);

const licenseFileNames = ['LICENSE', 'LICENSE.md', 'LICENSE.txt', 'LICENCE', 'LICENCE.md', 'license', 'license.md'];

function findLicenseText(pkgPath) {
  if (!pkgPath || !existsSync(pkgPath)) return null;
  for (const name of licenseFileNames) {
    const p = join(pkgPath, name);
    if (existsSync(p)) {
      try {
        return readFileSync(p, 'utf8').trim();
      } catch { /* ignore */ }
    }
  }
  const entries = readdirSync(pkgPath);
  const match = entries.find((f) => /^licen[cs]e/i.test(f));
  if (match) {
    try {
      return readFileSync(join(pkgPath, match), 'utf8').trim();
    } catch { /* ignore */ }
  }
  return null;
}

const entries = Object.entries(data)
  .map(([id, info]) => {
    const at = id.lastIndexOf('@');
    const name = id.slice(0, at);
    const version = id.slice(at + 1);
    const text = findLicenseText(info.path) ?? info.licenseText ?? '(license text not found)';
    return {
      name,
      version,
      license: info.licenses ?? 'UNKNOWN',
      publisher: info.publisher,
      repository: info.repository,
      text,
    };
  })
  .sort((a, b) => a.name.localeCompare(b.name));

const summary = entries.reduce((acc, e) => {
  acc[e.license] = (acc[e.license] ?? 0) + 1;
  return acc;
}, {});

let out = '';
out += '# Third-Party Notices\n\n';
out += 'Race Analyzer は以下のオープンソースソフトウェアを利用しています。各ライブラリの著作権はそれぞれの著作権者に帰属し、それぞれのライセンス条項に従って利用しています。\n\n';
out += `このファイルは \`scripts/generate-notices.mjs\` により自動生成されています（生成元: 本番依存 ${entries.length} パッケージ）。再生成は \`npm run notices\` で実行できます。\n\n`;
out += '## ライセンス内訳\n\n';
for (const [lic, count] of Object.entries(summary).sort((a, b) => b[1] - a[1])) {
  out += `- **${lic}**: ${count}\n`;
}
out += '\n---\n\n';

for (const e of entries) {
  out += `## ${e.name}@${e.version}\n\n`;
  out += `- **License**: ${e.license}\n`;
  if (e.publisher) out += `- **Publisher**: ${e.publisher}\n`;
  if (e.repository) out += `- **Repository**: ${e.repository}\n`;
  out += '\n';
  out += '```\n';
  out += e.text + '\n';
  out += '```\n\n';
}

writeFileSync(join(repoRoot, 'THIRD_PARTY_NOTICES.md'), out);
console.log(`Wrote THIRD_PARTY_NOTICES.md (${entries.length} packages, ${out.length} chars)`);
