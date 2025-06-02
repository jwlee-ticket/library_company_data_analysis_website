'use client'

import { useEffect, useRef, useState } from 'react'

// MUI 컴포넌트 임포트
import Tooltip from '@mui/material/Tooltip'
import IconButton from '@mui/material/IconButton'
import Popper from '@mui/material/Popper'
import Fade from '@mui/material/Fade'
import Paper from '@mui/material/Paper'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import MenuList from '@mui/material/MenuList'
import MenuItem from '@mui/material/MenuItem'

const LiveDropdown = ({ onLiveSelect }: { onLiveSelect: (liveName: string) => void }) => {
  const [open, setOpen] = useState(false)
  const [performanceOptions, setPerformanceOptions] = useState<string[]>([])
  const [selectedPerformance, setSelectedPerformance] = useState('공연 선택하기')

  const anchorRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    fetch('/api/marketing/get-live-list')
      .then(response => response.json())
      .then((data: string[]) => {
        setPerformanceOptions(data)
      })
      .catch(error => {
        console.error('공연 목록 불러오기 실패:', error)
      })
  }, [])

  const handleToggle = () => {
    setOpen(prev => !prev)
  }

  const handleClose = () => {
    setOpen(false)
  }

  const handleSelectPerformance = (performance: string) => {
    setSelectedPerformance(performance)
    onLiveSelect(performance) // 선택한 공연을 부모 컴포넌트로 전달
    handleClose()
  }

  return (
    <>
      <Tooltip title='' placement='bottom' className='rounded-lg'>
        <IconButton ref={anchorRef} onClick={handleToggle} className='text-textPrimary text-lg'>
          <span>{selectedPerformance}</span>
        </IconButton>
      </Tooltip>

      <Popper
        open={open}
        transition
        disablePortal
        placement='bottom-start'
        anchorEl={anchorRef.current}
        className='min-w-[160px] !mb-3 z-[1]'
      >
        {({ TransitionProps, placement }) => (
          <Fade
            {...TransitionProps}
            style={{ transformOrigin: placement === 'bottom-start' ? 'left top' : 'right top' }}
          >
            <Paper className='shadow-lg'>
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList>
                  {performanceOptions.map((performance, index) => (
                    <MenuItem key={index} onClick={() => handleSelectPerformance(performance)}>
                      {performance}
                    </MenuItem>
                  ))}
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Fade>
        )}
      </Popper>
    </>
  )
}

export default LiveDropdown
