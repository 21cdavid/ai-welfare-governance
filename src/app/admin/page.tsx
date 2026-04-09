'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function AdminPage() {
  const [stats, setStats] = useState({
    totalSeminars: 0,
    openSeminars: 0,
    upcomingSeminars: 0,
    closedSeminars: 0,
    totalRegistrations: 0,
    totalExperts: 0,
    pendingExperts: 0,
    totalFiles: 0,
  })
  const [recentRegistrations, setRecentRegistrations] = useState<any[]>([])
  const [pendingExperts, setPendingExperts] = useState<any[]>([])
  const [seminars, setSeminars] = useState<any[]>([])
  const [monthlyData, setMonthlyData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAll()
  }, [])

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [seminarsRes, registrationsRes, expertsRes, filesRes] = await Promise.all([
        fetch('/api/seminars'),
        fetch('/api/registrations'),
        fetch('/api/experts/all'),
        fetch('/api/files'),
      ])

      const seminarsData = await seminarsRes.json()
      const registrationsData = await registrationsRes.json()
      const expertsData = await expertsRes.json()
      const filesData = await filesRes.json()

      const seminarsArr = Array.isArray(seminarsData) ? seminarsData : []
      const registrationsArr = Array.isArray(registrationsData) ? registrationsData : []
      const expertsArr = Array.isArray(expertsData) ? expertsData : []
      const filesArr = Array.isArray(filesData) ? filesData : []

      setStats({
        totalSeminars: seminarsArr.length,
        openSeminars: seminarsArr.filter((s: any) => s.status === 'open').length,
        upcomingSeminars: seminarsArr.filter((s: any) => s.status === 'upcoming').length,
        closedSeminars: seminarsArr.filter((s: any) => s.status === 'closed').length,
        totalRegistrations: registrationsArr.length,
        totalExperts: expertsArr.filter((e: any) => e.status === 'approved').length,
        pendingExperts: expertsArr.filter((e: any) => e.status === 'pending').length,
        totalFiles: filesArr.length,
      })

      setRecentRegistrations(registrationsArr.slice(0, 5))
      setPendingExperts(expertsArr.filter((e: any) => e.status === 'pending').slice(0, 3))
      setSeminars(seminarsArr.slice(0, 5))

      const monthly: Record<string, number> = {}
      registrationsArr.forEach((r: any) => {
        const month = new Date(r.registered_at).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit' })
        monthly[month] = (monthly[month] || 0) + 1
      })
      const monthlyArr = Object.entries(monthly).map(([month, count]) => ({ month, count })).slice(-6)
      setMonthlyData(monthlyArr)

    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  const handleApprove = async (id: string) => {
    await fetch('/api/experts', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: 'approved' })
    })
    fetchAll()
  }

  const handleReject = async (id: string) => {
    await fetch('/api/experts', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: 'rejected' })
    })
    fetchAll()
  }

  const maxCount = Math.max(...monthlyData.map(d => d.count), 1)

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
            <p className="text-sm text-gray-500 mt-1">AI 복지 거버넌스 플랫폼 운영 현황</p>
          </div>
          <div className="flex gap-2">
            <Link href="/admin/seminars" className="text-white text-xs px-3 py-2 rounded-xl bg-blue-700 hover:bg-blue-800">세미나 등록</Link>
            <Link href="/admin/experts" className="text-white text-xs px-3 py-2 rounded-xl bg-purple-700 hover:bg-purple-800">전문가 관리</Link>
            <Link href="/admin/files" className="text-white text-xs px-3 py-2 rounded-xl bg-teal-700 hover:bg-teal-800">파일 관리</Link>
            <Link href="/" className="text-white text-xs px-3 py-2 rounded-xl bg-gray-700 hover:bg-gray-800">공개 사이트</Link>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-sm text-gray-400">불러오는 중...</div>
        ) : (
          <>
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-2xl border p-5">
                <p className="text-2xl font-medium text-blue-700">{stats.totalSeminars}</p>
                <p className="text-sm font-medium mt-1">전체 세미나</p>
                <div className="flex gap-2 mt-2">
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-md">접수 {stats.openSeminars}</span>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md">예정 {stats.upcomingSeminars}</span>
                  <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md">종료 {stats.closedSeminars}</span>
                </div>
              </div>
              <div className="bg-white rounded-2xl border p-5">
                <p className="text-2xl font-medium text-teal-700">{stats.totalRegistrations}</p>
                <p className="text-sm font-medium mt-1">전체 신청자</p>
                <p className="text-xs text-gray-400 mt-2">누적 참석 신청</p>
              </div>
              <div className="bg-white rounded-2xl border p-5">
                <p className="text-2xl font-medium text-purple-700">{stats.totalExperts}</p>
                <p className="text-sm font-medium mt-1">전문가 풀</p>
                {stats.pendingExperts > 0 && (
                  <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-md mt-2 inline-block">승인 대기 {stats.pendingExperts}</span>
                )}
              </div>
              <div className="bg-white rounded-2xl border p-5">
                <p className="text-2xl font-medium text-amber-700">{stats.totalFiles}</p>
                <p className="text-sm font-medium mt-1">업로드 자료</p>
                <p className="text-xs text-gray-400 mt-2">총 파일 수</p>
              </div>
            </div>

            {monthlyData.length > 0 && (
              <div className="bg-white rounded-2xl border p-6 mb-6">
                <h2 className="text-base font-medium mb-4">월별 신청자 현황</h2>
                <div className="flex items-end gap-3 h-32">
                  {monthlyData.map((d, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-xs font-medium text-blue-700">{d.count}</span>
                      <div
                        className="w-full bg-blue-500 rounded-t-lg transition-all"
                        style={{ height: Math.max((d.count / maxCount) * 96, 4) + 'px' }}
                      />
                      <span className="text-xs text-gray-400 text-center leading-tight">{d.month}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-2xl border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-medium">최근 신청자</h2>
                  <Link href="/admin/seminars" className="text-xs text-blue-700 hover:underline">전체 보기</Link>
                </div>
                {recentRegistrations.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-6">신청자가 없습니다.</p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {recentRegistrations.map((r: any, i: number) => (
                      <div key={i} className="flex items-start justify-between py-2 border-b border-gray-50 last:border-0">
                        <div>
                          <p className="text-sm font-medium">{r.name} <span className="text-xs text-gray-400 font-normal">· {r.organization}</span></p>
                          <p className="text-xs text-gray-400 mt-0.5">{new Date(r.registered_at).toLocaleDateString('ko-KR')}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
                    {pendingExperts.map((e: any, i: number) => (
                      <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                        <div>
                          <p className="text-sm font-medium">{e.name} <span className="text-xs text-gray-400 font-normal">· {e.organization}</span></p>
                          <p className="text-xs text-gray-500 mt-0.5">{e.field}</p>
                        </div>
                        <div className="flex gap-1.5 ml-2">
                          <button onClick={() => handleApprove(e.id)} className="text-xs px-2.5 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700">승인</button>
                          <button onClick={() => handleReject(e.id)} className="text-xs px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200">반려</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-4 pt-4 border-t">
                  <h3 className="text-sm font-medium mb-3">세미나 현황</h3>
                  <div className="flex flex-col gap-2">
                    {seminars.map((s: any, i: number) => {
                      const dDay = Math.ceil((new Date(s.start_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                      return (
                        <div key={i} className="flex items-center justify-between text-xs">
                          <span className="text-gray-600 truncate flex-1 mr-2">{s.title.slice(0, 20)}...</span>
                          {dDay > 0 ? (
                            <span className={`font-medium flex-shrink-0 ${dDay <= 7 ? 'text-red-600' : 'text-blue-700'}`}>D-{dDay}</span>
                          ) : (
                            <span className="text-gray-400 flex-shrink-0">종료</span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  )
}
