#!/usr/bin/env node
/**
 * Smoke test script for post-deployment verification.
 * Usage: node scripts/smoke-test.js [BASE_URL]
 * Default BASE_URL: https://thewebsite.app
 */

const BASE_URL = process.argv[2] || process.env.SMOKE_TEST_URL || 'https://thewebsite.app';

const ROUTES = [
  { path: '/', name: 'Homepage' },
  { path: '/course', name: 'Course landing' },
  { path: '/blog', name: 'Blog index' },
  { path: '/pricing', name: 'Pricing' },
  { path: '/faq', name: 'FAQ' },
];

async function checkRoute({ path, name }) {
  const url = `${BASE_URL}${path}`;
  try {
    const res = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(10000) });
    const ok = res.status >= 200 && res.status < 400;
    const symbol = ok ? 'PASS' : 'FAIL';
    console.log(`[${symbol}] ${name} (${path}) — HTTP ${res.status}`);
    return ok;
  } catch (err) {
    console.log(`[FAIL] ${name} (${path}) — ${err.message}`);
    return false;
  }
}

async function main() {
  console.log(`\nSmoke tests against: ${BASE_URL}\n`);
  const results = await Promise.all(ROUTES.map(checkRoute));
  const passed = results.filter(Boolean).length;
  const total = results.length;
  console.log(`\n${passed}/${total} checks passed`);
  if (passed < total) {
    console.error(`\nSmoke test FAILED: ${total - passed} route(s) unreachable`);
    process.exit(1);
  }
  console.log('\nSmoke test PASSED');
}

main();
