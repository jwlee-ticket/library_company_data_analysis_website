import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { getSession } from './lib/session'

interface Routes {
  [key: string]: boolean
}

const publicOnlyUrls: Routes = {
  '/login': true,
  '/register': true
}

export async function middleware(request: NextRequest) {
  try {
    console.log('Middleware 실행: ', request.nextUrl.pathname)
    const session = await getSession()

    console.log('세션 정보: ', session)

    const exists = publicOnlyUrls[request.nextUrl.pathname]

    if (!session.userId) {
      if (!exists) {
        return NextResponse.redirect(new URL('/login', request.url))
      }
    } else {
      return NextResponse.next()
    }
  } catch (error) {
    console.error('에러 발생: ', error)

    return NextResponse.error()
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
}
