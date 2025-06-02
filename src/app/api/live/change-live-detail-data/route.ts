import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    // 클라이언트에서 전달된 JSON 데이터를 파싱합니다.
    const body = await request.json()
    const { perLiveId, updatedData } = body

    console.log('perLiveId:', perLiveId)
    console.log('updatedData:', updatedData)

    // 필수 값 검증
    if (!perLiveId || !updatedData) {
      return NextResponse.json({ error: '필수 값이 누락되었습니다.' }, { status: 400 })
    }

    // 유효한 데이터 필드만 추출
    const {
      liveId,
      liveName,
      category,
      isLive,
      location,
      slackWebhookUrl,
      showStartDate,
      showEndDate,
      saleStartDate,
      saleEndDate,
      runningTime,
      targetShare,
      bep,
      previewEndingDate,
      showTotalSeatNumber,
      concertDateTime,
      concertSeatNumberR,
      concertSeatNumberS,
      concertSeatNumberA,
      concertSeatNumberB,
      concertSeatNumberVip,
    } = updatedData

    // 필수 필드 검증 (비즈니스 로직에 따라 조정 가능)
    if (!liveName || !showStartDate || !showEndDate) {
      return NextResponse.json({ error: '필수 공연 정보가 누락되었습니다.' }, { status: 400 })
    }

    // 내부 백엔드 엔드포인트로 POST 요청을 보냅니다.
    const backendResponse = await fetch(`${process.env.INTERNAL_BACKEND_URL}/live/change-live-detail-data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        perLiveId,
        liveId,
        liveName,
        category,
        isLive,
        location,
        slackWebhookUrl,
        showStartDate,
        showEndDate,
        saleStartDate,
        saleEndDate,
        runningTime,
        targetShare,
        bep,
        previewEndingDate,
        showTotalSeatNumber,
        concertDateTime,
        concertSeatNumberR,
        concertSeatNumberS,
        concertSeatNumberA,
        concertSeatNumberB,
        concertSeatNumberVip,
      })
    })

    // 백엔드 요청이 실패한 경우 에러 반환
    if (!backendResponse.ok) {
      const errorData = await backendResponse.json().catch(() => ({}))

      return NextResponse.json(
        {
          error: '공연 정보 저장 요청 실패',
          details: errorData
        },
        { status: backendResponse.status }
      )
    }

    // 백엔드 응답 데이터 파싱
    const data = await backendResponse.json()

    console.log('Change live detail data:', data)

    return NextResponse.json({
      status: 200,
      message: '공연 정보가 성공적으로 저장되었습니다.',
      data
    })
  } catch (error) {
    console.error('Change live detail error:', error)

    return NextResponse.json(
      {
        status: 500,
        error: '서버 에러가 발생했습니다. 잠시 후 다시 시도해주세요.'
      },
      { status: 500 }
    )
  }
}
