'use client'
import Link from 'next/link'

const stats = [
  { label: '전체 세미나', value: 4, sub: '예정 3건', color: 'text-blue-700' },
  { label: '전체 신청자', value: 55, sub: '이번 달 36명', color: 'text-teal-700' },
  { label: '전문가 풀', value: 6, sub: '승인 대기 2명', color: 'text-purple-700' },
  { label: '업로드 자료', value: 3, sub: '파일 3건', color: 'text-amber-700' },
]

const recentRegistrations = [
  { name: '김철수', org: '경기도청', seminar: 'AI 기반 사회보장 급여 적정성 평가', date: '2026.04.08' },
  { name: '이영희', org: '수원시청', seminar: 'AI 기반 사회보장 급여 적정성 평가', date: '2026.04.07' },
  { name: '박민준', org: '한국복지연구원', seminar: '복지 데이터 거버넌스', date: '2026.04.06' },
  { name: '정수연', org: '경기복지재단', seminar: 'AI 기반 사회보장 급여 적정성 평가', date: '2026.04.05' },
]

const pendingExperts = [
  { name: '홍길동', org: '수원시청', field: '현장·실무', date: '2026.04.07' },
  { name: '정민아', org: '성균관대학교', field: 'AI·데이터', date: '2026.04.06' },
]

const quickMenus = [
  { label: '세미나 등록', href: '/admin/seminars', color: 'bg-blue-700 hover:bg-blue-800' },
  { label: '전문가 관리', href: '/admin/experts', color: 'bg-purple-700 hover:bg-purple-800' },
  { label: '파일 관리', href: '/admin/files', color: 'bg-teal-700 hover:bg-teal-800' },
  { label: '공개 사이트', href: '/', color: 'bg-gray-700 hover:bg-gray-800' },
]

async function handleLogout() {
  await fetch('/api/auth', { method: 'DELETE' })
  window.location.href = '/login'
}

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-medium text-blue-700">AI 복지 거버넌스</span>
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md font-medium">관리자</span>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/admin/seminars" className="text-gray-600 hover:text-blue-700">세미나 관리</Link>
          <Link href="/admin/experts" className="text-gray-600 hover:text-blue-700">전문가 관리</Link>
          <Link href="/admin/files" className="text-gray-600 hover:text-blue-700">파일 관리</Link>
          <button
            onClick={() => { fetch('/api/auth', { method: 'DELETE' }).then(() => { window.location.href = '/login' }) }}
            className="text-xs px-3 py-1.5 border border-gray-200 text-gray-500 rounded-lg hover:bg-gray-50"
          >
            로그아웃
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-xl font-medium">관리자 대시보드</h1>
            <p className="text-sm text-gray-500 mt-1">AI 복지 거버넌스 플랫폼 현황</p>
          </div>
          <div className="flex gap-2">
            {quickMenus.map(m => (
              <Link key={m.label} href={m.href} className={`text-white text-xs px-3 py-2 rounded-xl ${m.color}`}>{m.label}</Link>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-8">
          {stats.map(s => (
            <div key={s.label} className="bg-white rounded-2xl border p-5">
              <p className={`text-2xl font-medium ${s.color}`}>{s.value}</p>
              <p className="text-sm font-medium mt-1">{s.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{s.sub}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-medium">최근 신청자</h2>
              <Link href="/admin/seminars" className="text-xs text-blue-700 hover:underline">전체 보기</Link>
            </div>
            <div className="flex flex-col gap-3">
              {recentRegistrations.map((r, i) => (
                <div key={i} className="flex items-start justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium">{r.name} <span className="text-xs text-gray-400 font-normal">· {r.org}</span></p>
                    <p className="text-xs text-gray-500 mt-0.5">{r.seminar}</p>
                  </div>
                  <span className="text-xs text-gray-400 flex-shrink-0 ml-2">{r.date}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-medium">전문가 승인 대기</h2>
              <Link href="/admin/experts" className="text-xs text-blue-700 hover:underline">전체 보기</Link>
            </div>
            {pendingExperts.length > 0 ? (
              <div className="flex flex-col gap-3">
                {pendingExperts.map((e, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div>
                      <p className="text-sm font-medium">{e.name} <span className="text-xs text-gray-400 font-normal">· {e.org}</span></p>
                      <p className="text-xs text-gray-500 mt-0.5">{e.field} · {e.date}</p>
                    </div>
                    <div className="flex gap-1.5 ml-2">
                      <button className="text-xs px-2.5 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700">승인</button>
                      <button className="text-xs px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200">반려</button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-8">승인 대기 중인 전문가가 없습니다.</p>
            )}
            <div className="mt-4 pt-4 border-t">
              <h3 className="text-sm font-medium mb-3">예정 세미나</h3>
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">AI 기반 사회보장 급여 적정성 평가</span>
                  <span className="text-blue-700 font-medium">D-7</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">복지 데이터 거버넌스와 개인정보 보호</span>
                  <span className="text-gray-400">D-30</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
