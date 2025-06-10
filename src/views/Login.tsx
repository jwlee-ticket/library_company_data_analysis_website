'use client'

// React Imports
import { useState } from 'react'

// Next Imports
import { useRouter } from 'next/navigation'

// MUI Imports
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Checkbox from '@mui/material/Checkbox'
import Button from '@mui/material/Button'
import FormControlLabel from '@mui/material/FormControlLabel'

// Third-party Imports
import classnames from 'classnames'

// Component Imports
import Link from '@components/Link'
import Logo from '@components/layout/shared/Logo'
import CustomTextField from '@core/components/mui/TextField'

// Config Imports
import themeConfig from '@configs/themeConfig'

// Hook Imports
import { useSettings } from '@core/hooks/useSettings'

const LoginV2 = () => {
  // States
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isRemember, setIsRemember] = useState(true)
  const [isPasswordShown, setIsPasswordShown] = useState(false)

  // Hooks
  const router = useRouter()
  const { settings } = useSettings()

  const handleClickShowPassword = () => setIsPasswordShown(show => !show)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const payload = { email, password, isRemember }

    try {
      const response = await fetch('/api/login/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      const result = await response.json()

      if (response.ok && result.code === 200) {
        // 로그인 성공: 백엔드에서 세션 쿠키가 설정된 상태이므로, play-period-sales로 리다이렉트
        router.push('/play-total-paid')
      } else {
        alert(result.error || result.message || '로그인 실패')
      }
    } catch (error) {
      console.error('로그인 요청 에러:', error)
      alert('로그인 요청 중 오류가 발생했습니다.')
    }
  }

  return (
    <div className='flex bs-full justify-center'>
      <div
        className={classnames(
          'flex bs-full items-center justify-center flex-1 min-bs-[100dvh] relative p-6 max-md:hidden',
          {
            'border-ie': settings.skin === 'bordered'
          }
        )}
      >
        <h1>LIBRARY COMPANY</h1>
        {/* <LoginIllustration src={characterIllustration} alt='character-illustration' />
        {!hidden && (
          <MaskImg
            alt='mask'
            src={authBackground}
            className={classnames({ 'scale-x-[-1]': theme.direction === 'rtl' })}
          />
        )} */}
      </div>
      <div className='flex justify-center items-center bs-full bg-backgroundPaper !min-is-full p-6 md:!min-is-[unset] md:p-12 md:is-[480px]'>
        <Link className='absolute block-start-5 sm:block-start-[33px] inline-start-6 sm:inline-start-[38px]'>
          <Logo />
        </Link>
        <div className='flex flex-col gap-6 is-full sm:is-auto md:is-full sm:max-is-[400px] md:max-is-[unset] mbs-11 sm:mbs-14 md:mbs-0'>
          <div className='flex flex-col gap-1'>
            <Typography variant='h4'>{`${themeConfig.templateName}에 오신걸 환영합니다! 👋🏻`}</Typography>
            <Typography>계정정보를 입력하고 로그인해 주세요</Typography>
          </div>
          <form
            noValidate
            autoComplete='off'
            onSubmit={e => {
              e.preventDefault()
              router.push('/')
            }}
            className='flex flex-col gap-5'
          >
            <CustomTextField
              autoFocus
              fullWidth
              label='Email'
              placeholder='Enter your email'
              onChange={e => setEmail(e.target.value)}
            />
            <CustomTextField
              fullWidth
              label='Password'
              placeholder='············'
              id='outlined-adornment-password'
              type={isPasswordShown ? 'text' : 'password'}
              onChange={e => setPassword(e.target.value)}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position='end'>
                      <IconButton edge='end' onClick={handleClickShowPassword} onMouseDown={e => e.preventDefault()}>
                        <i className={isPasswordShown ? 'tabler-eye-off' : 'tabler-eye'} />
                      </IconButton>
                    </InputAdornment>
                  )
                }
              }}
            />
            <div className='flex justify-between items-center gap-x-3 gap-y-1 flex-wrap'>
              <FormControlLabel
                control={<Checkbox checked={isRemember} onChange={e => setIsRemember(e.target.checked)} />}
                label='계정 기억하기'
              />
              {/* <Typography className='text-end' color='primary.main' component={Link}>
                Forgot password?
              </Typography> */}
            </div>
            <Button
              fullWidth
              variant='contained'
              type='submit'
              onClick={e => handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>)}
            >
              로그인
            </Button>
            <div className='flex justify-center items-center flex-wrap gap-2'>
              <Typography>신규 사용자인가요???</Typography>
              <Typography href={'/register'} component={Link} color='primary.main'>
                계정 만들기
              </Typography>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default LoginV2
