// app/api/live/get-live-detail-data/route.ts (App Router 방식)
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const liveId = searchParams.get('liveId')

  if (!liveId) {
    return NextResponse.json({ error: 'liveId가 전달되지 않았습니다.' }, { status: 400 })
  }

  try {
    // 내부 백엔드 또는 데이터베이스에서 liveId에 해당하는 공연 상세 정보를 가져옵니다.
    const response = await fetch(`${process.env.INTERNAL_BACKEND_URL}/live/get-live-detail-data?liveId=${liveId}`)
    const data = await response.json()

    console.log('라이브 상세 데이터:', data)

    return NextResponse.json(data)
  } catch (error) {
    console.error('라이브 상세 데이터 가져오기 에러:', error)

    return NextResponse.json({ error: '데이터를 가져오는데 실패했습니다.' }, { status: 500 })
  }
}
