import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    // 클라이언트에서 전달된 JSON 데이터를 파싱합니다.
    const body = await request.json()
    const { liveId, marketingData } = body

    console.log('liveId:', liveId)
    console.log('marketingData:', marketingData)

    // 필수 값 검증
    if (!liveId || !marketingData || !Array.isArray(marketingData) || marketingData.length === 0) {
      return NextResponse.json({ error: '필수 값이 누락되었습니다.' }, { status: 400 })
    }

    // 각 마케팅 데이터 유효성 검사
    for (const item of marketingData) {
      if (!item.id || item.salesMarketing === undefined || item.promotion === undefined || item.etc === undefined) {
        return NextResponse.json(
          {
            error: '잘못된 마케팅 데이터 형식입니다.',
            details: '각 마케팅 데이터는 id, salesMarketing, promotion, etc 필드가 필요합니다.'
          },
          { status: 400 }
        )
      }
    }

    // 내부 백엔드 엔드포인트로 POST 요청을 보냅니다.
    const backendResponse = await fetch(`${process.env.INTERNAL_BACKEND_URL}/marketing/set-marketing-data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        marketingData
      })
    })

    // 백엔드 요청이 실패한 경우 에러 반환
    if (!backendResponse.ok) {
      const errorData = await backendResponse.json().catch(() => ({}))

      return NextResponse.json(
        {
          error: '마케팅 데이터 저장 요청 실패',
          details: errorData
        },
        { status: backendResponse.status }
      )
    }

    // 백엔드 응답 데이터 파싱
    let data = {}

    try {
      const responseText = await backendResponse.text()

      console.log('Backend response:', responseText)

      if (responseText) {
        data = JSON.parse(responseText)
      }
    } catch (parseError) {
      console.error('JSON 파싱 오류:', parseError)

      return NextResponse.json(
        {
          status: 500,
          error: '서버 응답을 처리하는 중 오류가 발생했습니다.'
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      status: 200,
      message: '마케팅 데이터가 성공적으로 저장되었습니다.',
      data
    })
  } catch (error) {
    console.error('Change marketing data error:', error)

    return NextResponse.json(
      {
        status: 500,
        error: '서버 에러가 발생했습니다. 잠시 후 다시 시도해주세요.'
      },
      { status: 500 }
    )
  }
}
