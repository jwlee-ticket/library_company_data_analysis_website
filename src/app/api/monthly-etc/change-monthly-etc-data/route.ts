import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    // 클라이언트에서 전달된 JSON 데이터를 파싱합니다.
    const body = await request.json()
    const { monthlyEtcData } = body

    console.log('monthlyEtcData:', monthlyEtcData)

    // 필수 값 검증
    if (!monthlyEtcData || !Array.isArray(monthlyEtcData) || monthlyEtcData.length === 0) {
      return NextResponse.json({ error: '필수 값이 누락되었습니다.' }, { status: 400 })
    }

    // 각 항목 데이터 유효성 검사
    for (const item of monthlyEtcData) {
      if (!item.id || item.etc === undefined) {
        return NextResponse.json(
          {
            error: '잘못된 데이터 형식입니다.',
            details: '각 항목은 id와 etc 필드가 필요합니다.'
          },
          { status: 400 }
        )
      }
    }

    // 내부 백엔드 엔드포인트로 POST 요청을 보냅니다.
    const backendResponse = await fetch(`${process.env.INTERNAL_BACKEND_URL}/calendar/change-monthly-etc-data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        monthlyEtcData
      })
    })

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
          error: '월간 비고 데이터 저장 요청 실패',
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
    return NextResponse.json({
      code: 200,
      message: '월간 비고 데이터가 성공적으로 저장되었습니다.',
      data
    })
  } catch (error) {
    console.error('Change monthly etc data error:', error)

    return NextResponse.json(
      {
        code: 500,
        error: '서버 에러가 발생했습니다. 잠시 후 다시 시도해주세요.'
      },
      { status: 500 }
    )
  }
}
