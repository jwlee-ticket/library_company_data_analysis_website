import { cookies } from 'next/headers'

import { getIronSession } from 'iron-session'

interface SessionContent {
  userId?: number
  name?: string
  email?: string
  role?: number
  isFileUploader?: boolean
  isLiveManager?: boolean
  jobList?: number[]
  liveNameList?: number[]
}

function getSessionOptions(isRemember: boolean) {
  return {
    cookieName: 'library-session',
    password: process.env.COOKIE_PASSWORD!,
    cookieOptions: {
      secure: process.env.NODE_ENV === 'production',

      // isRemember가 true이면 30일 동안, 아니면 세션 쿠키(브라우저 종료 시 만료)
      maxAge: isRemember ? 60 * 60 * 24 * 30 : undefined
    }
  }
}

export async function getSesstionWithOptoin(isRemember: boolean) {
  const session = await getIronSession<SessionContent>(await cookies(), getSessionOptions(isRemember))

  return session
}

export async function getSession() {
  return getIronSession<SessionContent>(await cookies(), {
    cookieName: 'library-session',
    password: process.env.COOKIE_PASSWORD!
  })
}
