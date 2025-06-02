import { NextResponse } from 'next/server'

import { getSession } from '@/lib/sesson'

export async function GET() {
  try {
    const session = await getSession()

    const response = await fetch(`${process.env.INTERNAL_BACKEND_URL}/live/get-live-data?userId=${session.userId}`)
    const data = await response.json()

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ message: 'live-list 데이터를 가져오는데 실패했습니다.' }, { status: 500 })
  }
}
