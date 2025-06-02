// app/api/register/create-account/route.ts
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    console.log('request', request)

    // 클라이언트에서 전달된 JSON 데이터를 파싱합니다.
    const body = await request.json()
    const { name, email, password } = body

    // 필수 값 검증 (필요 시 더 추가할 수 있음)
    if (!name || !email || !password) {
      return NextResponse.json({ error: '필수 값이 누락되었습니다.' }, { status: 400 })
    }

    // 내부 백엔드 엔드포인트로 POST 요청을 보냅니다.
    const backendResponse = await fetch(`${process.env.INTERNAL_BACKEND_URL}/users/create-account`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, email, password })
    })

    // 백엔드 요청 실패 시 에러 반환
    if (!backendResponse.ok) {
      const errorText = await backendResponse.text()

      return NextResponse.json(
        { error: '가입에 실패했습니다.\n관리자에게 문의하세요.', details: errorText },
        { status: backendResponse.status }
      )
    }

    // 백엔드 응답 데이터 파싱
    const data = await backendResponse.json()

    return NextResponse.json({ message: '가입신청이 완료되었습니다.\n관리자의 승인을 기다려 주세요.', data })
  } catch (error) {
    console.error('회원가입 에러:', error)

    return NextResponse.json({ error: '서버 에러' }, { status: 500 })
  }
}
