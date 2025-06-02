// Next.js의 Image 컴포넌트를 임포트합니다.
import Image from 'next/image'

// 새 로고 컴포넌트: 이미지 파일을 사용하여 로고를 표시합니다.
const Logo = (props: any) => {
  return <Image src='/logo/favicon.png' width={30} height={30} alt='회사 로고' {...props} />
}

export default Logo
