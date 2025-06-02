export default function PlayCastSalesPage() {
  return (
    <div className='min-h-screen flex flex-col items-center justify-start bg-gradient-to-r from-black via-gray-800 to-gray-900 text-white p-4'>
      {/* <h1 className='text-4xl font-bold mb-8'>연뮤 개별 : 캐스트별 매출</h1> */}
      <div className='w-full max-w-6xl'>
        <iframe
          title='Looker Studio Report'
          width='100%'
          height='2800'
          src='https://lookerstudio.google.com/embed/reporting/50ef415d-d7d8-4b3b-88fa-03117dc3765d/page/6oezE'
          frameBorder='0'
          style={{ border: 0, overflow: 'hidden' }}
          scrolling='no'
          allowFullScreen
        />
      </div>
    </div>
  )
}
