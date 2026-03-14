import { NextRequest, NextResponse } from 'next/server';

export function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  return params.then(({ code }) => {
    // Validate code: lowercase alphanumeric, 6–20 chars
    if (!/^[a-z0-9]{6,20}$/.test(code)) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    const response = NextResponse.redirect(new URL('/', request.url));
    response.cookies.set('ref_code', code, {
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
    });
    return response;
  });
}
