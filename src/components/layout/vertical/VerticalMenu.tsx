'use client'

// MUI Imports
import { useEffect, useState } from 'react'

import { useTheme } from '@mui/material/styles'

// Third-party Imports
import PerfectScrollbar from 'react-perfect-scrollbar'

// Type Imports
import {
  HomeIcon,
  ClipboardDocumentListIcon,
  CloudArrowUpIcon,
  UsersIcon,
  PlayIcon,
  ClipboardIcon,
  ChartBarIcon
} from '@heroicons/react/24/solid'

import type { VerticalMenuContextProps } from '@menu/components/vertical-menu/Menu'

// Component Imports
import { Menu, MenuItem, SubMenu } from '@menu/vertical-menu'

// Hook Imports
import useVerticalNav from '@menu/hooks/useVerticalNav'

// Styled Component Imports
import StyledVerticalNavExpandIcon from '@menu/styles/vertical/StyledVerticalNavExpandIcon'

// Style Imports
import menuItemStyles from '@core/styles/vertical/menuItemStyles'
import menuSectionStyles from '@core/styles/vertical/menuSectionStyles'

type RenderExpandIconProps = {
  open?: boolean
  transitionDuration?: VerticalMenuContextProps['transitionDuration']
}

type Props = {
  scrollMenu: (container: any, isPerfectScrollbar: boolean) => void
}

// 세션 타입 정의
type SessionType = {
  role?: number
  isFileUploader?: boolean
  isLiveManager?: boolean
} | null

// 메뉴 아이템 타입 정의
type MenuItem = {
  id: string
  type: 'item' | 'submenu'
  label: string
  icon: JSX.Element
  href?: string
  visible: boolean
  children?: Array<{
    id: string
    label: string
    href: string
  }>
}

type UploadHistoryItem = {
  liveName: string
  uploadDate: string
  dayOfWeek: string
}

const RenderExpandIcon = ({ open, transitionDuration }: RenderExpandIconProps) => (
  <StyledVerticalNavExpandIcon open={open} transitionDuration={transitionDuration}>
    <i className='tabler-chevron-right' />
  </StyledVerticalNavExpandIcon>
)

const VerticalMenu = ({ scrollMenu }: Props) => {
  // Hooks
  const theme = useTheme()
  const verticalNavOptions = useVerticalNav()

  // Vars
  const { isBreakpointReached, transitionDuration } = verticalNavOptions

  const ScrollWrapper = isBreakpointReached ? 'div' : PerfectScrollbar

  // 로딩 상태 추가
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<SessionType>(null)
  const [isSessionLoaded, setIsSessionLoaded] = useState(false)
  const [uploadHistory, setUploadHistory] = useState<UploadHistoryItem[]>([])

  useEffect(() => {
    let isMounted = true

    async function fetchSession() {
      try {
        const res = await fetch('/api/session')
        const historyRes = await fetch('/api/navigation/get-upload-history')
        const data = await res.json()
        const historyData = await historyRes.json()

        if (isMounted) {
          setSession(data)
          setUploadHistory(historyData.uploadHistory)
          setLoading(true)
          setIsSessionLoaded(true) // 세션 로드 완료 표시
        }
      } catch (error) {
        console.error('세션 정보 가져오기 실패:', error)

        if (isMounted) {
          setLoading(false)
          setIsSessionLoaded(false) // 세션 로드 실패해도 완료로 표시
        }
      }
    }

    fetchSession()

    // 클린업 함수
    return () => {
      isMounted = false
    }
  }, [])

  // 날짜 포맷 함수
  const formatDate = (dateString: string, dayOfWeek: string): string => {
    if (!dateString) return '업데이트 없음'
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')

    return `${year}/${month}/${day} (${dayOfWeek})`
  }

  // 메뉴 항목 정의
  const menuItems: MenuItem[] = [
    // 대시보드는 항상 표시

    {
      id: 'play-dashboard',
      type: 'submenu',
      label: '대시보드 : 연뮤',
      icon: <HomeIcon className='h-5 w-5' />,
      children: [
        { id: 'play-total-paid', label: '통합 티켓 판매합계 : 총계', href: '/play-total-paid' },
        {
          id: 'play-total-weekly-ticket-sales',
          label: '통합 주간별 티켓 매수',
          href: '/play-total-weekly-ticket-sales'
        },
        { id: 'play-total-montly-sales', label: '월별 통합 매출', href: '/play-total-montly-sales' },
        { id: 'play-period-sales', label: '기간별 통합 매출', href: '/play-period-sales' },
        { id: 'play-weekly-target', label: '주간별 통합 매출', href: '/play-weekly-target' },
        { id: 'play-daily-target', label: '일간별 판매현황', href: '/play-daily-target' },
        { id: 'play-cast-sales', label: '캐스트별 매출', href: '/play-cast-sales' }
      ],
      visible: true // 항상 표시
    },
    {
      id: 'concert-dashboard',
      type: 'submenu',
      label: '대시보드 : 콘서트',
      icon: <HomeIcon className='h-5 w-5' />,
      children: [
        { id: 'concert-total', label: '통합 현황', href: '/concert-total' },
        {
          id: 'concert-individual',
          label: '개별 현황',
          href: '/concert-individual'
        }
      ],
      visible: true // 항상 표시
    },

    // 마케팅: 마케터 권한 필요
    {
      id: 'monthly-etc',
      type: 'item',
      label: '월간 비고',
      icon: <ClipboardDocumentListIcon className='h-5 w-5' />,
      href: '/monthly-etc',
      visible: Boolean(session?.isLiveManager ?? false)
    },

    // 공연관리: 역할이 0 또는 1이거나 마케터인 경우 표시
    {
      id: 'live',
      type: 'item',
      label: '공연관리',
      icon: <PlayIcon className='h-5 w-5' />,
      href: '/live-list',
      visible: Boolean(session && (session.role === 0 || session.role === 1 || session.isLiveManager))
    },

    // 계정관리: 역할이 0 또는 1인 경우 표시
    {
      id: 'users',
      type: 'item',
      label: '계정관리',
      icon: <UsersIcon className='h-5 w-5' />,
      href: '/users',
      visible: Boolean(session && (session.role === 0 || session.role === 1))
    },

    // 데이터 현황: 항상 표시
    {
      id: 'data-dashboard',
      type: 'item',
      label: '데이터 현황',
      icon: <ClipboardIcon className='h-5 w-5' />,
      href: '/data-dashboard',
      visible: true // 항상 표시
    },

    // 데이터 입력: 라이브 매니저인 경우 표시
    {
      id: 'upload',
      type: 'item',
      label: '데이터 입력',
      icon: <CloudArrowUpIcon className='h-5 w-5' />,
      href: '/upload',
      visible: Boolean(session?.isFileUploader ?? false)
    },
    {
      id: 'report',
      type: 'item',
      label: '리포트',
      icon: <ChartBarIcon className='h-5 w-5' />,
      href: '/report',
      visible: true
    }
  ]

  // 버튼의 실제 가시성 결정 - 세션 로드 전에는 모두 표시
  const getVisibility = (item: MenuItem) => {
    if (!isSessionLoaded) return false

    return item.visible
  }

  return (
    <ScrollWrapper
      {...(isBreakpointReached
        ? {
            className: 'bs-full overflow-y-auto overflow-x-hidden',
            onScroll: container => scrollMenu(container, false)
          }
        : {
            options: { wheelPropagation: false, suppressScrollX: true },
            onScrollY: container => scrollMenu(container, true)
          })}
    >
      <Menu
        popoutMenuOffset={{ mainAxis: 23 }}
        menuItemStyles={menuItemStyles(verticalNavOptions, theme)}
        renderExpandIcon={({ open }) => <RenderExpandIcon open={open} transitionDuration={transitionDuration} />}
        renderExpandedMenuItemIcon={{ icon: <i className='tabler-circle text-xs' /> }}
        menuSectionStyles={menuSectionStyles(verticalNavOptions, theme)}
      >
        {/* 메뉴 아이템 렌더링 */}
        {menuItems.map(item => {
          // 세션 로드 중이거나 가시성이 true인 경우에만 렌더링
          if (loading && getVisibility(item)) {
            if (item.type === 'submenu' && item.children) {
              return (
                <SubMenu key={item.id} label={item.label} icon={item.icon}>
                  {item.children.map(child => (
                    <MenuItem key={child.id} href={child.href}>
                      {child.label}
                    </MenuItem>
                  ))}
                </SubMenu>
              )
            } else {
              return (
                <MenuItem key={item.id} href={item.href} icon={item.icon}>
                  {item.label}
                </MenuItem>
              )
            }
          }

          // 가시성이 false인 경우 공백 렌더링 (레이아웃 유지용)

          return null
        })}
        {/* 최근 업데이트 시간 섹션 - 메뉴 항목 외부에 별도로 추가 */}
        {isSessionLoaded && (
          <div style={{ marginTop: '16px' }}>
            {/* 헤더 */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '8px 16px',
                fontWeight: 'bold',
                fontSize: '0.875rem',
                color: theme.palette.mode === 'light' ? '#333' : '#eee'
              }}
            >
              <span>판매현황 업데이트일</span>
            </div>

            {/* 업로드 히스토리 목록 */}
            <div
              style={{
                overflowY: 'auto',
                margin: '0 16px 16px 16px'
              }}
            >
              {uploadHistory.length === 0 ? (
                <div style={{ padding: '12px 16px', fontSize: '0.875rem', color: '#666' }}>
                  업데이트 내역이 없습니다.
                </div>
              ) : (
                uploadHistory.map((historyItem, index) => (
                  <div
                    key={`history-${index}`}
                    style={{
                      marginBottom: '8px',
                      paddingBottom: '8px',
                      borderBottom:
                        index < uploadHistory.length - 1
                          ? `1px solid ${theme.palette.mode === 'light' ? '#e0e0e0' : '#444'}`
                          : 'none'
                    }}
                  >
                    <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{historyItem.liveName}</div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between'
                      }}
                    >
                      <span>{formatDate(historyItem.uploadDate, historyItem.dayOfWeek)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </Menu>
    </ScrollWrapper>
  )
}

export default VerticalMenu
