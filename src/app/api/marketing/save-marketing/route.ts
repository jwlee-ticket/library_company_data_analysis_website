// app/api/marketing/change-marketing/route.ts
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    // 클라이언트에서 전달된 JSON 데이터를 파싱합니다.
    const body = await request.json()
    const { liveName, date, noteSales, noteMarketing, noteOthers } = body

    // 필수 값 검증 (필요 시)
    if (!liveName || !date) {
      return NextResponse.json({ error: '필수 값이 누락되었습니다.' }, { status: 400 })
    }

    // 내부 백엔드 엔드포인트로 POST 요청을 보냅니다.
    const backendResponse = await fetch(`${process.env.INTERNAL_BACKEND_URL}/calendar/save-marketing-data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ liveName, date, noteSales, noteMarketing, noteOthers })
    })

    // 백엔드 요청이 실패한 경우 에러 반환
    if (!backendResponse.ok) {
      return NextResponse.json({ error: '백엔드 수정 요청 실패' }, { status: backendResponse.status })
    }

    // 백엔드 응답 데이터 파싱
    const data = await backendResponse.json()

    return NextResponse.json({ message: '수정 성공', data })
  } catch (error) {
    console.error('Change marketing error:', error)

    return NextResponse.json({ error: '서버 에러' }, { status: 500 })
  }
}
