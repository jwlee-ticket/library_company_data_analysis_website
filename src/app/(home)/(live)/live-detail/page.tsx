'use client'

import { useEffect, useState } from 'react'

import { useSearchParams, useRouter } from 'next/navigation'

import {
  CircularProgress,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Grid,
  FormControlLabel,
  Switch,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput
} from '@mui/material'

import DailyTargetCard from '@/components/DailyTarget'

import MarketingCard from '@/components/MarketingTargetCard'

// 날짜 피커 대신 일반 텍스트 필드 사용

const LiveDetailPage = () => {
  //

  const searchParams = useSearchParams()

  const router = useRouter()

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '설정되지 않음'

    // 날짜만 표시 (시간 제외)
    return new Date(dateString).toLocaleDateString('ko-KR')
  }

  // 타입 정의를 명시적으로 추가
  interface LiveData {
    id?: number
    liveId: string
    isLive: boolean
    category: string
    liveName: string
    location: string | null
    showStartDate: string | null
    showEndDate: string | null
    saleStartDate: string | null
    saleEndDate: string | null
    runningTime: number | null
    targetShare: number | null
    bep: number | null
    previewEndingDate: string | null
    latestRecordDate?: string | null
    createdAt?: string
    dailyTarget?: any[]
    showTotalSeatNumber?: number
    concertDateTime?: string | null
    concertSeatNumberR?: number | null
    concertSeatNumberS?: number | null
    concertSeatNumberA?: number | null
    concertSeatNumberB?: number | null
    concertSeatNumberVip?: number | null
    [key: string]: any // 인덱스 시그니처 추가
  }

  // 타겟 및 주차별 타겟 타입 정의
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

  interface LiveDetailData {
    status: number
    live: LiveData
    weeklyTargets?: WeeklyTarget[] // 주차별 타겟 데이터 추가
  }

  interface MarketingData {
    id: number
    weekNumber: number
    salesMarketing: string
    promotion: string
    weekStartDate: string
    weekEndDate: string
    etc: string
  }

  const [liveDetail, setLiveDetail] = useState<LiveDetailData | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [isEditing, setIsEditing] = useState<boolean>(false)
  const [editedData, setEditedData] = useState<LiveData | null>(null)
  const [isSaving, setIsSaving] = useState<boolean>(false)
  const [currentLiveId, setCurrentLiveId] = useState<string | null>(null)
  const [initialLoad, setInitialLoad] = useState<boolean>(true)

  const [weeklyTargets, setWeeklyTargets] = useState<WeeklyTarget[]>([])
  const [refreshKey, setRefreshKey] = useState(0)
  const [totalTarget, setTotalTarget] = useState<number>(0)
  const [marketingData, setMarketingData] = useState<MarketingData[]>([])

  useEffect(() => {
    const urlLiveId = searchParams.get('liveId')

    if (urlLiveId) {
      setCurrentLiveId(urlLiveId)
    }
  }, [searchParams])

  useEffect(() => {
    //

    if (currentLiveId) {
      fetchLiveDetail(currentLiveId)
    }
  }, [currentLiveId])

  const fetchLiveDetail = async (liveIdToFetch: string) => {
    setLoading(true)

    try {
      const response = await fetch(`/api/live/get-live-detail-data?liveId=${liveIdToFetch}`)
      const data = await response.json()

      // BEP 필드가 문자열로 들어온 경우 처리
      if (data.live && data.live.bep !== undefined) {
        // 문자열이면 숫자로 변환

        if (typeof data.live.bep === 'string') {
          data.live.bep = parseFormattedNumber(data.live.bep)
        }
      }

      setLiveDetail(data)

      // Initialize editedData with the live details

      setEditedData(data.live)
      setTotalTarget(data.totalTarget || 0)
      setMarketingData(data.marketingData || [])
      console.log('주차별 타겟 데이터 1:', data.weeklyTargets)

      // weeklyTargets 데이터 설정

      if (data.weeklyTargets) {
        setWeeklyTargets(data.weeklyTargets)
        console.log('주차별 타겟 데이터 2:', data.weeklyTargets)
      }

      // URL과 현재 liveId가 다르면 URL 업데이트

      if (!initialLoad && data.live.liveId !== searchParams.get('liveId')) {
        // URL 업데이트

        updateUrl(data.live.liveId)
      }

      setInitialLoad(false)
    } catch (error) {
      console.error('라이브 상세 데이터 가져오기 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  // URL 업데이트 함수

  const updateUrl = (newLiveId: string) => {
    // 현재 URL에서 liveId 파라미터만 변경

    const params = new URLSearchParams(window.location.search)

    params.set('liveId', newLiveId)

    // URL 히스토리 대체 (뒤로가기에 영향을 주지 않음)

    router.replace(`${window.location.pathname}?${params.toString()}`)
  }

  const handleEditToggle = () => {
    setIsEditing(!isEditing)
  }

  const handleInputChange = (field: string, value: any) => {
    setEditedData(prev => {
      if (prev === null) return prev

      return {
        ...prev,
        [field]: value
      }
    })
  }

  const handleDateChange = (field: string, eventValue: string | null) => {
    setEditedData(prev => {
      if (prev === null) return prev

      // 날짜 값이 있는 경우 처리

      if (eventValue && eventValue.trim() !== '') {
        // 입력된 날짜를 정오로 설정하여 타임존 문제 방지

        const correctedDate = parseInputDate(eventValue)

        return {
          ...prev,
          [field]: correctedDate.toISOString()
        }
      } else {
        return {
          ...prev,
          [field]: null
        }
      }
    })
  }

  const handleConcertDateChange = (field: string, eventValue: string | null) => {
    setEditedData(prev => {
      if (prev === null) return prev

      // 날짜 값이 있는 경우 처리
      if (eventValue && eventValue.trim() !== '') {
        // 입력된 datetime-local 값을 파싱
        const localDate = new Date(eventValue)

        // 사용자가 입력한 시간을 UTC로 변환하여 저장
        const utcDate = new Date(
          Date.UTC(
            localDate.getFullYear(),
            localDate.getMonth(),
            localDate.getDate(),
            localDate.getHours(),
            localDate.getMinutes()
          )
        )

        return {
          ...prev,
          [field]: utcDate.toISOString()
        }
      } else {
        return {
          ...prev,
          [field]: null
        }
      }
    })
  }

  const handleSaveChanges = async () => {
    setIsSaving(true)

    // Check if there are actual changes

    let hasChanges = false

    if (liveDetail && editedData) {
      const originalData = liveDetail.live

      for (const key in editedData) {
        if (editedData[key] !== originalData[key]) {
          hasChanges = true
          break
        }
      }

      if (hasChanges) {
        try {
          const response = await fetch('/api/live/change-live-detail-data', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              perLiveId: currentLiveId,
              updatedData: editedData
            })
          })

          const result = await response.json()

          if (result.data.status === 200) {
            // 성공한 경우 새로운 liveId 설정

            if (result.data && result.data.liveId) {
              // 새 liveId로 상태 업데이트 - 이것이 fetchLiveDetail을 트리거함

              if (currentLiveId !== result.data.liveId) {
                setCurrentLiveId(result.data.liveId)
              } else {
                fetchLiveDetail(result.data.liveId)
              }
            } else {
              // 새 liveId가 없으면 기존 liveId로 다시 데이터 가져오기

              fetchLiveDetail(currentLiveId || '')
            }

            setRefreshKey(prev => prev + 1)

            setIsEditing(false)
            alert('데이터가 성공적으로 저장되었습니다.')
          } else {
            console.error('데이터 저장 실패:', result)
            alert('데이터 저장에 실패했습니다.')
          }
        } catch (error) {
          console.error('데이터 저장 중 오류 발생:', error)
          alert('데이터 저장 중 오류가 발생했습니다.')
        }
      } else {
        // No changes were made

        setIsEditing(false)
      }
    } else {
      setIsEditing(false)
    }

    setIsSaving(false)
  }

  // 천 단위 구분자가 있는 숫자 포맷팅 함수

  const formatNumberWithCommas = (value: number | string | null | undefined): string => {
    if (value === null || value === undefined || value === '') return ''

    // 문자열이 들어온 경우에도 처리 가능하도록

    let numValue: number

    if (typeof value === 'string') {
      // 문자열에서 쉼표 제거 후 숫자로 변환

      numValue = parseFloat(value.replace(/,/g, ''))
      if (isNaN(numValue)) return ''
    } else if (typeof value === 'number') {
      numValue = value
    } else {
      return ''
    }

    return numValue.toLocaleString('ko-KR')
  }

  // 천 단위 구분자가 있는 입력을 숫자로 변환하는 함수

  const parseFormattedNumber = (value: string): number | null => {
    if (!value) return null

    // 쉼표 제거 후 숫자로 변환

    const numericValue = Number(value.replace(/,/g, ''))

    return isNaN(numericValue) ? null : numericValue
  }

  // 타임존 문제 해결을 위한 날짜 처리 함수

  const formatDateForInput = (dateString: string | null | undefined): string => {
    if (!dateString) return ''

    // 날짜만 YYYY-MM-DD 형식으로 반환 (타임존 오프셋 없이)

    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')

    return `${year}-${month}-${day}`
  }

  // 날짜와 시간을 24시간 형식으로 포맷팅하는 함수
  const formatDateTimeForInput = (dateTimeString: string | null | undefined): string => {
    if (!dateTimeString) return ''

    // ISO 문자열에서 직접 년, 월, 일, 시간, 분을 추출
    // Z가 포함된 UTC 시간을 그대로 사용
    const isoDate = new Date(dateTimeString)

    // UTC 시간을 사용하여 표시
    const year = isoDate.getUTCFullYear()
    const month = String(isoDate.getUTCMonth() + 1).padStart(2, '0')
    const day = String(isoDate.getUTCDate()).padStart(2, '0')
    const hours = String(isoDate.getUTCHours()).padStart(2, '0')
    const minutes = String(isoDate.getUTCMinutes()).padStart(2, '0')

    if (isEditing) {
      // 편집 모드일 때는 datetime-local 입력용 포맷
      return `${year}-${month}-${day}T${hours}:${minutes}`
    } else {
      // 표시 모드일 때는 사용자 친화적인 포맷
      return `${year}-${month}-${day} ${hours}:${minutes}`
    }
  }

  // 날짜 입력값을 ISO 문자열로 변환 (타임존 보정)

  const parseInputDate = (dateString: string): Date => {
    // YYYY-MM-DD 형식의 입력을 파싱하여 현지 시간으로 설정

    const [year, month, day] = dateString.split('-').map(num => parseInt(num, 10))

    return new Date(year, month - 1, day, 0, 0, 0) // 정오로 설정하여 타임존 문제 방지
  }

  const refreshWeeklyTargets = async () => {
    if (currentLiveId) {
      try {
        fetchLiveDetail(currentLiveId)
      } catch (error) {
        console.error('주차별 타겟 데이터 새로고침 실패:', error)
      }
    }
  }

  if (loading) {
    return (
      <div className='flex justify-center items-center h-full'>
        <CircularProgress />
      </div>
    )
  }

  return (
    <div>
      <Card className='w-full'>
        {editedData?.category === '콘서트' ? (
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <div className='flex items-center gap-3'>
                <Typography variant='h4' gutterBottom>
                  공연 상세 정보
                </Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={editedData?.isLive || false}
                      onChange={e => handleInputChange('isLive', e.target.checked)}
                      disabled={!isEditing}
                    />
                  }
                  label='라이브 여부'
                />
                <h1 className='text-[15px] font-bold'>공연ID : {editedData?.liveId}</h1>
              </div>

              <Button
                variant='contained'
                color={isEditing ? 'success' : 'primary'}
                onClick={isEditing ? handleSaveChanges : handleEditToggle}
                disabled={isSaving}
              >
                {isSaving ? '저장 중...' : isEditing ? '저장하기' : '수정하기'}
              </Button>
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label='공연명'
                  value={editedData?.liveName || ''}
                  onChange={e => handleInputChange('liveName', e.target.value)}
                  margin='normal'
                  disabled={!isEditing}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label='카테고리'
                  value={editedData?.category || ''}
                  onChange={e => handleInputChange('category', e.target.value)}
                  margin='normal'
                  disabled={true}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label='공연 장소'
                  value={editedData?.location || ''}
                  onChange={e => handleInputChange('location', e.target.value)}
                  margin='normal'
                  disabled={!isEditing}
                  placeholder='장소를 입력하세요'
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label='공연 시간 (분)'
                  type='integer'
                  value={editedData?.runningTime || ''}
                  onChange={e => handleInputChange('runningTime', e.target.value ? Number(e.target.value) : null)}
                  margin='normal'
                  disabled={!isEditing}
                  placeholder='공연 시간을 입력하세요'
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label='공연 일시'
                  type='datetime-local'
                  value={formatDateTimeForInput(editedData?.concertDateTime)}
                  onChange={e => handleConcertDateChange('concertDateTime', e.target.value)}
                  margin='normal'
                  disabled={!isEditing}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label='프리뷰 종료일'
                  type={isEditing ? 'date' : 'text'}
                  value={
                    isEditing
                      ? formatDateForInput(editedData?.previewEndingDate)
                      : formatDate(editedData?.previewEndingDate)
                  }
                  onChange={e => handleDateChange('previewEndingDate', e.target.value)}
                  margin='normal'
                  disabled={!isEditing}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label='판매 시작일'
                  type={isEditing ? 'date' : 'text'}
                  value={
                    isEditing ? formatDateForInput(editedData?.saleStartDate) : formatDate(editedData?.saleStartDate)
                  }
                  onChange={e => handleDateChange('saleStartDate', e.target.value)}
                  margin='normal'
                  disabled={!isEditing}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label='판매 종료일'
                  type={isEditing ? 'date' : 'text'}
                  value={isEditing ? formatDateForInput(editedData?.saleEndDate) : formatDate(editedData?.saleEndDate)}
                  onChange={e => handleDateChange('saleEndDate', e.target.value)}
                  margin='normal'
                  disabled={!isEditing}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label='목표 점유율 (%)'
                  type='number'
                  value={editedData?.targetShare || ''}
                  onChange={e => handleInputChange('targetShare', e.target.value ? Number(e.target.value) : null)}
                  margin='normal'
                  disabled={!isEditing}
                  placeholder='목표 점유율을 입력하세요'
                />
              </Grid>

              <Grid item xs={12} md={6}>
                {isEditing ? (
                  <TextField
                    fullWidth
                    label='손익분기점 (BEP)'
                    type='text'
                    value={formatNumberWithCommas(editedData?.bep)}
                    onChange={e => {
                      // 숫자와 쉼표만 허용
                      const value = e.target.value.replace(/[^0-9,]/g, '')

                      // 쉼표 제거하고 숫자로 변환
                      const numValue = value ? parseFormattedNumber(value) : null

                      // 상태 업데이트
                      handleInputChange('bep', numValue)
                    }}
                    margin='normal'
                    placeholder='BEP를 입력하세요'
                    InputProps={{
                      inputProps: {
                        inputMode: 'numeric',
                        pattern: '[0-9,]*'
                      }
                    }}
                  />
                ) : (
                  <TextField
                    fullWidth
                    label='손익분기점 (BEP)'
                    value={formatNumberWithCommas(editedData?.bep)}
                    margin='normal'
                    disabled
                  />
                )}
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label='목표 매출액'
                  value={formatNumberWithCommas(Number(totalTarget) ?? 0)}
                  margin='normal'
                  disabled={true}
                  placeholder='목표 점유율을 입력하세요'
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label='회차 당 VIP좌석 수'
                  type='integer'
                  value={editedData?.concertSeatNumberVip || ''}
                  onChange={e =>
                    handleInputChange('concertSeatNumberVip', e.target.value ? Number(e.target.value) : null)
                  }
                  margin='normal'
                  disabled={!isEditing}
                  placeholder='회차 당 R 좌석 수를 입력하세요'
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label='회차 당 R좌석 수'
                  type='integer'
                  value={editedData?.concertSeatNumberR || ''}
                  onChange={e =>
                    handleInputChange('concertSeatNumberR', e.target.value ? Number(e.target.value) : null)
                  }
                  margin='normal'
                  disabled={!isEditing}
                  placeholder='회차 당 R 좌석 수를 입력하세요'
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label='회차 당 S좌석 수'
                  type='integer'
                  value={editedData?.concertSeatNumberS || ''}
                  onChange={e =>
                    handleInputChange('concertSeatNumberS', e.target.value ? Number(e.target.value) : null)
                  }
                  margin='normal'
                  disabled={!isEditing}
                  placeholder='회차 당 S 좌석 수를 입력하세요'
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label='회차 당 A좌석 수'
                  type='integer'
                  value={editedData?.concertSeatNumberA || ''}
                  onChange={e =>
                    handleInputChange('concertSeatNumberA', e.target.value ? Number(e.target.value) : null)
                  }
                  margin='normal'
                  disabled={!isEditing}
                  placeholder='회차 당 A 좌석 수를 입력하세요'
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label='회차 당 B좌석 수'
                  type='integer'
                  value={editedData?.concertSeatNumberB || ''}
                  onChange={e =>
                    handleInputChange('concertSeatNumberB', e.target.value ? Number(e.target.value) : null)
                  }
                  margin='normal'
                  disabled={!isEditing}
                  placeholder='회차 당 B 좌석 수를 입력하세요'
                />
              </Grid>
            </Grid>
          </CardContent>
        ) : (
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <div className='flex items-center gap-3'>
                <Typography variant='h4' gutterBottom>
                  공연 상세 정보
                </Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={editedData?.isLive || false}
                      onChange={e => handleInputChange('isLive', e.target.checked)}
                      disabled={!isEditing}
                    />
                  }
                  label='라이브 여부'
                />
                <h1 className='text-[15px] font-bold'>공연ID : {editedData?.liveId}</h1>
              </div>

              <Button
                variant='contained'
                color={isEditing ? 'success' : 'primary'}
                onClick={isEditing ? handleSaveChanges : handleEditToggle}
                disabled={isSaving}
              >
                {isSaving ? '저장 중...' : isEditing ? '저장하기' : '수정하기'}
              </Button>
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label='공연명'
                  value={editedData?.liveName || ''}
                  onChange={e => handleInputChange('liveName', e.target.value)}
                  margin='normal'
                  disabled={!isEditing}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin='normal'>
                  <InputLabel>카테고리</InputLabel>
                  <Select
                    label='카테고리'
                    value={editedData?.category || ''}
                    onChange={e => handleInputChange('category', e.target.value)}
                    disabled={!isEditing}
                    input={<OutlinedInput label='카테고리' />}
                  >
                    {['연극', '뮤지컬'].map((category: any) => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label='공연 장소'
                  value={editedData?.location || ''}
                  onChange={e => handleInputChange('location', e.target.value)}
                  margin='normal'
                  disabled={!isEditing}
                  placeholder='장소를 입력하세요'
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label='공연 시간 (분)'
                  type='integer'
                  value={editedData?.runningTime || ''}
                  onChange={e => handleInputChange('runningTime', e.target.value ? Number(e.target.value) : null)}
                  margin='normal'
                  disabled={!isEditing}
                  placeholder='공연 시간을 입력하세요'
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label='공연 시작일'
                  type={isEditing ? 'date' : 'text'}
                  value={
                    isEditing ? formatDateForInput(editedData?.showStartDate) : formatDate(editedData?.showStartDate)
                  }
                  onChange={e => handleDateChange('showStartDate', e.target.value)}
                  margin='normal'
                  disabled={!isEditing}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label='공연 종료일'
                  type={isEditing ? 'date' : 'text'}
                  value={isEditing ? formatDateForInput(editedData?.showEndDate) : formatDate(editedData?.showEndDate)}
                  onChange={e => handleDateChange('showEndDate', e.target.value)}
                  margin='normal'
                  disabled={!isEditing}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label='판매 시작일'
                  type={isEditing ? 'date' : 'text'}
                  value={
                    isEditing ? formatDateForInput(editedData?.saleStartDate) : formatDate(editedData?.saleStartDate)
                  }
                  onChange={e => handleDateChange('saleStartDate', e.target.value)}
                  margin='normal'
                  disabled={!isEditing}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label='판매 종료일'
                  type={isEditing ? 'date' : 'text'}
                  value={isEditing ? formatDateForInput(editedData?.saleEndDate) : formatDate(editedData?.saleEndDate)}
                  onChange={e => handleDateChange('saleEndDate', e.target.value)}
                  margin='normal'
                  disabled={!isEditing}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label='프리뷰 종료일'
                  type={isEditing ? 'date' : 'text'}
                  value={
                    isEditing
                      ? formatDateForInput(editedData?.previewEndingDate)
                      : formatDate(editedData?.previewEndingDate)
                  }
                  onChange={e => handleDateChange('previewEndingDate', e.target.value)}
                  margin='normal'
                  disabled={!isEditing}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label='목표 점유율 (%)'
                  type='number'
                  value={editedData?.targetShare || ''}
                  onChange={e => handleInputChange('targetShare', e.target.value ? Number(e.target.value) : null)}
                  margin='normal'
                  disabled={!isEditing}
                  placeholder='목표 점유율을 입력하세요'
                />
              </Grid>

              <Grid item xs={12} md={6}>
                {isEditing ? (
                  <TextField
                    fullWidth
                    label='손익분기점 (BEP)'
                    type='text'
                    value={formatNumberWithCommas(editedData?.bep)}
                    onChange={e => {
                      // 숫자와 쉼표만 허용
                      const value = e.target.value.replace(/[^0-9,]/g, '')

                      // 쉼표 제거하고 숫자로 변환
                      const numValue = value ? parseFormattedNumber(value) : null

                      // 상태 업데이트
                      handleInputChange('bep', numValue)
                    }}
                    margin='normal'
                    placeholder='BEP를 입력하세요'
                    InputProps={{
                      inputProps: {
                        inputMode: 'numeric',
                        pattern: '[0-9,]*'
                      }
                    }}
                  />
                ) : (
                  <TextField
                    fullWidth
                    label='손익분기점 (BEP)'
                    value={formatNumberWithCommas(editedData?.bep)}
                    margin='normal'
                    disabled
                  />
                )}
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label='목표 매출액'
                  value={formatNumberWithCommas(Number(totalTarget) ?? 0)}
                  margin='normal'
                  disabled={true}
                  placeholder='목표 점유율을 입력하세요'
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label='회차 당 총 좌석 수'
                  type='integer'
                  value={editedData?.showTotalSeatNumber || ''}
                  onChange={e =>
                    handleInputChange('showTotalSeatNumber', e.target.value ? Number(e.target.value) : null)
                  }
                  margin='normal'
                  disabled={!isEditing}
                  placeholder='회차 당 총 좌석 수를 입력하세요'
                />
              </Grid>
            </Grid>
          </CardContent>
        )}
      </Card>

      {/* 주차별 타겟 데이터 카드 추가 */}
      {/* 주차별 타겟 데이터 카드 추가 */}
      {weeklyTargets && weeklyTargets.length > 0 && (
        <DailyTargetCard
          weeklyTargets={weeklyTargets}
          liveId={currentLiveId || ''}
          onDataRefresh={refreshWeeklyTargets} // 새로고침 함수 전달
          refreshKey={refreshKey} // 새로운 프롭스 추가
        />
      )}

      {/* 마케팅 데이터 카드 - 기존 코드에서 이 부분 변경 */}
      {marketingData && marketingData.length > 0 && (
        <MarketingCard
          marketingData={marketingData}
          liveId={currentLiveId || ''}
          onDataRefresh={refreshWeeklyTargets}
          refreshKey={refreshKey}
        />
      )}
    </div>
  )
}

export default LiveDetailPage
