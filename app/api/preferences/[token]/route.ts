import { NextRequest, NextResponse } from 'next/server';
import {
  getPreferencesByToken,
  updatePreferencesByToken,
  unsubscribeAllByToken,
} from '@/lib/email-preferences';

type Params = { params: Promise<{ token: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const { token } = await params;

  if (!token) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
  }

  const prefs = await getPreferencesByToken(token);
  if (!prefs) {
    return NextResponse.json({ error: 'Token not found' }, { status: 404 });
  }

  return NextResponse.json({
    email: prefs.user_email,
    course_updates: prefs.course_updates,
    marketing: prefs.marketing,
    digest: prefs.digest,
    unsubscribed_at: prefs.unsubscribed_at,
  });
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const { token } = await params;

  if (!token) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
  }

  const prefs = await getPreferencesByToken(token);
  if (!prefs) {
    return NextResponse.json({ error: 'Token not found' }, { status: 404 });
  }

  const body = await request.json();

  // Unsubscribe from all
  if (body.unsubscribe_all === true) {
    await unsubscribeAllByToken(token);
    return NextResponse.json({ success: true, message: 'Unsubscribed from all emails' });
  }

  // Update specific preferences
  const updates: { course_updates?: boolean; marketing?: boolean; digest?: boolean } = {};
  if (typeof body.course_updates === 'boolean') updates.course_updates = body.course_updates;
  if (typeof body.marketing === 'boolean') updates.marketing = body.marketing;
  if (typeof body.digest === 'boolean') updates.digest = body.digest;

  await updatePreferencesByToken(token, updates);
  return NextResponse.json({ success: true, message: 'Preferences updated' });
}
