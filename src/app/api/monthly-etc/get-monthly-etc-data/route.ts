import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    // URL에서 year 파라미터 추출
    const { searchParams } = new URL(request.url)
    const year = searchParams.get('year')

    // year 파라미터 검증
    if (!year) {
      return NextResponse.json({ error: '년도(year) 파라미터가 필요합니다.' }, { status: 400 })
    }

    // 백엔드 API에 요청
    const backendResponse = await fetch(
      `${process.env.INTERNAL_BACKEND_URL}/calendar/get-monthly-etc-data?year=${year}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )

    // 백엔드 요청이 실패한 경우 에러 반환
    if (!backendResponse.ok) {
      let errorData = {}

      try {
        errorData = await backendResponse.json()
      } catch (e) {
        // JSON 파싱 실패 시 빈 객체 유지
      }

      return NextResponse.json(
        {
          error: '월간 비고 데이터 가져오기 요청 실패',
          details: errorData
        },
        { status: backendResponse.status }
      )
    }

    // 백엔드 응답 데이터 파싱
    let data

    try {
      const responseText = await backendResponse.text()

      if (responseText) {
        data = JSON.parse(responseText)
      } else {
        data = {}
      }
    } catch (parseError) {
      console.error('JSON 파싱 오류:', parseError)

      return NextResponse.json(
        {
          error: '서버 응답을 처리하는 중 오류가 발생했습니다.',
          details: parseError
        },
        { status: 500 }
      )
    }

    // 클라이언트에 응답
    return NextResponse.json(data)
  } catch (error) {
    console.error('Get monthly etc data error:', error)

    return NextResponse.json(
      {
        code: 500,
        error: '서버 에러가 발생했습니다. 잠시 후 다시 시도해주세요.'
      },
      { status: 500 }
    )
  }
}
