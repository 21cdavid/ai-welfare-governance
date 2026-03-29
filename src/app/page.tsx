import Link from 'next/link'

export default function Home() {
  return (
    <main className='min-h-screen bg-gray-50'>
      <nav className='bg-white border-b px-6 py-4 flex items-center justify-between'>
        <span className='font-medium text-blue-700'>AI 복지 거버넌스</span>
        <div className='flex gap-4 text-sm'>
          <Link href='/seminars' className='hover:text-blue-700'>세미나</Link>
          <Link href='/experts' className='hover:text-blue-700'>전문가 풀</Link>
        </div>
      </nav>
      <div className='max-w-4xl mx-auto px-6 py-12'>
        <div className='bg-blue-900 rounded-2xl p-10 text-white mb-8'>
          <h1 className='text-2xl font-medium mb-2'>AI 복지 거버넌스 플랫폼</h1>
          <p className='text-blue-300 text-sm'>경기복지재단 AI 복지 정책 연구 세미나 운영 및 AI 복지 거버넌스 구성을 위한 통합 플랫폼</p>
        </div>
        <div className='flex gap-4'>
          <Link href='/seminars' className='flex-1 bg-blue-700 text-white text-center py-3 rounded-xl text-sm'>세미나 바로가기</Link>
          <Link href='/experts' className='flex-1 bg-white border text-gray-700 text-center py-3 rounded-xl text-sm'>전문가 풀 바로가기</Link>
        </div>
      </div>
    </main>
  )
}