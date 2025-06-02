'use client'

import { useState } from 'react'

import { Card, CardContent, Typography, Button, Grid, Box, CircularProgress } from '@mui/material'

const ReportPage = () => {
  const [loading, setLoading] = useState<boolean>(false)
  const [currentReport, setCurrentReport] = useState<string | null>(null)

  // 리포트 가져오기 함수
  const fetchReport = async (endpoint: string, reportType: string) => {
    setLoading(true)
    setCurrentReport(reportType)

    try {
      const response = await fetch(`/api/report/${endpoint}`)
      const data = await response.json()

      // 응답 메시지에 따라 알림 표시
      if (data.message) {
        alert(data.message)
      }

      // 여기에 데이터 처리 로직 추가 가능
      console.log(`${reportType} 데이터:`, data)
    } catch (error) {
      console.error(`${reportType} 데이터 가져오기 실패:`, error)
      alert(`${reportType} 데이터를 가져오는 중 오류가 발생했습니다.`)
    } finally {
      setLoading(false)
    }
  }

  // 버튼 데이터
  const reportButtons = [
    {
      title: '일간 공연 현황',
      endpoint: 'get-daily-report',
      type: 'daily'
    },
    {
      title: '공연별 주간 공연 현황',
      endpoint: 'get-weekly-report',
      type: 'weekly'
    },
    {
      title: '최종 손익 전망',
      endpoint: 'get-est-profit-report',
      type: 'profit'
    },
    {
      title: '공연별 주차별 평균 점유율',
      endpoint: 'get-avg-share-report',
      type: 'share'
    },
    {
      title: '콘서트 일간 공연 현황',
      endpoint: 'get-concert-total-sales-report',
      type: 'concert-total-sales'
    }
  ]

  return (
    <div>
      <Card className='w-full mb-4'>
        <CardContent>
          <Typography variant='h4' gutterBottom>
            리포트 페이지
          </Typography>
          <Typography variant='body1' gutterBottom className='mb-4'>
            원하는 리포트 유형을 선택하세요.
          </Typography>

          <Grid container spacing={3}>
            {reportButtons.map(button => (
              <Grid item xs={12} sm={6} md={3} key={button.type}>
                <Button
                  variant='contained'
                  color='primary'
                  fullWidth
                  onClick={() => fetchReport(button.endpoint, button.type)}
                  disabled={loading && currentReport === button.type}
                  sx={{
                    height: '64px',
                    justifyContent: 'center',
                    textAlign: 'center',
                    lineHeight: 1.2
                  }}
                >
                  {loading && currentReport === button.type ? (
                    <CircularProgress size={24} color='inherit' />
                  ) : (
                    button.title
                  )}
                </Button>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* 여기에 리포트 내용을 표시하는 컴포넌트를 추가할 수 있습니다 */}
      <Box className='mt-4'>
        {/* 선택한 리포트에 따라 다른 컴포넌트를 조건부 렌더링 */}
        {currentReport === 'daily' && (
          <Card>
            <CardContent>
              <Typography variant='h5'>일간 공연 현황</Typography>
              {loading ? (
                <Box display='flex' justifyContent='center' my={4}>
                  <CircularProgress />
                </Box>
              ) : (
                <Typography variant='body1'>슬랙에 전송되었습니다.</Typography>
              )}
            </CardContent>
          </Card>
        )}

        {currentReport === 'weekly' && (
          <Card>
            <CardContent>
              <Typography variant='h5'>공연별 주간 공연 현황</Typography>
              {loading ? (
                <Box display='flex' justifyContent='center' my={4}>
                  <CircularProgress />
                </Box>
              ) : (
                <Typography variant='body1'>슬랙에 전송되었습니다.</Typography>
              )}
            </CardContent>
          </Card>
        )}

        {currentReport === 'profit' && (
          <Card>
            <CardContent>
              <Typography variant='h5'>최종 손익 전망</Typography>
              {loading ? (
                <Box display='flex' justifyContent='center' my={4}>
                  <CircularProgress />
                </Box>
              ) : (
                <Typography variant='body1'>슬랙에 전송되었습니다.</Typography>
              )}
            </CardContent>
          </Card>
        )}

        {currentReport === 'share' && (
          <Card>
            <CardContent>
              <Typography variant='h5'>공연별 주차별 평균 점유율</Typography>
              {loading ? (
                <Box display='flex' justifyContent='center' my={4}>
                  <CircularProgress />
                </Box>
              ) : (
                <Typography variant='body1'>슬랙에 전송되었습니다.</Typography>
              )}
            </CardContent>
          </Card>
        )}

        {currentReport === 'concert-total-sales' && (
          <Card>
            <CardContent>
              <Typography variant='h5'>콘서트 일간 공연 현황</Typography>
            </CardContent>
          </Card>
        )}
      </Box>
    </div>
  )
}

export default ReportPage
