const { createClient } = require('@libsql/client');
const client = createClient({
  url: process.env.TURSO_DATABASE_URL || 'file:data/waitlist.db',
  authToken: process.env.TURSO_AUTH_TOKEN,
});

(async () => {
  const result = await client.execute('SELECT email FROM waitlist ORDER BY created_at ASC');
  const all = result.rows.map(r => r.email);
  const succeeded = ['horia.webdev@gmail.com', 'nalin.mittal@gmail.com', 'mhnaravind999@gmail.com', 'jyo.dey@duck.com', 'slowpacedstroll@gmail.com'];
  const failed = all.filter(e => !succeeded.includes(e));

  console.log('Total waitlist:', all.length);
  console.log('\nSucceeded (5):');
  succeeded.forEach(e => console.log('  ✓', e));
  console.log('\nFailed (' + failed.length + '):');
  failed.forEach(e => console.log('  ✗', e));
})();
