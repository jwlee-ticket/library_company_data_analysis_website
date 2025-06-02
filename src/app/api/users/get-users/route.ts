import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const response = await fetch(`${process.env.INTERNAL_BACKEND_URL}/users/get-users`)
    const data = await response.json()

    console.log('user data', data)

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ message: 'live-list 데이터를 가져오는데 실패했습니다.' }, { status: 500 })
  }
}
