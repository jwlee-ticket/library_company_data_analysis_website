export default function PlayCastSalesPage() {
  return (
    <div className='min-h-screen flex flex-col items-center justify-start bg-gradient-to-r from-black via-gray-800 to-gray-900 text-white p-4'>
      {/* <h1 className='text-4xl font-bold mb-8'>연뮤 개별 : 캐스트별 매출</h1> */}
      <div className='w-full max-w-6xl'>
        <iframe
          title='Looker Studio Report'
          width='100%'
          height='3000'
          src='https://lookerstudio.google.com/embed/reporting/d21c95d0-3322-44d3-8eae-2567d14784c5/page/6oezE'
          frameBorder='0'
          style={{ border: 0, overflow: 'hidden' }}
          scrolling='no'
          allowFullScreen
        />
      </div>
    </div>
  )
}
