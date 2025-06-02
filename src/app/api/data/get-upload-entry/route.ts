// app/api/data/get-upload-entry.ts
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const liveName = searchParams.get('liveName')

  console.log('api liveName', liveName)

  try {
    const response = await fetch(`${process.env.INTERNAL_BACKEND_URL}/upload/upload-entry?liveName=${liveName}`)
    const data = await response.json()

    console.log('data', data)

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ message: 'upload-entry 데이터를 가져오는데 실패했습니다.' }, { status: 500 })
  }
}
