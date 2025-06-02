'use client'
import { useState, useEffect } from 'react'

import type { SelectChangeEvent } from '@mui/material'
import {
  Button,
  Card,
  CardContent,
  Typography,
  Box,
  Collapse,
  IconButton,
  FormControl,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField
} from '@mui/material'
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline'

// 월별 비고 데이터 타입 정의
interface MonthlyEtcData {
  id: number
  year: number
  month: number
  etc: string | null
  updatedAt: string
}

export default function MonthlyEtcPage() {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())
  const [monthlyData, setMonthlyData] = useState<MonthlyEtcData[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [openMonths, setOpenMonths] = useState<Record<number, boolean>>({})
  const [isEditing, setIsEditing] = useState<boolean>(false)
  const [editedData, setEditedData] = useState<MonthlyEtcData[]>([])
  const [isSaving, setIsSaving] = useState<boolean>(false)

  // 년도 범위 생성 (2025-2030)
  const years = Array.from({ length: 6 }, (_, i) => 2025 + i)

  // 현재 월 구하기
  const currentMonth = new Date().getMonth() + 1 // getMonth()는 0부터 시작하므로 +1

  // 컴포넌트 마운트 시 현재 년도의 데이터 로드
  useEffect(() => {
    fetchMonthlyData(selectedYear)

    // 현재 월의 Collapse 기본적으로 열기
    setOpenMonths(prev => ({
      ...prev,
      [currentMonth]: true
    }))
  }, [])

  // 년도 선택 시 해당 년도의 데이터 로드
  const handleYearChange = (event: SelectChangeEvent<number>) => {
    const year = Number(event.target.value)

    setSelectedYear(year)
    fetchMonthlyData(year)
  }

  // 월별 데이터 가져오기
  const fetchMonthlyData = async (year: number) => {
    setLoading(true)

    try {
      const response = await fetch(`/api/monthly-etc/get-monthly-etc-data?year=${year}`)
      const result = await response.json()

      if (result.code === 200 && Array.isArray(result.data)) {
        setMonthlyData(result.data)
        setEditedData([...result.data])
      } else {
        console.error('데이터 형식이 올바르지 않습니다:', result)
      }
    } catch (error) {
      console.error('데이터 가져오기 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  // 월 토글
  const handleToggleMonth = (month: number) => {
    setOpenMonths(prev => ({
      ...prev,
      [month]: !prev[month]
    }))
  }

  // 편집 모드 토글
  const handleEditToggle = () => {
    if (!isEditing) {
      // 편집 모드로 들어갈 때 현재 데이터 복사
      setEditedData([...monthlyData])
    }

    setIsEditing(!isEditing)
  }

  // 개별 비고 수정
  const handleEtcChange = (id: number, value: string) => {
    setEditedData(prev => {
      return prev.map(item => {
        if (item.id === id) {
          return { ...item, etc: value }
        }

        return item
      })
    })
  }

  // 변경사항 저장
  const handleSaveChanges = async () => {
    setIsSaving(true)

    try {
      // 변경된 항목만 필터링
      const changedItems = editedData
        .filter(item => {
          const originalItem = monthlyData.find(original => original.id === item.id)

          return originalItem?.etc !== item.etc
        })
        .map(item => ({
          id: item.id,
          etc: item.etc
        }))

      if (changedItems.length === 0) {
        // 변경사항이 없는 경우
        setIsEditing(false)
        setIsSaving(false)

        return
      }

      const response = await fetch('/api/monthly-etc/change-monthly-etc-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          monthlyEtcData: changedItems
        })
      })

      const result = await response.json()

      if (result.code === 200) {
        alert('월간 비고가 성공적으로 저장되었습니다.')

        // 성공 후 데이터 새로고침
        await fetchMonthlyData(selectedYear)
        setIsEditing(false)
      } else {
        console.error('월간 비고 저장 실패:', result)
        alert('월간 비고 저장에 실패했습니다.')
      }
    } catch (error) {
      console.error('월간 비고 저장 중 오류 발생:', error)
      alert('월간 비고 저장 중 오류가 발생했습니다.')
    } finally {
      setIsSaving(false)
    }
  }

  // 월 이름 변환 함수
  const getMonthName = (month: number): string => {
    const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월']

    return monthNames[month - 1]
  }

  return (
    <div className='flex flex-col items-start justify-start h-full gap-10 w-full'>
      <h1>월간 비고</h1>

      <div className='w-full flex items-center justify-between'>
        <FormControl sx={{ minWidth: 120 }}>
          <Select
            value={selectedYear}
            onChange={handleYearChange}
            variant='outlined'
            sx={{
              bgcolor: 'background.paper',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'primary.main'
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'primary.dark'
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: 'primary.dark'
              }
            }}
          >
            {years.map(year => (
              <MenuItem key={year} value={year}>
                {year}년
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button
          variant='contained'
          color={isEditing ? 'success' : 'primary'}
          onClick={isEditing ? handleSaveChanges : handleEditToggle}
          disabled={isSaving}
        >
          {isSaving ? '저장 중...' : isEditing ? '저장하기' : '수정하기'}
        </Button>
      </div>

      {/* 월별 비고 데이터 표시 */}
      {monthlyData.length > 0 && (
        <div className='w-full'>
          {(isEditing ? editedData : monthlyData).map(item => (
            <Box key={`month-${item.month}`} sx={{ mb: 2 }}>
              <Paper sx={{ width: '100%', mb: 2 }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: 2,
                    cursor: 'pointer',
                    bgcolor: 'background.default',
                    '&:hover': { bgcolor: 'action.hover' }
                  }}
                  onClick={() => handleToggleMonth(item.month)}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <IconButton size='small'>
                      {openMonths[item.month] ? (
                        <ChevronUpIcon className='h-5 w-5' />
                      ) : (
                        <ChevronDownIcon className='h-5 w-5' />
                      )}
                    </IconButton>
                    <Typography variant='h6'>{getMonthName(item.month)}</Typography>
                  </Box>
                </Box>

                <Collapse in={openMonths[item.month]} timeout='auto' unmountOnExit>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell width='20%'>구분</TableCell>
                          <TableCell align='center'>내용</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow>
                          <TableCell>비고</TableCell>
                          <TableCell>
                            {isEditing ? (
                              <TextField
                                fullWidth
                                multiline
                                rows={4}
                                value={editedData.find(data => data.id === item.id)?.etc || ''}
                                onChange={e => handleEtcChange(item.id, e.target.value)}
                              />
                            ) : (
                              <Typography style={{ whiteSpace: 'pre-line' }}>{item.etc || ''}</Typography>
                            )}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Collapse>
              </Paper>
            </Box>
          ))}
        </div>
      )}

      {monthlyData.length === 0 && !loading && (
        <Card className='w-full'>
          <CardContent>
            <Typography align='center'>데이터가 없습니다.</Typography>
          </CardContent>
        </Card>
      )}

      {loading && (
        <Card className='w-full'>
          <CardContent>
            <Typography align='center'>데이터를 불러오는 중...</Typography>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
