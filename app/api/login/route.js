import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { password } = await request.json()

    if (!password) {
      return NextResponse.json(
        { error: '비밀번호를 입력해주세요.' },
        { status: 400 }
      )
    }

    if (password !== process.env.PHONEBOOK_PASSWORD) {
      return NextResponse.json(
        { error: '비밀번호가 틀렸습니다.' },
        { status: 401 }
      )
    }

    const response = NextResponse.json({ success: true })

    response.cookies.set('phonebook_auth', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    })

    return response
  } catch {
    return NextResponse.json(
      { error: '로그인에 실패했습니다.' },
      { status: 500 }
    )
  }
}