// app/api/users/edit-user/route.ts
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    // 클라이언트에서 전달된 JSON 데이터를 파싱
    const body = await request.json()
    const { id, name, email, role, password, status, isLiveManager, isFileUploader, liveNameList } = body

    // 필수 값 검증 (필요에 따라 추가 검증 가능)
    if (!id || !name || !email || !password) {
      return NextResponse.json({ error: '필수 값이 누락되었습니다.' }, { status: 400 })
    }

    // 내부 백엔드 엔드포인트로 POST 요청 전송
    const backendResponse = await fetch(`${process.env.INTERNAL_BACKEND_URL}/users/edit-user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, name, email, role, password, status, isLiveManager, isFileUploader, liveNameList })
    })

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text()

      return NextResponse.json({ error: '백엔드 요청 실패', details: errorText }, { status: backendResponse.status })
    }

    const data = await backendResponse.json()

    // 백엔드에서 code 200을 반환한다고 가정합니다.
    return NextResponse.json({ message: '수정 성공', data, code: 200 })
  } catch (error) {
    console.error('Edit user error:', error)

    return NextResponse.json({ error: '서버 에러' }, { status: 500 })
  }
}
