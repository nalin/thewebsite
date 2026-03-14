import { NextRequest, NextResponse } from 'next/server';
import { getReferralStatsByToken } from '@/lib/referrals';

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');

  if (!token) {
    return NextResponse.json({ error: 'token required' }, { status: 400 });
  }

  try {
    const stats = await getReferralStatsByToken(token);
    if (!stats) {
      return NextResponse.json({ error: 'not found' }, { status: 404 });
    }
    return NextResponse.json(stats);
  } catch (err) {
    console.error('Referral stats error:', err);
    return NextResponse.json({ error: 'internal error' }, { status: 500 });
  }
}
