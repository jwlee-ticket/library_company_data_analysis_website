// app/api/marketing-calendar/route.ts
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  try {
    const response = await fetch(`${process.env.INTERNAL_BACKEND_URL}/users/delete-user?id=${id}`)
    const data = await response.json()

    console.log('data', data)

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ message: '계정 삭제를 실패했습니다.' }, { status: 500 })
  }
}
