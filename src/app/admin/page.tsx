'use client'
import Link from 'next/link'
import { useState, useEffect, useCallback } from 'react'

const quickMenus = [
  { label: '세미나 등록', href: '/admin/seminars', color: 'bg-blue-700 hover:bg-blue-800' },
  { label: '전문가 관리', href: '/admin/experts', color: 'bg-purple-700 hover:bg-purple-800' },
  { label: '파일 관리', href: '/admin/files', color: 'bg-teal-700 hover:bg-teal-800' },
  { label: '공개 사이트', href: '/', color: 'bg-gray-700 hover:bg-gray-800' },
]

function dday(startAt: string) {
  const now = new Date()
  const target = new Date(startAt)
  const diff = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  if (diff < 0) return null
  if (diff === 0) return 'D-Day'
  return 'D-' + diff
}

export default function AdminPage() {
  const [seminars, setSeminars] = useState<any[]>([])
  const [registrations, setRegistrations] = useState<any[]>([])
  const [experts, setExperts] = useState<any[]>([])
  const [pendingExperts, setPendingExperts] = useState<any[]>([])
  const [files, setFiles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    const [semRes, regRes, expRes, pendRes, fileRes] = await Promise.all([
      fetch('/api/seminars'),
      fetch('/api/registrations'),
      fetch('/api/experts'),
      fetch('/api/experts?status=pending'),
      fetch('/api/files'),
    ])
    const [semData, regData, expData, pendData, fileData] = await Promise.all([
      semRes.json(), regRes.json(), expRes.json(), pendRes.json(), fileRes.json()
    ])
    setSeminars(Array.isArray(semData) ? semData : [])
    setRegistrations(Array.isArray(regData) ? regData : [])
    setExperts(Array.isArray(expData) ? expData : [])
    setPendingExperts(Array.isArray(pendData) ? pendData : [])
    setFiles(Array.isArray(fileData) ? fileData : [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  const handleExpert = async (id: string, status: 'approved' | 'rejected') => {
    await fetch('/api/experts', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    })
    fetchAll()
  }

  const upcomingSeminars = seminars
    .filter(s => s.status !== 'closed' && new Date(s.start_at) >= new Date())
    .sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime())
    .slice(0, 5)

  const thisMonth = new Date()
  const thisMonthRegs = registrations.filter(r => {
    const d = new Date(r.registered_at)
    return d.getFullYear() === thisMonth.getFullYear() && d.getMonth() === thisMonth.getMonth()
  })

  const upcomingCount = seminars.filter(s => s.status !== 'closed').length

  const stats = [
    { label: '전체 세미나', value: seminars.length, sub: `예정 ${upcomingCount}건`, color: 'text-blue-700' },
    { label: '전체 신청자', value: registrations.length, sub: `이번 달 ${thisMonthRegs.length}명`, color: 'text-teal-700' },
    { label: '전문가 풀', value: experts.length, sub: `승인 대기 ${pendingExperts.length}명`, color: 'text-purple-700' },
    { label: '업로드 자료', value: files.length, sub: `파일 ${files.length}건`, color: 'text-amber-700' },
  ]

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

        {loading ? (
          <div className="text-center py-20 text-sm text-gray-400">불러오는 중...</div>
        ) : (
          <>
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
                  {registrations.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-4">신청자가 없습니다.</p>
                  ) : registrations.slice(0, 5).map((r: any) => {
                    const seminar = seminars.find(s => s.id === r.seminar_id)
                    return (
                      <div key={r.id} className="flex items-start justify-between py-2 border-b border-gray-50 last:border-0">
                        <div>
                          <p className="text-sm font-medium">{r.name} <span className="text-xs text-gray-400 font-normal">· {r.organization}</span></p>
                          <p className="text-xs text-gray-500 mt-0.5">{seminar?.title || '-'}</p>
                        </div>
                        <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                          {new Date(r.registered_at).toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' })}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="bg-white rounded-2xl border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-medium">전문가 승인 대기</h2>
                  <Link href="/admin/experts" className="text-xs text-blue-700 hover:underline">전체 보기</Link>
                </div>
                {pendingExperts.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-6">승인 대기 중인 전문가가 없습니다.</p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {pendingExperts.slice(0, 3).map((e: any) => (
                      <div key={e.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                        <div>
                          <p className="text-sm font-medium">{e.name} <span className="text-xs text-gray-400 font-normal">· {e.organization}</span></p>
                          <p className="text-xs text-gray-500 mt-0.5">{e.field} · {new Date(e.created_at).toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' })}</p>
                        </div>
                        <div className="flex gap-1.5 ml-2">
                          <button onClick={() => handleExpert(e.id, 'approved')} className="text-xs px-2.5 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700">승인</button>
                          <button onClick={() => handleExpert(e.id, 'rejected')} className="text-xs px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200">반려</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-4 pt-4 border-t">
                  <h3 className="text-sm font-medium mb-3">예정 세미나</h3>
                  {upcomingSeminars.length === 0 ? (
                    <p className="text-xs text-gray-400">예정된 세미나가 없습니다.</p>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {upcomingSeminars.map((s: any) => {
                        const d = dday(s.start_at)
                        return (
                          <div key={s.id} className="flex items-center justify-between text-xs">
                            <span className="text-gray-600 truncate mr-2">{s.title}</span>
                            <span className={`flex-shrink-0 font-medium ${d === 'D-Day' ? 'text-red-600' : 'text-blue-700'}`}>{d}</span>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  )
}
