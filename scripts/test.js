// Runs a test suite and saves the report of every run in test-results/.
// Usage: node scripts/test.js offline|live|all   (or npm test / npm run test:live / npm run test:all)
//
// Writes:
//   test-results/<timestamp>-<suite>.txt   full report of this run
//   test-results/latest-<suite>.txt        copy of the most recent run
//   test-results/HISTORY.md                one line per run (date, suite, pass/fail/skip)

import { spawnSync } from 'node:child_process';
import { appendFileSync, copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const SUITES = {
  offline: ['tests/offline/**/*.test.js'],
  live: ['tests/live/**/*.test.js'],
  all: ['tests/offline/**/*.test.js', 'tests/live/**/*.test.js'],
};

const suite = process.argv[2] ?? 'offline';
if (!SUITES[suite]) {
  console.error(`Unknown suite "${suite}". Use: ${Object.keys(SUITES).join(', ')}`);
  process.exit(2);
}

mkdirSync('test-results', { recursive: true });
const stamp = new Date().toISOString().replace(/:/g, '-').slice(0, 19);
const report = `test-results/${stamp}-${suite}.txt`;

const result = spawnSync(process.execPath, [
  '--test',
  '--test-concurrency=1', // live tests share one HubSpot account; run files one at a time
  '--test-reporter=spec', '--test-reporter-destination=stdout',
  '--test-reporter=spec', `--test-reporter-destination=${report}`,
  ...SUITES[suite],
], { stdio: 'inherit' });

copyFileSync(report, `test-results/latest-${suite}.txt`);

// The spec reporter ends with lines like "ℹ pass 12"; pull the counts out for the history
const text = readFileSync(report, 'utf8');
const count = (name) => text.match(new RegExp(`${name} (\\d+)`))?.[1] ?? '?';
const history = 'test-results/HISTORY.md';
if (!existsSync(history)) {
  writeFileSync(history, '# Test run history\n\n| When (UTC) | Suite | Pass | Fail | Skipped | Report |\n|---|---|---|---|---|---|\n');
}
appendFileSync(history,
  `| ${stamp.replace('T', ' ')} | ${suite} | ${count('pass')} | ${count('fail')} | ${count('skipped')} | [${report.slice(13)}](${report.slice(13)}) |\n`);

console.log(`\nReport saved: ${report}  (history: ${history})`);
process.exit(result.status ?? 1);
