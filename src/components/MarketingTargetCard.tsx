import { useState, useEffect } from 'react'

import {
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Box,
  Collapse,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material'
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline'

// 마케팅 데이터 타입 정의
interface MarketingData {
  id: number
  weekNumber: number
  salesMarketing: string
  promotion: string
  weekStartDate: string
  weekEndDate: string
  etc: string
}

interface MarketingCardProps {
  marketingData: MarketingData[]
  liveId: string
  onDataRefresh?: () => Promise<void>
  refreshKey?: number
}

const MarketingCard = ({ marketingData, liveId, onDataRefresh, refreshKey = 0 }: MarketingCardProps) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editedMarketingData, setEditedMarketingData] = useState<MarketingData[]>([])
  const [openWeeks, setOpenWeeks] = useState<Record<number, boolean>>({})
  const [isSaving, setIsSaving] = useState(false)

  // 첫 렌더링시 marketingData를 편집 상태로 복사
  useEffect(() => {
    if (marketingData) {
      setEditedMarketingData([...marketingData])
    }
  }, [marketingData, refreshKey])

  const handleToggleWeek = (weekNumber: number) => {
    setOpenWeeks(prev => ({
      ...prev,
      [weekNumber]: !prev[weekNumber]
    }))
  }

  const handleEditToggle = () => {
    // 편집 모드로 들어갈 때 현재 데이터 복사
    if (!isEditing) {
      setEditedMarketingData([...marketingData])
    }

    setIsEditing(!isEditing)
  }

  // 마케팅 데이터 수정 함수
  const handleMarketingDataChange = (id: number, field: keyof MarketingData, value: string) => {
    setEditedMarketingData(prev => {
      return prev.map(item => {
        if (item.id === id) {
          return { ...item, [field]: value }
        }

        return item
      })
    })
  }

  // 저장 함수
  const handleSaveChanges = async () => {
    setIsSaving(true)

    try {
      // 변경된 마케팅 데이터 확인
      const updatedMarketingData: MarketingData[] = []

      editedMarketingData.forEach(item => {
        // 원본 데이터와 비교하여 변경된 항목만 추가
        const originalItem = marketingData.find(o => o.id === item.id)

        if (originalItem) {
          if (
            originalItem.salesMarketing !== item.salesMarketing ||
            originalItem.promotion !== item.promotion ||
            originalItem.etc !== item.etc
          ) {
            updatedMarketingData.push(item)
          }
        }
      })

      if (updatedMarketingData.length > 0) {
        const response = await fetch('/api/live/change-live-marketing-data', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            liveId: liveId,
            marketingData: updatedMarketingData
          })
        })

        const result = await response.json()

        if (result.status === 200) {
          alert('마케팅 데이터가 성공적으로 저장되었습니다.')

          // 저장 성공 후 데이터 새로고침
          if (onDataRefresh && typeof onDataRefresh === 'function') {
            await onDataRefresh()
          }

          // 성공 후 편집 모드 종료
          setIsEditing(false)
        } else {
          console.error('마케팅 데이터 저장 실패:', result)
          alert('마케팅 데이터 저장에 실패했습니다.')
        }
      } else {
        // 변경사항이 없는 경우
        setIsEditing(false)
      }
    } catch (error) {
      console.error('마케팅 데이터 저장 중 오류 발생:', error)
      alert('마케팅 데이터 저장 중 오류가 발생했습니다.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card className='w-full mt-4'>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant='h5'>주차별 마케팅 계획</Typography>
          <Button
            variant='contained'
            color={isEditing ? 'success' : 'primary'}
            onClick={isEditing ? handleSaveChanges : handleEditToggle}
            disabled={isSaving}
          >
            {isSaving ? '저장 중...' : isEditing ? '저장하기' : '수정하기'}
          </Button>
        </Box>

        {(isEditing ? editedMarketingData : marketingData)?.map(item => (
          <Box key={`marketing-week-${item.weekNumber}`} sx={{ mb: 2 }}>
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
                onClick={() => handleToggleWeek(item.weekNumber)}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <IconButton size='small'>
                    {openWeeks[item.weekNumber] ? (
                      <ChevronUpIcon className='h-5 w-5' />
                    ) : (
                      <ChevronDownIcon className='h-5 w-5' />
                    )}
                  </IconButton>
                  <Typography variant='h6'>
                    {item.weekNumber}주차 | {formatDate(item.weekStartDate)} ~ {formatDate(item.weekEndDate)}
                  </Typography>
                </Box>
              </Box>

              <Collapse in={openWeeks[item.weekNumber]} timeout='auto' unmountOnExit>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell align='center' width='20%'>
                          구분
                        </TableCell>
                        <TableCell align='center'>내용</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell>세일즈 마케팅</TableCell>
                        <TableCell>
                          {isEditing ? (
                            <TextField
                              fullWidth
                              multiline
                              rows={3}
                              value={editedMarketingData.find(m => m.id === item.id)?.salesMarketing || ''}
                              onChange={e => handleMarketingDataChange(item.id, 'salesMarketing', e.target.value)}
                            />
                          ) : (
                            <Typography style={{ whiteSpace: 'pre-line' }}>{item.salesMarketing}</Typography>
                          )}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>프로모션</TableCell>
                        <TableCell>
                          {isEditing ? (
                            <TextField
                              fullWidth
                              multiline
                              rows={3}
                              value={editedMarketingData.find(m => m.id === item.id)?.promotion || ''}
                              onChange={e => handleMarketingDataChange(item.id, 'promotion', e.target.value)}
                            />
                          ) : (
                            <Typography style={{ whiteSpace: 'pre-line' }}>{item.promotion}</Typography>
                          )}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>기타</TableCell>
                        <TableCell>
                          {isEditing ? (
                            <TextField
                              fullWidth
                              multiline
                              rows={3}
                              value={editedMarketingData.find(m => m.id === item.id)?.etc || ''}
                              onChange={e => handleMarketingDataChange(item.id, 'etc', e.target.value)}
                            />
                          ) : (
                            <Typography style={{ whiteSpace: 'pre-line' }}>{item.etc}</Typography>
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
      </CardContent>
    </Card>
  )
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export default MarketingCard
