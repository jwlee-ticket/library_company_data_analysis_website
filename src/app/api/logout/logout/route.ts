// app/api/login/logout/route.ts
import { NextResponse } from 'next/server'

import { getSession } from '@/lib/sesson'

export async function POST() {
  try {
    const session = await getSession()

    session.destroy() // 세션 삭제

    return NextResponse.json({ message: '로그아웃 성공' })
  } catch (error) {
    console.error('로그아웃 에러:', error)

    return NextResponse.json({ error: '서버 에러' }, { status: 500 })
  }
}
