import { NextRequest } from 'next/server';

// Fail closed: if CRON_SECRET is not configured, no request is authorized.
// Vercel's cron scheduler sends `Authorization: Bearer ${CRON_SECRET}`
// automatically when the env var is set on the project.
export function isAuthorizedCron(request: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    console.error('[CRON AUTH] CRON_SECRET is not set; rejecting request');
    return false;
  }
  return request.headers.get('authorization') === `Bearer ${cronSecret}`;
}
