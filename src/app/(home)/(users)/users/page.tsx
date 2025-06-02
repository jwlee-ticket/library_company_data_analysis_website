'use client'

import { useEffect, useState } from 'react'

import {
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Chip,
  Typography,
  FormControl,
  Select,
  MenuItem
} from '@mui/material'

import { XCircleIcon } from '@heroicons/react/24/solid'

import AddLiveSelect from '@/components/AddLiveSelect' // 새로 만든 컴포넌트 import

export default function Users() {
  // 유저 데이터 상태

  const [userData, setUserData] = useState<any[]>([])
  const [session, setSession] = useState<{ role?: number; userId?: number } | null>(null)
  const [openModal, setOpenModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any | null>(null)
  const [liveList, setLiveList] = useState<string[]>([])

  // 유저 데이터 가져오기
  const handleUserData = async () => {
    try {
      // 유저 데이터 가져오기

      const response = await fetch(`/api/users/get-users`)
      const data = await response.json()

      // 유저 데이터 상태 업데이트
      setUserData(data)
    } catch (error) {
      console.error('데이터 가져오기 실패:', error)
    }
  }

  // 세션 정보 가져오기
  const fetchSession = async () => {
    try {
      const res = await fetch('/api/session')
      const data = await res.json()

      setSession(data)
    } catch (error) {
      console.error('세션 정보 가져오기 실패:', error)
    }
  }

  // 공연 리스트 가져오기
  const fetchLiveList = async () => {
    try {
      const res = await fetch('/api/users/get-live-list')
      const dataList = ['전체']
      const data = await res.json()

      dataList.push(...data)
      setLiveList(dataList)
    } catch (error) {
      console.error('관리공연 리스트 가져오기 실패:', error)
    }
  }

  useEffect(() => {
    handleUserData()
    fetchSession()
    fetchLiveList()
  }, [])

  const handleEditOpen = (item: any) => {
    setSelectedUser(item)
    setOpenModal(true)
  }

  const handleCloseModal = () => {
    setOpenModal(false)
    setSelectedUser(null)
  }

  const handleSaveChanges = async () => {
    try {
      const response = await fetch('/api/users/edit-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: selectedUser.id,
          name: selectedUser.name,
          email: selectedUser.email,
          role: selectedUser.role,
          password: selectedUser.password,
          status: selectedUser.status,
          isLiveManager: selectedUser.isLiveManager,
          isFileUploader: selectedUser.isFileUploader,
          liveNameList: selectedUser.liveNameList || []
        })
      })

      const result = await response.json()

      if (response.ok && result.code === 200) {
        alert(result.message || '수정 성공')

        // 필요 시 사용자 목록을 갱신하고 모달을 닫습니다.
        handleUserData()
        handleCloseModal()
      } else {
        alert(result.error || result.message || '수정 실패')
      }
    } catch (error) {
      console.error('수정 요청 에러:', error)
      alert('수정 요청 중 오류가 발생했습니다.')
    }
  }

  const handleDelete = async (id: number) => {
    try {
      const confirmDelete = window.confirm('정말로 삭제하시겠습니까?')

      if (confirmDelete) {
        const res = await fetch(`/api/users/delete-user?id=${id}`, { method: 'GET' })

        if (res.ok) {
          handleUserData() // 삭제 후 사용자 목록 갱신
        }
      }
    } catch (error) {
      console.error('삭제 실패:', error)
    }
  }

  return (
    <div className='flex flex-col items-start justify-start h-full gap-10'>
      <h1>계정관리</h1>
      <Card className='overflow-x-auto shadow-md rounded-lg border border-gray-200 w-full'>
        <CardContent>
          <div className='overflow-x-auto w-full'>
            <table className='min-w-full table-auto'>
              <thead className='text-white bg-gray-800'>
                <tr>
                  <th className='min-w-[100px] w-[100px] px-4 py-3 text-center text-sm font-medium'>이름</th>
                  <th className='min-w-[180px] w-[180px] px-4 py-3 text-center text-sm font-medium'>이메일</th>
                  <th className='min-w-[180px] w-[180px] px-4 py-3 text-center text-sm font-medium'>권한</th>
                  <th className='min-w-[180px] w-[180px] px-4 py-3 text-center text-sm font-medium'>공연관리자</th>
                  <th className='min-w-[180px] w-[180px] px-4 py-3 text-center text-sm font-medium'>파일업로더</th>
                  <th className='min-w-[120px] w-[120px] px-4 py-3 text-center text-sm font-medium'>관리공연</th>
                  <th className='min-w-[120px] w-[120px] px-4 py-3 text-center text-sm font-medium'>가입상태</th>
                  <th className='min-w-[120px] w-[120px] px-4 py-3 text-center text-sm font-medium'>액션</th>
                </tr>
              </thead>
              <tbody className='text-sm text-white'>
                {session &&
                userData.filter(item => item.role > (session?.role ?? 2) || item.id === session.userId).length > 0 ? (
                  userData
                    .filter(item => item.role > (session?.role ?? 2) || item.id === session.userId)
                    .map((item, index) => (
                      <tr key={index}>
                        <td className='min-w-[180px] px-4 py-3 text-center'>{item.name}</td>
                        <td className='min-w-[180px] px-4 py-3 text-center'>{item.email}</td>
                        <td className='min-w-[180px] px-4 py-3 text-center'>
                          {item.role === 0 ? '마스터' : item.role === 1 ? '관리자' : '일반유저'}
                        </td>
                        <td className='min-w-[180px] px-4 py-3 text-center'>{item.isLiveManager ? '네' : '아니오'}</td>
                        <td className='min-w-[180px] px-4 py-3 text-center'>{item.isFileUploader ? '네' : '아니오'}</td>
                        <td className='min-w-[120px] px-4 py-3 text-center'>
                          {!item.liveNameList || item.liveNameList.length === 0
                            ? '없음'
                            : item.liveNameList.includes('전체')
                              ? '전체'
                              : '일부공연'}
                        </td>
                        <td className='min-w-[180px] px-4 py-3 text-center'>{item.status ? '승인' : '대기'}</td>
                        <td className='min-w-[120px] px-4 py-3 flex items-center gap-2 justify-center'>
                          <Tooltip title='수정'>
                            <IconButton onClick={() => handleEditOpen(item)}>
                              <i className='tabler-pencil text-blue-600' />
                            </IconButton>
                          </Tooltip>
                          {item.id === session.userId ? null : (
                            <Tooltip title='삭제'>
                              <IconButton onClick={() => handleDelete(item.id)}>
                                <i className='tabler-trash text-red-600' />
                              </IconButton>
                            </Tooltip>
                          )}
                        </td>
                      </tr>
                    ))
                ) : (
                  <tr>
                    <td colSpan={7} className='px-4 py-3 text-center text-gray-500'>
                      유저 정보가 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* 수정 팝업 Modal */}
      <Dialog open={openModal} onClose={handleCloseModal}>
        <DialogTitle className='min-w-[300px]'>사용자 수정</DialogTitle>
        <DialogContent className='flex flex-col gap-5 min-w-[300px] py-3'>
          {selectedUser && (
            <>
              <TextField
                label='이름'
                value={selectedUser.name}
                onChange={e => setSelectedUser({ ...selectedUser, name: e.target.value })}
                fullWidth
              />
              <TextField
                label='이메일'
                value={selectedUser.email}
                onChange={e => setSelectedUser({ ...selectedUser, email: e.target.value })}
                fullWidth
              />
              <TextField
                label='비밀번호'
                value={selectedUser.password || ''}
                onChange={e => setSelectedUser({ ...selectedUser, password: e.target.value })}
                fullWidth
              />
              <div className=' flex justify-start gap-5'>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedUser.status || false}
                      onChange={e => setSelectedUser({ ...selectedUser, status: e.target.checked })}
                    />
                  }
                  label='가입승인'
                />
                {session?.role === 0 && (
                  <FormControl className='w-1/2'>
                    {/* <InputLabel>권한</InputLabel> */}
                    <Select
                      value={selectedUser.role}
                      onChange={e => setSelectedUser({ ...selectedUser, role: e.target.value })}
                    >
                      <MenuItem value={0}>마스터</MenuItem>
                      <MenuItem value={1}>관리자</MenuItem>
                      <MenuItem value={2}>일반유저</MenuItem>
                    </Select>
                  </FormControl>
                )}
              </div>
              <div className='w-full border-t border-gray-400'></div>
              {/* 관리공연 영역 */}
              <Typography variant='subtitle1'>권한부여</Typography>
              <div className=' items-center justify-start flex gap-5'>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedUser.isLiveManager || false}
                      onChange={e => setSelectedUser({ ...selectedUser, isLiveManager: e.target.checked })}
                    />
                  }
                  label='공연 관리자'
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedUser.isFileUploader || false}
                      onChange={e => setSelectedUser({ ...selectedUser, isFileUploader: e.target.checked })}
                    />
                  }
                  label='파일 업로더'
                />
              </div>
              <Typography variant='subtitle1'>부여된 공연</Typography>
              <div className='flex flex-wrap gap-2 mb-2'>
                {(selectedUser.liveNameList || []).map((liveName: string) => {
                  // liveList는 문자열 배열이므로, liveId 자체를 label로 사용합니다.
                  return (
                    <Chip
                      key={liveName}
                      label={liveName}
                      deleteIcon={<XCircleIcon className='h-4 w-4' />}
                      onDelete={() => {
                        const updated = (selectedUser.liveNameList || []).filter((name: string) => name !== liveName)

                        setSelectedUser({ ...selectedUser, liveNameList: updated })
                      }}
                      onClick={() => {
                        const updated = (selectedUser.liveNameList || []).filter((name: string) => name !== liveName)

                        setSelectedUser({ ...selectedUser, liveNameList: updated })
                      }}
                      color='primary'
                      variant='outlined'
                    />
                  )
                })}
              </div>
              {/* 추가할 공연 선택을 위한 컴포넌트 */}
              <AddLiveSelect selectedUser={selectedUser} setSelectedUser={setSelectedUser} liveList={liveList} />
            </>
          )}
        </DialogContent>
        <DialogActions className='flex gap-1 min-w-[300px]'>
          <Button onClick={handleCloseModal} color='secondary'>
            닫기
          </Button>
          <Button onClick={handleSaveChanges} color='primary' variant='contained'>
            저장
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}
