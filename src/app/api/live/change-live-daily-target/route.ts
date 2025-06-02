import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    // 클라이언트에서 전달된 JSON 데이터를 파싱합니다.
    const body = await request.json()
    const { liveId, targets } = body

    console.log('liveId:', liveId)
    console.log('targets:', targets)

    // 필수 값 검증
    if (!liveId || !targets || !Array.isArray(targets) || targets.length === 0) {
      return NextResponse.json({ error: '필수 값이 누락되었습니다.' }, { status: 400 })
    }

    // 각 타겟 데이터 유효성 검사
    for (const target of targets) {
      if (!target.id || target.target === undefined || !target.date) {
        return NextResponse.json(
          {
            error: '잘못된 타겟 데이터 형식입니다.',
            details: '각 타겟은 id, target, date 필드가 필요합니다.'
          },
          { status: 400 }
        )
      }
    }

    // 내부 백엔드 엔드포인트로 POST 요청을 보냅니다.
    const backendResponse = await fetch(`${process.env.INTERNAL_BACKEND_URL}/target/change-target`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        liveId,
        targets
      })
    })

    // 백엔드 요청이 실패한 경우 에러 반환
    if (!backendResponse.ok) {
      const errorData = await backendResponse.json().catch(() => ({}))

      return NextResponse.json(
        {
          error: '타겟 데이터 저장 요청 실패',
          details: errorData
        },
        { status: backendResponse.status }
      )
    }

    // 백엔드 응답 데이터 파싱
    const data = await backendResponse.json()

    return NextResponse.json({
      status: 200,
      message: '타겟 데이터가 성공적으로 저장되었습니다.',
      data
    })
  } catch (error) {
    console.error('Change target error:', error)

    return NextResponse.json(
      {
        status: 500,
        error: '서버 에러가 발생했습니다. 잠시 후 다시 시도해주세요.'
      },
      { status: 500 }
    )
  }
}
