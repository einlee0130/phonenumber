import { NextResponse } from 'next/server'

export function middleware(request) {
  const auth = request.cookies.get('phonebook_auth')?.value

  if (auth !== 'true') {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/',
    '/((?!login|api/login|_next/static|_next/image|favicon.ico).*)',
  ],
}