'use client'

import { useEffect, useState } from 'react'

import { useRouter } from 'next/navigation'

import { format } from 'date-fns'
import {
  Button,
  Card,
  CardContent,
  CircularProgress,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  TextField,
  Tooltip
} from '@mui/material'
import { DocumentMagnifyingGlassIcon } from '@heroicons/react/24/solid'

// 세션 타입 정의
type SessionType = {
  role?: number
} | null

const LivePage = () => {
  const [liveData, setLiveData] = useState<any[]>([])
  const [finishedLiveData, setFinishedLiveData] = useState<any[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [showDeletedUploads, setShowDeletedUploads] = useState(false)
  const [managerList, setManagerList] = useState<any[]>([])
  const [session, setSession] = useState<SessionType>(null)

  // 새 공연 등록 모달 상태
  const [newLiveModalOpen, setNewLiveModalOpen] = useState(false)

  const [newLiveData, setNewLiveData] = useState({
    liveId: '',
    liveName: '',
    category: '',
    showStartDate: '',
    showEndDate: '',
    manager: ''
  })

  const router = useRouter()

  // 공연 선택 후 해당 공연의 마케팅 데이터를 가져오는 함수
  const handleLiveSelection = async () => {
    try {
      setLoading(true)

      const response = await fetch(`/api/live/get-live-data`)
      const data = await response.json()

      setLiveData(data.liveInfoList) // 응답 데이터를 상태에 저장
      setFinishedLiveData(data.finishedLiveLive) // 완료된 공연 데이터를 상태에 저장

      const res = await fetch('/api/session')
      const sessionData = await res.json()

      setSession(sessionData)
    } catch (error) {
      console.error('데이터 가져오기 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleManagerList = async () => {
    try {
      const response = await fetch('/api/live/get-user-list')
      const data = await response.json()

      setManagerList(data.userList)
    } catch (error) {
      console.error('담당자 리스트 가져오기 실패:', error)
    }
  }

  useEffect(() => {
    handleLiveSelection()
  }, [])

  useEffect(() => {
    handleManagerList()
  }, [newLiveModalOpen])

  // 새 공연 등록 요청 함수
  const handleNewLiveSubmit = async () => {
    try {
      const response = await fetch('/api/live/save-new-live', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newLiveData)
      })

      const result = await response.json()

      if (response.ok) {
        setNewLiveModalOpen(false)
        handleLiveSelection() // 데이터 갱신
        setNewLiveData({
          liveId: '',
          liveName: '',
          category: '',
          showStartDate: '',
          showEndDate: '',
          manager: ''
        })
      } else {
        console.error('새 공연 추가 실패:', result)
      }
    } catch (error) {
      console.error('새 공연 추가 요청 에러:', error)
    }
  }

  return (
    <div className='flex flex-col items-start justify-start h-full gap-10'>
      <h1>공연 정보</h1>

      {(session?.role === 0 || session?.role === 1) && (
        <div className='w-full flex justify-end'>
          <Button variant='contained' color='primary' onClick={() => setNewLiveModalOpen(true)}>
            추가하기
          </Button>
        </div>
      )}

      <Card className='overflow-x-auto shadow-md rounded-lg border border-gray-200 w-full'>
        <CardContent>
          <div className='overflow-x-auto w-full'>
            <h2 className='text-lg font-medium pb-5 text-center text-white'>진행중인 공연 목록</h2>
            <table className='min-w-full table-auto'>
              <thead className='text-white bg-gray-800'>
                <tr>
                  <th className='min-w-[100px] w-[100px] px-4 py-3 text-center text-sm font-medium'>ID</th>
                  <th className='min-w-[180px] w-[180px] px-4 py-3 text-center text-sm font-medium'>카테고리</th>
                  <th className='min-w-[180px] w-[180px] px-4 py-3 text-center text-sm font-medium'>공연명</th>
                  <th className='min-w-[180px] w-[180px] px-4 py-3 text-center text-sm font-medium'>시작일</th>
                  <th className='min-w-[180px] w-[180px] px-4 py-3 text-center text-sm font-medium'>종료일</th>
                  <th className='min-w-[120px] w-[120px] px-4 py-3 text-center text-sm font-medium'>담당자</th>
                  <th className='min-w-[120px] w-[120px] px-4 py-3 text-center text-sm font-medium'>상세정보</th>
                </tr>
              </thead>
              <tbody className='text-sm text-white'>
                {loading ? (
                  <tr>
                    <td colSpan={5} className='px-4 py-3 text-center'>
                      <CircularProgress size={24} color='inherit' />
                    </td>
                  </tr>
                ) : liveData && liveData.length > 0 ? (
                  liveData.map((item: any) => (
                    <tr key={item.live.id}>
                      <td className='min-w-[180px] px-4 py-3 overflow-x-auto text-center'>{item.live.liveId}</td>
                      <td className='min-w-[180px] px-4 py-3 overflow-x-auto text-center'>{item.live.category}</td>
                      <td className='min-w-[180px] px-4 py-3 overflow-x-auto text-center'>{item.live.liveName}</td>
                      <td className='min-w-[180px] px-4 py-3 overflow-x-auto text-center'>
                        {format(new Date(item.live.showStartDate), 'yyyy-MM-dd')}
                      </td>
                      <td className='min-w-[180px] px-4 py-3 overflow-x-auto text-center'>
                        {format(new Date(item.live.showEndDate), 'yyyy-MM-dd')}
                      </td>
                      <td className='min-w-[180px] px-4 py-3 overflow-x-auto text-center'>
                        {item.userNames.join(', ')}
                      </td>
                      <td className='min-w-[100px] px-4 py-3 flex items-center gap-2 justify-center'>
                        <Tooltip title='상세정보'>
                          <IconButton
                            onClick={() => router.push(`/live-detail?liveId=${item.live.liveId}`)}
                            sx={{ p: 0 }}
                          >
                            <DocumentMagnifyingGlassIcon className='h-6 w-6 text-blue-600' />
                          </IconButton>
                        </Tooltip>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className='px-4 py-3 text-center text-gray-500'>
                      공연 정보가 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className='w-full flex justify-end'>
        <Button variant='outlined' color='primary' onClick={() => setShowDeletedUploads(prev => !prev)}>
          {showDeletedUploads ? '숨기기' : '종료된 공연 보기'}
        </Button>
      </div>

      <div className='flex flex-col items-start justify-start gap-10 w-full '>
        <Collapse in={showDeletedUploads} timeout='auto' unmountOnExit className='w-full'>
          <Card className='overflow-x-auto shadow-md rounded-lg border border-gray-200 w-full'>
            <CardContent>
              <div className='overflow-x-auto w-full'>
                <table className='min-w-full table-auto'>
                  <thead className='text-white bg-gray-800'>
                    <tr>
                      <th className='min-w-[100px] w-[100px] px-4 py-3 text-center text-sm font-medium'>ID</th>
                      <th className='min-w-[180px] w-[180px] px-4 py-3 text-center text-sm font-medium'>공연명</th>
                      <th className='min-w-[180px] w-[180px] px-4 py-3 text-center text-sm font-medium'>시작일</th>
                      <th className='min-w-[180px] w-[180px] px-4 py-3 text-center text-sm font-medium'>종료일</th>
                      <th className='min-w-[120px] w-[120px] px-4 py-3 text-center text-sm font-medium'>담당자</th>
                      <th className='min-w-[120px] w-[120px] px-4 py-3 text-center text-sm font-medium'>상세정보</th>
                    </tr>
                  </thead>
                  <tbody className='text-sm text-white'>
                    {loading ? (
                      <tr>
                        <td colSpan={5} className='px-4 py-3 text-center'>
                          <CircularProgress size={24} color='inherit' />
                        </td>
                      </tr>
                    ) : finishedLiveData && finishedLiveData.length > 0 ? (
                      finishedLiveData.map((item: any) => (
                        <tr key={item.live.id}>
                          <td className='min-w-[180px] px-4 py-3 overflow-x-auto text-center'>{item.live.liveId}</td>
                          <td className='min-w-[180px] px-4 py-3 overflow-x-auto text-center'>{item.live.liveName}</td>
                          <td className='min-w-[180px] px-4 py-3 overflow-x-auto text-center'>
                            {format(new Date(item.live.showStartDate), 'yyyy-MM-dd')}
                          </td>
                          <td className='min-w-[180px] px-4 py-3 overflow-x-auto text-center'>
                            {format(new Date(item.live.showEndDate), 'yyyy-MM-dd')}
                          </td>
                          <td className='min-w-[180px] px-4 py-3 overflow-x-auto text-center'>
                            {item.userNames.join(', ')}
                          </td>
                          <td className='min-w-[100px] px-4 py-3 flex items-center gap-2 justify-center'>
                            <Tooltip title='상세정보'>
                              <IconButton
                                onClick={() => router.push(`/live-detail?liveId=${item.live.liveId}`)}
                                sx={{ p: 0 }}
                              >
                                <DocumentMagnifyingGlassIcon className='h-6 w-6 text-blue-600' />
                              </IconButton>
                            </Tooltip>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className='px-4 py-3 text-center text-gray-500'>
                          공연 정보가 없습니다.
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

      {/* 추가 공연 등록 모달 */}
      <Dialog open={newLiveModalOpen} onClose={() => setNewLiveModalOpen(false)}>
        <DialogTitle>새 공연 추가</DialogTitle>
        <DialogContent className='flex flex-col gap-5 min-w-[300px] py-3'>
          <FormControl fullWidth>
            <InputLabel>카테고리</InputLabel>
            <Select
              value={newLiveData.category}
              onChange={e => setNewLiveData({ ...newLiveData, category: e.target.value })}
              input={<OutlinedInput label='카테고리' />}
            >
              {['연극', '뮤지컬', '콘서트'].map((category: any) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <div className='flex flex-col gap-2'>
            <TextField
              label='공연 ID'
              type='text'
              value={newLiveData.liveId}
              onChange={e => {
                // 소수점 입력 방지 (정수만 허용)
                const value = e.target.value
                const integerValue = value.indexOf('.') >= 0 ? value.substring(0, value.indexOf('.')) : value

                setNewLiveData({ ...newLiveData, liveId: integerValue })
              }}
              fullWidth
            />
            <h5 className='text-end'>인터파크 공연ID를 입력해 주세요.</h5>
          </div>
          <TextField
            label='공연명'
            value={newLiveData.liveName}
            onChange={e => setNewLiveData({ ...newLiveData, liveName: e.target.value })}
            fullWidth
          />
          {newLiveData.category === '콘서트' ? (
            <div className='flex flex-col gap-2'>
              <TextField
                label='공연일시'
                type='datetime-local'
                value={newLiveData.showStartDate}
                onChange={e =>
                  setNewLiveData({
                    ...newLiveData,
                    showStartDate: e.target.value,
                    showEndDate: e.target.value // 콘서트는 시작일과 종료일이 동일
                  })
                }
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
              <h5 className='text-end'>콘서트 일시를 선택해주세요.</h5>
            </div>
          ) : (
            <>
              <TextField
                label='시작일'
                type='date'
                value={newLiveData.showStartDate}
                onChange={e => setNewLiveData({ ...newLiveData, showStartDate: e.target.value })}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label='종료일'
                type='date'
                value={newLiveData.showEndDate}
                onChange={e => setNewLiveData({ ...newLiveData, showEndDate: e.target.value })}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </>
          )}
          {/* <TextField
            label='시작일'
            type='date'
            value={newLiveData.showStartDate}
            onChange={e => setNewLiveData({ ...newLiveData, showStartDate: e.target.value })}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label='종료일'
            type='date'
            value={newLiveData.showEndDate}
            onChange={e => setNewLiveData({ ...newLiveData, showEndDate: e.target.value })}
            fullWidth
            InputLabelProps={{ shrink: true }}
          /> */}
          <FormControl fullWidth>
            <InputLabel>담당자</InputLabel>
            <Select
              value={newLiveData.manager}
              onChange={e => setNewLiveData({ ...newLiveData, manager: e.target.value })}
              input={<OutlinedInput label='담당자' />}
            >
              {managerList && managerList.length > 0 ? (
                managerList.map((manager: any) => (
                  <MenuItem key={manager.id} value={manager.id}>
                    {manager.name}
                  </MenuItem>
                ))
              ) : (
                <MenuItem value=''>담당자 없음</MenuItem>
              )}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewLiveModalOpen(false)} color='secondary'>
            취소
          </Button>
          <Button onClick={handleNewLiveSubmit} color='primary' variant='contained'>
            저장하기
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}

export default LivePage
