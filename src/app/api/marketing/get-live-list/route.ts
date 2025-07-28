import { NextResponse } from 'next/server'

import { getSession } from '@/lib/session'

export async function GET() {
  try {
    const session = await getSession()

    // 세션이 없거나 userId가 없으면 401 오류 반환
    if (!session || !session.userId) {
      const response = await fetch(`${process.env.INTERNAL_BACKEND_URL}/upload/live-list?id=${null}`)
      const data = await response.json()

      console.log('data', data)

      return NextResponse.json(data)
    }

    const response = await fetch(`${process.env.INTERNAL_BACKEND_URL}/upload/live-list?id=${session.userId}`)
    const data = await response.json()

    console.log('data', data)

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ message: 'live-list 데이터를 가져오는데 실패했습니다.' }, { status: 500 })
  }
}
