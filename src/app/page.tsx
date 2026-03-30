import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <span className="font-medium text-blue-700">AI 복지 거버넌스</span>
        <div className="flex gap-4 text-sm">
          <Link href="/seminars" className="hover:text-blue-700">세미나</Link>
          <Link href="/experts" className="hover:text-blue-700">전문가 풀</Link>
        </div>
      </nav>
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-blue-900 rounded-2xl p-10 text-white mb-8">
          <h1 className="text-2xl font-medium mb-2">AI 복지 거버넌스 플랫폼</h1>
          <p className="text-blue-300 text-sm">경기복지재단 AI 복지 정책 연구 세미나 운영 및 AI 복지 거버넌스 구성을 위한 통합 플랫폼</p>
        </div>
        <div className="flex gap-4 mb-6">
          <Link href="/seminars" className="flex-1 bg-blue-700 text-white text-center py-3 rounded-xl text-sm">세미나 바로가기</Link>
          <Link href="/experts" className="flex-1 bg-white border text-gray-700 text-center py-3 rounded-xl text-sm">전문가 풀 바로가기</Link>
        </div>
        
          href="https://www.youtube.com/@%EB%B3%B5%EC%A7%80%ED%8A%9C%EB%B8%8C/search?query=30%EC%B4%88+%EC%A0%95%EC%B1%85%EC%97%B0%EA%B5%AC"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-4 bg-white border border-red-100 rounded-2xl p-5 hover:border-red-300 transition-all"
        >
          <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1C24 15.9 24 12 24 12s0-3.9-.5-5.8zM9.7 15.5V8.5l6.3 3.5-6.3 3.5z"/>
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">[30초 정책연구] 숏츠</p>
            <p className="text-xs text-gray-500 mt-0.5">경기복지재단 복지튜브 · 30초로 보는 복지 정책 연구</p>
          </div>
          <span className="text-xs text-red-600 font-medium">바로가기</span>
        </a>
      </div>
    </main>
  )
}
