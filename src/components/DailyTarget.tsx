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

// 타입 정의
interface Target {
  date: string
  target: number
  id: number
}

interface WeeklyTarget {
  week: number
  targets: Target[]
  dateLength: number
  dates?: Date[]
}

interface DailyTargetCardProps {
  weeklyTargets: WeeklyTarget[]
  liveId: string
  onDataRefresh?: () => Promise<void> // 새로고침 함수 추가
  refreshKey?: number // 새 속성 추가
}

const DailyTargetCard = ({ weeklyTargets, liveId, onDataRefresh, refreshKey = 0 }: DailyTargetCardProps) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editedWeeklyTargets, setEditedWeeklyTargets] = useState<WeeklyTarget[]>([])
  const [openWeeks, setOpenWeeks] = useState<Record<number, boolean>>({})
  const [isSaving, setIsSaving] = useState(false)

  // 첫 렌더링시 weeklyTargets를 편집 상태로 복사
  useEffect(() => {
    if (weeklyTargets) {
      setEditedWeeklyTargets([...weeklyTargets])
    }
  }, [weeklyTargets, refreshKey])

  const handleToggleWeek = (weekNumber: number) => {
    setOpenWeeks(prev => ({
      ...prev,
      [weekNumber]: !prev[weekNumber]
    }))
  }

  const handleEditToggle = () => {
    // 편집 모드로 들어갈 때 현재 데이터 복사
    if (!isEditing) {
      setEditedWeeklyTargets([...weeklyTargets])
    }

    setIsEditing(!isEditing)
  }

  // 주차별 합계 계산 함수
  const calculateWeekTotal = (targets: Target[]) => {
    return targets.reduce((sum, item) => sum + (item.target || 0), 0)
  }

  // 천 단위 구분자 포맷팅 함수
  const formatNumberWithCommas = (value: number | null | undefined) => {
    if (value === null || value === undefined) return '0'

    return value.toLocaleString('ko-KR')
  }

  // 날짜 포맷팅 함수 (YYYY-MM-DD)
  const formatDate = (dateString: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')

    return `${year}-${month}-${day}`
  }

  // 주차 전체 타겟 수정 함수
  const handleWeekTargetChange = (weekNumber: number, totalValue: string) => {
    setEditedWeeklyTargets(prev => {
      return prev.map(week => {
        if (week.week === weekNumber) {
          // 문자열에서 쉼표 제거 후 숫자로 변환
          const numericValue = totalValue ? Number(totalValue.replace(/,/g, '')) : 0

          // 타겟당 균등 배분할 값 계산
          const targetPerDate = Math.floor(numericValue / week.dateLength)
          const remainder = numericValue % week.dateLength

          // 새로운 targets 배열 생성
          const newTargets = week.targets.map((target, index) => ({
            ...target,
            target: targetPerDate + (index < remainder ? 1 : 0) // 나머지를 앞에서부터 1씩 추가
          }))

          return { ...week, targets: newTargets }
        }

        return week
      })
    })
  }

  // 개별 타겟 수정 함수
  const handleIndividualTargetChange = (weekNumber: number, targetId: number, value: string) => {
    // 쉼표 제거 후 숫자로 변환
    const numericValue = value ? Number(value.replace(/,/g, '')) : 0

    setEditedWeeklyTargets(prev => {
      return prev.map(week => {
        if (week.week === weekNumber) {
          const newTargets = week.targets.map(target => {
            if (target.id === targetId) {
              return { ...target, target: numericValue }
            }

            return target
          })

          return { ...week, targets: newTargets }
        }

        return week
      })
    })
  }

  const handleSaveChanges = async () => {
    setIsSaving(true)

    try {
      // 변경된 모든 타겟 데이터 수집
      const updatedTargets: Target[] = []

      editedWeeklyTargets.forEach(week => {
        week.targets.forEach(target => {
          // 원본 데이터와 비교하여 변경된 항목만 추가
          const originalWeek = weeklyTargets.find(w => w.week === week.week)

          if (originalWeek) {
            const originalTarget = originalWeek.targets.find(t => t.id === target.id)

            if (originalTarget && originalTarget.target !== target.target) {
              updatedTargets.push({
                date: target.date,
                target: target.target,
                id: target.id
              })
            }
          }
        })
      })

      if (updatedTargets.length > 0) {
        const response = await fetch('/api/live/change-live-daily-target', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            liveId: liveId,
            targets: updatedTargets
          })
        })

        const result = await response.json()

        if (result.status === 200) {
          alert('타겟 데이터가 성공적으로 저장되었습니다.')

          // 저장 성공 후 데이터 새로고침
          if (onDataRefresh && typeof onDataRefresh === 'function') {
            await onDataRefresh()
          }

          // 성공 후 편집 모드 종료
          setIsEditing(false)
        } else {
          console.error('타겟 데이터 저장 실패:', result)
          alert('타겟 데이터 저장에 실패했습니다.')
        }
      } else {
        // 변경사항이 없는 경우
        setIsEditing(false)
      }
    } catch (error) {
      console.error('타겟 데이터 저장 중 오류 발생:', error)
      alert('타겟 데이터 저장 중 오류가 발생했습니다.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card className='w-full mt-4'>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant='h5'>주차별 목표 매출</Typography>
          <Button
            variant='contained'
            color={isEditing ? 'success' : 'primary'}
            onClick={isEditing ? handleSaveChanges : handleEditToggle}
            disabled={isSaving}
          >
            {isSaving ? '저장 중...' : isEditing ? '저장하기' : '수정하기'}
          </Button>
        </Box>

        {(isEditing ? editedWeeklyTargets : weeklyTargets)?.map(week => (
          <Box key={`week-${week.week}`} sx={{ mb: 2 }}>
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
                onClick={() => handleToggleWeek(week.week)}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <IconButton size='small'>
                    {openWeeks[week.week] ? (
                      <ChevronUpIcon className='h-5 w-5' />
                    ) : (
                      <ChevronDownIcon className='h-5 w-5' />
                    )}
                  </IconButton>
                  <Typography variant='h6'>{week.week}주차</Typography>
                </Box>

                {isEditing ? (
                  <TextField
                    label='주차별 합계'
                    size='small'
                    value={formatNumberWithCommas(calculateWeekTotal(week.targets))}
                    onChange={e => handleWeekTargetChange(week.week, e.target.value)}
                    onClick={e => e.stopPropagation()}
                    InputProps={{
                      inputProps: {
                        inputMode: 'numeric',
                        pattern: '[0-9,]*'
                      }
                    }}
                    sx={{ width: '200px' }}
                  />
                ) : (
                  <Typography>합계: {formatNumberWithCommas(calculateWeekTotal(week.targets))}</Typography>
                )}
              </Box>

              <Collapse in={openWeeks[week.week]} timeout='auto' unmountOnExit>
                <TableContainer>
                  <Table size='small'>
                    <TableHead>
                      <TableRow>
                        <TableCell>날짜</TableCell>
                        <TableCell align='right'>타겟</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {week.targets.map(target => (
                        <TableRow key={target.id}>
                          <TableCell>{formatDate(target.date)}</TableCell>
                          <TableCell align='right'>
                            {isEditing ? (
                              <TextField
                                size='small'
                                value={formatNumberWithCommas(target.target)}
                                onChange={e => handleIndividualTargetChange(week.week, target.id, e.target.value)}
                                InputProps={{
                                  inputProps: {
                                    inputMode: 'numeric',
                                    pattern: '[0-9,]*',
                                    style: { textAlign: 'right' }
                                  }
                                }}
                              />
                            ) : (
                              formatNumberWithCommas(target.target)
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
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

export default DailyTargetCard
