// app/api/navigation/get-upload-history/route.ts
import { NextResponse } from 'next/server'

export async function GET() {
    try {

        const response = await fetch(`${process.env.INTERNAL_BACKEND_URL}/upload/get-upload-history`)
        const data = await response.json()

        console.log('업로드 히스토리 데이터:', data)


        return NextResponse.json(data)
    } catch (error) {

        console.error('업로드 히스토리를 가져오는데 실패했습니다:', error)


        return NextResponse.json({ message: '업로드 히스토리를 가져오는데 실패했습니다.', uploadHistory: [] }, { status: 500 })
    }
}
