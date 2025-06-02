// app/api/marketing-calendar/route.ts
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const liveName = searchParams.get('liveName')

  try {
    const response = await fetch(`${process.env.INTERNAL_BACKEND_URL}/calendar/marketing-calendar?liveName=${liveName}`)
    const data = await response.json()

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ message: 'marketing-calendar 데이터를 가져오는데 실패했습니다.' }, { status: 500 })
  }
}
