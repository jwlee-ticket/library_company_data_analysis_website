// app/api/marketing-calendar/route.ts
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const liveName = searchParams.get('liveName')
  const uploadId = searchParams.get('uploadId')

  try {
    const response = await fetch(`${process.env.INTERNAL_BACKEND_URL}/upload/delete-entry?liveName=${liveName}&uploadId=${uploadId}`)
    const data = await response.json()

    console.log('data', data)

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ message: 'live-list 데이터를 가져오는데 실패했습니다.' }, { status: 500 })
  }
}
