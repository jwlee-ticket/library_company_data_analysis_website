// app/api/login/login/route.ts
import { NextResponse } from 'next/server'

import { getSesstionWithOptoin } from '@/lib/sesson'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password, isRemember } = body

    if (!email || !password) {
      return NextResponse.json({ error: 'Email 및 Password는 필수입니다.' }, { status: 400 })
    }

    const backendResponse = await fetch(`${process.env.INTERNAL_BACKEND_URL}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text()

      return NextResponse.json({ error: '로그인 실패', details: errorText }, { status: backendResponse.status })
    }

    const data = await backendResponse.json()

    if (data.code === 200) {
      // isRemember 값에 따라 세션 옵션을 설정합니다.
      const session = await getSesstionWithOptoin(isRemember)

      session.userId = data.userId
      session.name = data.name
      session.email = email
      session.role = data.role
      session.jobList = data.jobList
      session.isFileUploader = data.isFileUploader
      session.isLiveManager = data.isLiveManager
      session.liveNameList = data.liveNameList
      await session.save()

      return NextResponse.json({ message: '로그인 성공', code: 200 })
    } else {
      return NextResponse.json({ error: '로그인 실패\n관리자에게 문의하세요.' }, { status: 400 })
    }
  } catch (error) {
    console.error('로그인 에러:', error)

    return NextResponse.json({ error: '서버 에러' }, { status: 500 })
  }
}
