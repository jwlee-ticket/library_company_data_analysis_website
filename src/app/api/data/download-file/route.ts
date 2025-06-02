// app/api/download/[id]/route.ts
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    console.log('다운로드 요청 ID:', id)

    // 백엔드 API에서 파일 다운로드 요청
    const response = await fetch(`${process.env.INTERNAL_BACKEND_URL}/upload/download?id=${id}`, {
      method: 'GET'
    })

    if (!response.ok) {
      const errorData = await response.json()

      return NextResponse.json({ error: errorData.message || 'Failed to download file' }, { status: response.status })
    }

    const fileBuffer = await response.arrayBuffer()
    const contentType = response.headers.get('content-type') || 'application/octet-stream'
    const contentDisposition = response.headers.get('content-disposition') || ''

    let filename = 'download.xlsx'
    const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/)

    if (filenameMatch && filenameMatch[1]) {
      filename = filenameMatch[1]
    }

    const nextResponse = new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    })

    return nextResponse
  } catch (error) {
    console.error('Download error:', error)

    return NextResponse.json({ error: 'Internal server error during file download' }, { status: 500 })
  }
}
