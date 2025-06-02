export default function TotalPlayPage() {
  return (
    <div className='min-h-screen flex flex-col items-center justify-start bg-gradient-to-r from-black via-gray-800 to-gray-900 text-white p-4'>
      <h1 className='text-4xl font-bold mb-8'>데이터 현황</h1>
      <div className='w-full max-w-6xl'>
        <iframe
          title='Looker Studio Report'
          width='100%'
          height='1500' // 보고서 내용 전체가 보일 수 있도록 충분한 높이를 지정합니다.
          src='https://lookerstudio.google.com/embed/reporting/4e1ba038-0ef6-40e9-ae19-55142201289f/page/6oezE'
          frameBorder='0'
          style={{ border: 0, overflow: 'hidden' }}
          scrolling='no' // 내부 스크롤 비활성화
          allowFullScreen
        />
      </div>
    </div>
  )
}
