// app/api/session/route.ts
import { NextResponse } from 'next/server'

import { getSession } from '@/lib/sesson'

export async function GET() {
  const session = await getSession()

  // 반환할 세션 정보 (필요한 정보만 노출)
  return NextResponse.json({
    userId: session.userId,
    name: session.name,
    email: session.email,
    isFileUploader: session.isFileUploader,
    isLiveManager: session.isLiveManager,
    role: session.role
  })
}
