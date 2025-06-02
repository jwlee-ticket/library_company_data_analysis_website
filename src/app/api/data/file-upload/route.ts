// app/api/data/file-upload/route.ts

import { NextResponse } from 'next/server'

import { getSession } from '@/lib/sesson'

export async function POST(request: Request) {
  try {
    // 클라이언트에서 전달된 FormData를 파싱합니다.

    const formData = await request.formData()

    const session = await getSession()

    formData.append('userName', session.name ?? 'unknown')

    // 실제 백엔드 엔드포인트로 POST 요청을 보냅니다.

    const backendResponse = await fetch(`${process.env.INTERNAL_BACKEND_URL}/upload/play-excel`, {
      method: 'POST',
      body: formData
    })

    // 백엔드 응답이 실패한 경우 에러 응답 반환

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text()

      return NextResponse.json({ message: '파일 업로드 실패', error: errorText }, { status: backendResponse.status })
    }

    // 응답 본문을 먼저 텍스트로 읽습니다.

    const text = await backendResponse.text()
    let data: any = {}

    if (text) {
      try {
        data = JSON.parse(text)

        console.log('백엔드 응답:', data)

        return NextResponse.json({ message: data.message, data })
      } catch (err) {
        console.error('JSON 파싱 에러:', err)
        data = text
      }
    }

    return NextResponse.json({ message: '파일 업로드 성공', data })
  } catch (error) {
    console.error('파일 업로드 에러:', error)

    return NextResponse.json({ message: '서버 에러' }, { status: 500 })
  }
}
