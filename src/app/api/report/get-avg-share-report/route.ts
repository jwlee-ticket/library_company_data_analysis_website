import { NextResponse } from 'next/server'

export async function GET() {
    try {
        const response = await fetch(`${process.env.INTERNAL_BACKEND_URL}/report/get-avg-share-report`)

        if (!response.ok) {
            const errorData = await response.json()

            
return NextResponse.json({
                status: response.status,
                message: errorData.message || '공연별 주차별 평균 점유율을 불러오는 데 실패했습니다.'
            }, { status: response.status })
        }

        const data = await response.json()

        return NextResponse.json({
            status: 200,
            message: '공연별 주차별 평균 점유율을 성공적으로 불러왔습니다.',
            data
        })
    } catch (error) {
        console.error('공연별 주차별 평균 점유율 API 에러:', error)
        
return NextResponse.json({
            status: 500,
            message: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
        }, { status: 500 })
    }
}
