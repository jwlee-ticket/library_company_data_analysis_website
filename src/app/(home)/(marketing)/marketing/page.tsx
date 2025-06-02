'use client'

import { useState } from 'react'

import { format } from 'date-fns'
import {
  Button,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material'

import LiveDropdown from '@/components/layout/shared/liveDropdown'

const MarketingPage = () => {
  const [marketingData, setMarketingData] = useState<any[]>([]) // 마케팅 데이터 상태 관리
  const [selectedPerformance, setSelectedPerformance] = useState<string>('공연 선택하기')

  // 수정 다이얼로그 관련 상태
  const [editDialogOpen, setEditDialogOpen] = useState(false)

  const [editData, setEditData] = useState({
    marketingId: null,
    date: '',
    noteSales: '',
    noteMarketing: '',
    noteOthers: ''
  })

  // 추가 다이얼로그 관련 상태
  const [addDialogOpen, setAddDialogOpen] = useState(false)

  const [addData, setAddData] = useState({
    liveName: selectedPerformance,
    date: '',
    noteSales: '',
    noteMarketing: '',
    noteOthers: ''
  })

  // 공연 선택 후 해당 공연의 마케팅 데이터를 가져오는 함수
  const handleLiveSelection = async (liveName: string) => {
    setSelectedPerformance(liveName)

    try {
      const response = await fetch(`/api/marketing/marketing-calendar?liveName=${liveName}`)
      const data = await response.json()

      setMarketingData(data) // 응답 데이터를 상태에 저장
    } catch (error) {
      console.error('데이터 가져오기 실패:', error)
    }
  }

  // 삭제 함수 (API 라우트를 통해 삭제)
  const handleDelete = async (itemId: number) => {
    const confirmDelete = confirm('정말로 삭제하시겠습니까?')

    if (confirmDelete) {
      try {
        const response = await fetch(`/api/marketing/delete-marketing?id=${itemId}`)
        const data = await response.json()

        console.log('handleDelete 1', data)

        if (data.code === 200) {
          // 삭제 성공 시 현재 선택된 공연으로 다시 데이터를 불러옵니다.
          handleLiveSelection(selectedPerformance)
        }
      } catch (error) {
        console.error('삭제 실패:', error)
      }
    }
  }

  // 수정 다이얼로그 열기: 클릭한 항목의 데이터를 팝업에 세팅
  const handleEditOpen = (item: any) => {
    setEditData({
      marketingId: item.id,
      date: format(new Date(item.date), 'yyyy-MM-dd'),
      noteSales: item.noteSales,
      noteMarketing: item.noteMarketing,
      noteOthers: item.noteOthers
    })
    setEditDialogOpen(true)
  }

  // 수정 다이얼로그 닫기
  const handleEditClose = () => {
    setEditDialogOpen(false)
  }

  // 수정 다이얼로그 입력 값 변경 핸들러
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    setEditData(prev => ({ ...prev, [name]: value }))
  }

  // 수정 요청: "수정하기" 버튼 클릭 시 호출
  const handleEditSubmit = async () => {
    try {
      const response = await fetch(`/api/marketing/change-marketing`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editData)
      })

      const result = await response.json()

      if (response.ok) {
        setEditDialogOpen(false)
        handleLiveSelection(selectedPerformance)
      } else {
        console.error('수정 실패:', result)
      }
    } catch (error) {
      console.error('수정 요청 에러:', error)
    }
  }

  // 추가 다이얼로그 열기: 빈 값으로 초기화
  const handleAddOpen = () => {
    setAddData({
      liveName: selectedPerformance,
      date: '',
      noteSales: '',
      noteMarketing: '',
      noteOthers: ''
    })
    setAddDialogOpen(true)
  }

  // 추가 다이얼로그 닫기
  const handleAddClose = () => {
    setAddDialogOpen(false)
  }

  // 추가 다이얼로그 입력 값 변경 핸들러
  const handleAddChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    setAddData(prev => ({ ...prev, [name]: value }))
  }

  // 추가 요청: "저장하기" 버튼 클릭 시 호출
  const handleAddSubmit = async () => {
    try {
      const response = await fetch(`/api/marketing/save-marketing`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(addData)
      })

      const result = await response.json()

      if (response.ok) {
        setAddDialogOpen(false)

        // 추가 후 현재 선택된 공연의 마케팅 데이터를 다시 불러옵니다.
        handleLiveSelection(selectedPerformance)
      } else {
        console.error('추가 실패:', result)
      }
    } catch (error) {
      console.error('추가 요청 에러:', error)
    }
  }

  return (
    <div className='flex flex-col items-start justify-start h-full gap-10'>
      <h1>마케팅 정보</h1>

      <div className='flex items-center gap-2 px-2 py-1 bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white font-medium shadow-md rounded-full transition-all duration-200'>
        <LiveDropdown onLiveSelect={handleLiveSelection} />
      </div>

      {/* Card 상단 오른쪽에 "추가하기" 버튼 */}
      {selectedPerformance != '공연 선택하기' ? (
        <div className='w-full flex justify-end'>
          <Button variant='contained' color='primary' onClick={handleAddOpen}>
            추가하기
          </Button>
        </div>
      ) : null}

      {/* Card 상단 오른쪽에 "추가하기" 버튼 */}
      {selectedPerformance != '공연 선택하기' ? (
        <Card className='overflow-x-auto shadow-md rounded-lg border border-gray-200 w-full'>
          <CardContent>
            <div className='overflow-x-auto w-full'>
              <table className='min-w-full table-auto'>
                <thead className='text-white bg-gray-800'>
                  <tr>
                    <th className='min-w-[100px] w-[100px] px-4 py-3 text-center text-sm font-medium'>날짜</th>
                    <th className='min-w-[180px] w-[180px] px-4 py-3 text-center text-sm font-medium'>세일즈</th>
                    <th className='min-w-[180px] w-[180px] px-4 py-3 text-center text-sm font-medium'>마케팅</th>
                    <th className='min-w-[180px] w-[180px] px-4 py-3 text-center text-sm font-medium'>기타</th>
                    <th className='min-w-[120px] w-[120px] px-4 py-3 text-center text-sm font-medium'>액션</th>
                  </tr>
                </thead>
                <tbody className='text-sm text-white'>
                  {marketingData.length > 0 ? (
                    marketingData.map((item, index) => (
                      <tr key={index}>
                        <td className='min-w-[100px] w-[100px] px-4 py-3 overflow-x-auto whitespace-nowrap text-center'>
                          {format(new Date(item.date), 'yyyy-MM-dd')}
                        </td>
                        <td className='min-w-[180px] px-4 py-3 overflow-x-auto'>{item.noteSales}</td>
                        <td className='min-w-[180px] px-4 py-3 overflow-x-auto'>{item.noteMarketing}</td>
                        <td className='min-w-[180px] px-4 py-3 overflow-x-auto'>{item.noteOthers}</td>
                        <td className='min-w-[120px] px-4 py-3 flex items-center gap-2 justify-center'>
                          <Tooltip title='수정'>
                            <IconButton onClick={() => handleEditOpen(item)}>
                              <i className='tabler-pencil text-blue-600' />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title='삭제'>
                            <IconButton onClick={() => handleDelete(item.id)}>
                              <i className='tabler-trash text-red-600' />
                            </IconButton>
                          </Tooltip>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className='px-4 py-3 text-center text-gray-500'>
                        마케팅 정보가 없습니다.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* 수정 다이얼로그 팝업 */}
      <Dialog open={editDialogOpen} onClose={handleEditClose}>
        <DialogTitle className='flex min-w-[300px]'>마케팅 정보 수정</DialogTitle>
        <DialogContent className='flex flex-col gap-5 min-w-[300px] py-3'>
          <TextField
            label='날짜'
            name='date'
            type='date'
            value={editData.date}
            onChange={handleEditChange}
            fullWidth
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField label='세일즈' name='noteSales' value={editData.noteSales} onChange={handleEditChange} fullWidth />
          <TextField
            label='마케팅'
            name='noteMarketing'
            value={editData.noteMarketing}
            onChange={handleEditChange}
            fullWidth
          />
          <TextField label='기타' name='noteOthers' value={editData.noteOthers} onChange={handleEditChange} fullWidth />
        </DialogContent>
        <DialogActions className='flex gap-1 min-w-[300px]'>
          <Button onClick={handleEditClose} color='secondary'>
            취소
          </Button>
          <Button onClick={handleEditSubmit} color='primary' variant='contained'>
            수정하기
          </Button>
        </DialogActions>
      </Dialog>

      {/* 추가 다이얼로그 팝업 */}
      <Dialog open={addDialogOpen} onClose={handleAddClose}>
        <DialogTitle className='flex min-w-[300px]'>마케팅 정보 추가</DialogTitle>
        <DialogContent className='flex flex-col gap-5 min-w-[300px] py-3'>
          <TextField
            label='날짜'
            name='date'
            type='date'
            value={addData.date}
            onChange={handleAddChange}
            fullWidth
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField label='세일즈' name='noteSales' value={addData.noteSales} onChange={handleAddChange} fullWidth />
          <TextField
            label='마케팅'
            name='noteMarketing'
            value={addData.noteMarketing}
            onChange={handleAddChange}
            fullWidth
          />
          <TextField label='기타' name='noteOthers' value={addData.noteOthers} onChange={handleAddChange} fullWidth />
        </DialogContent>
        <DialogActions className='flex gap-1 min-w-[300px]'>
          <Button onClick={handleAddClose} color='secondary'>
            취소
          </Button>
          <Button onClick={handleAddSubmit} color='primary' variant='contained'>
            저장하기
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}

export default MarketingPage
