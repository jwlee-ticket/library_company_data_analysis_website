'use client'
import { useState, useRef } from 'react'

import { Button, Card, CardContent, IconButton, Tooltip, Collapse } from '@mui/material'
import { format } from 'date-fns'
import { ArrowDownTrayIcon } from '@heroicons/react/24/solid'

import LiveDropdown from '@/components/layout/shared/liveDropdown'

export default function DataUpload() {
  const [entryData, setEntryData] = useState<any[]>([])
  const [deletedEntryData, setDeletedEntryData] = useState<any[]>([])
  const [selectedPerformance, setSelectedPerformance] = useState<string>('공연 선택하기')
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [showDeletedUploads, setShowDeletedUploads] = useState(false) // 과거 업로드 내역 토글

  // 다운로드 핸들러 함수 추가
  const handleDownload = (uploadId: number) => {
    try {
      // 다운로드 URL로 새 창 열기

      window.open(`/api/data/download-file?id=${uploadId}`, '_blank')
    } catch (error) {
      console.error('다운로드 오류:', error)
    }
  }

  // 파일 input에 접근하기 위한 ref
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  // 공연 선택 후 해당 공연의 업로드 데이터를 가져오는 함수
  const handleLiveSelection = async (liveName: string) => {
    setSelectedPerformance(liveName)

    try {
      console.log('handleLiveSelection', liveName)
      const response = await fetch(`/api/data/get-upload-entry?liveName=${liveName}`)
      const data = await response.json()

      setEntryData(data.activeUploads)
      setDeletedEntryData(data.deletedUploads)
      console.log('handleLiveSelection', data)
    } catch (error) {
      console.error('데이터 가져오기 실패:', error)
    }
  }

  // 파일 선택 핸들러
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0])
    }
  }

  // 파일 업로드 핸들러 (POST 요청: /api/data/file-upload/route.ts)
  const handleUpload = async () => {
    if (!file) {
      alert('업로드할 파일을 선택해주세요.')

      return
    }

    const formData = new FormData()

    formData.append('file', file)
    formData.append('liveName', selectedPerformance)

    setLoading(true)

    try {
      const response = await fetch(`/api/data/file-upload`, {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const data = await response.json()

        alert(data.message || '파일 업로드 성공!')

        // 파일 업로드 후 파일 input 초기화
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }

        setFile(null)

        // 업로드 후 데이터를 새로 불러옵니다.
        handleLiveSelection(selectedPerformance)
      } else {
        alert('파일 업로드 실패.')
      }
    } catch (error) {
      console.error('파일 업로드 중 오류 발생:', error)
      alert('파일 업로드 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='flex flex-col items-start justify-start h-full gap-10 w-full'>
      <h1>데이터 입력</h1>

      <div className='flex items-center gap-2 px-2 py-1 bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white font-medium shadow-md rounded-full transition-all duration-200'>
        <LiveDropdown onLiveSelect={handleLiveSelection} />
      </div>

      {/* 파일 선택 및 업로드 영역 (공연 선택 후에만 표시) */}
      {selectedPerformance !== '공연 선택하기' && (
        <div className='w-full flex justify-end gap-2'>
          {/* 숨겨진 파일 선택 input */}
          <input
            type='file'
            accept='.xlsx, .xls'
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          {/* 파일 선택 버튼 */}
          <Button
            variant='outlined'
            className='text-gray-300 border-gray-300'
            onClick={() => fileInputRef.current?.click()}
          >
            파일 선택
          </Button>
          {/* 업로드 버튼 */}
          <Button variant='contained' color='primary' onClick={handleUpload} disabled={loading || !file}>
            {loading ? '업로드 중...' : '업로드'}
          </Button>
        </div>
      )}

      {/* 업로드된 데이터 표시 영역 */}
      {selectedPerformance !== '공연 선택하기' && (
        <Card className='overflow-x-auto shadow-md rounded-lg border border-gray-200 w-full'>
          <CardContent>
            <div className='overflow-x-auto w-full'>
              <h2 className='text-lg font-medium pb-5 text-center text-white'>업로드된 파일 목록</h2>
              <table className='min-w-full table-auto'>
                <thead className='text-white bg-gray-800'>
                  <tr>
                    <th className='min-w-[100px] px-4 py-3 text-center text-sm font-medium'>기준일자</th>
                    <th className='min-w-[450px] px-4 py-3 text-center text-sm font-medium'>파일이름</th>
                    <th className='min-w-[100px] max-w-[100px] px-4 py-3 text-center text-sm font-medium'>
                      업로드 일자
                    </th>
                    <th className='min-w-[100px] max-w-[100px] px-4 py-3 text-center text-sm font-medium'>
                      업로드 시간
                    </th>
                    <th className='min-w-[100px] max-w-[100px] px-4 py-3 text-center text-sm font-medium'>
                      업로드 계정
                    </th>
                    <th className='min-w-[100px] max-w-[100px] px-4 py-3 text-center text-sm font-medium'>다운로드</th>
                  </tr>
                </thead>
                <tbody className='text-sm text-white'>
                  {entryData.length > 0 ? (
                    entryData.map((item, index) => (
                      <tr key={index}>
                        <td className='min-w-[100px] max-w-[100px] px-4 py-3 overflow-x-auto whitespace-nowrap text-center'>
                          {format(new Date(item.recordDate), 'yyyy-MM-dd')}
                        </td>
                        <td className='min-w-[450px] px-4 py-3 overflow-x-auto text-center'>{item.fileName}</td>
                        <td className='min-w-[100px] max-w-[100px] px-4 py-3 overflow-x-auto whitespace-nowrap text-center'>
                          {format(new Date(item.uploadDate), 'yyyy-MM-dd')}
                        </td>
                        <td className='min-w-[100px] max-w-[100px] px-4 py-3 overflow-x-auto whitespace-nowrap text-center'>
                          {format(new Date(item.uploadDate), 'HH:mm')}
                        </td>
                        <td className='min-w-[100px] max-w-[100px] px-4 py-3 overflow-x-auto text-center'>
                          {item.uploadBy}
                        </td>
                        {item.isSavedFile === true ? (
                          <td className='min-w-[100px] max-w-[100px] py-3'>
                            <div className='flex w-full justify-center items-center'>
                              <Tooltip title='다운로드'>
                                <IconButton onClick={() => handleDownload(item.id)}>
                                  <ArrowDownTrayIcon className='h-6 w-6 text-blue-600' />
                                </IconButton>
                              </Tooltip>
                            </div>
                          </td>
                        ) : null}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className='px-4 py-3 text-center text-gray-500'>
                        업로드 정보가 없습니다.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 과거 업로드된 파일 목록 토글 버튼 */}
      {selectedPerformance !== '공연 선택하기' && (
        <div className='w-full flex justify-end'>
          <Button variant='outlined' color='primary' onClick={() => setShowDeletedUploads(prev => !prev)}>
            {showDeletedUploads ? '숨기기' : '과거 업로드 내역 보기'}
          </Button>
        </div>
      )}

      {/* 과거 업로드된 파일 목록 카드 (Collapse 적용) */}
      {selectedPerformance !== '공연 선택하기' && (
        <div className='flex flex-col items-start justify-start gap-10 w-full '>
          <Collapse in={showDeletedUploads} timeout='auto' unmountOnExit className='w-full'>
            <Card className='overflow-x-auto shadow-md rounded-lg border border-gray-200 w-full mt-4'>
              <CardContent>
                <div className='overflow-x-auto w-full'>
                  <table className='min-w-full table-auto'>
                    <thead className='text-white bg-gray-800'>
                      <tr>
                        <th className='min-w-[100px] px-4 py-3 text-center text-sm font-medium'>기준일자</th>
                        <th className='min-w-[450px] px-4 py-3 text-center text-sm font-medium'>파일이름</th>
                        <th className='min-w-[100px] max-w-[100px] px-4 py-3 text-center text-sm font-medium'>
                          업로드 일자
                        </th>
                        <th className='min-w-[100px] max-w-[100px] px-4 py-3 text-center text-sm font-medium'>
                          업로드 시간
                        </th>
                        <th className='min-w-[100px] max-w-[100px] px-4 py-3 text-center text-sm font-medium'>
                          업로드 계정
                        </th>
                      </tr>
                    </thead>
                    <tbody className='text-sm text-white'>
                      {deletedEntryData.length > 0 ? (
                        deletedEntryData.map((item, index) => (
                          <tr key={index}>
                            <td className='min-w-[100px] max-w-[100px] px-4 py-3 overflow-x-auto whitespace-nowrap text-center'>
                              {format(new Date(item.recordDate), 'yyyy-MM-dd')}
                            </td>
                            <td className='min-w-[450px] px-4 py-3 overflow-x-auto text-center'>{item.fileName}</td>
                            <td className='min-w-[100px] max-w-[100px] px-4 py-3 overflow-x-auto whitespace-nowrap text-center'>
                              {format(new Date(item.uploadDate), 'yyyy-MM-dd')}
                            </td>
                            <td className='min-w-[100px] max-w-[100px] px-4 py-3 overflow-x-auto whitespace-nowrap text-center'>
                              {format(new Date(item.uploadDate), 'HH:mm')}
                            </td>
                            <td className='min-w-[100px] max-w-[100px] px-4 py-3 overflow-x-auto text-center'>
                              {item.uploadBy}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className='px-4 py-3 text-center text-gray-500'>
                            업로드 정보가 없습니다.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </Collapse>
        </div>
      )}
    </div>
  )
}
