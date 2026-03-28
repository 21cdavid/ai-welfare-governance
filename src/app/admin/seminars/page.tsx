'use client'
import Link from 'next/link'
import { useState } from 'react'

const initSeminars = [
  { id: 1, title: 'AI 기반 사회보장 급여 적정성 평가 방법론 세미나', date: '2026.04.15', venue: '경기복지재단 대회의실', organizer: '경기복지재단 정책연구실', capacity: 50, registered: 36, status: 'open' },
  { id: 2, title: '복지 데이터 거버넌스와 개인정보 보호 쟁점', date: '2026.05.08', venue: '온라인 (Zoom)', organizer: 'AI복지거버넌스위원회', capacity: 50, registered: 14, status: 'upcoming' },
  { id: 3, title: '지역사회보장계획과 AI 정책 모니터링 체계 구축', date: '2026.06.12', venue: '수원 경기도청 대강당', organizer: '경기도 복지국', capacity: 80, registered: 5, status: 'upcoming' },
  { id: 4, title: '경기도 사회보장 빅데이터 활용 방안 연구 세미나', date: '2026.03.06', venue: '경기복지재단 세미나실', organizer: '경기복지재단', capacity: 50, registered: 50, status: 'closed' },
]

const statusLabel = { open: '접수 중', upcoming: '예정', closed: '종료' }
const statusColor = { open: 'bg-green-100 text-green-700', upcoming: 'bg-blue-100 text-blue-700', closed: 'bg-gray-100 text-gray-500' }

export default function AdminSeminarsPage() {
  const [seminars, setSeminars] = useState(initSeminars)
  const [showForm, setShowForm] = useState(false)
  const [showRegistrations, setShowRegistrations] = useState<number|null>(null)
  const [form, setForm] = useState({ title: '', date: '', venue: '', organizer: '', capacity: '50' })

  const handleAdd = () => {
    if (!form.title || !form.date || !form.venue) { alert('제목, 일시, 장소는 필수입니다.'); return }
    setSeminars(prev => [...prev, { id: Date.now(), ...form, capacity: Number(form.capacity), registered: 0, status: 'upcoming' }])
    setForm({ title: '', date: '', venue: '', organizer: '', capacity: '50' })
    setShowForm(false)
  }

  const handleDelete = (id: number) => {
    if (confirm('삭제하시겠습니까?')) setSeminars(prev => prev.filter(s => s.id !== id))
  }

  const handleStatus = (id: number, status: string) => {
    setSeminars(prev => prev.map(s => s.id === id ? { ...s, status } : s))
  }

  const registrations = [
    { name: '김철수', org: '경기도청', email: 'kim@gg.go.kr', phone: '010-1234-5678', notify: '이메일', date: '2026.04.08' },
    { name: '이영희', org: '수원시청', email: 'lee@suwon.go.kr', phone: '010-2345-6789', notify: '이메일+문자', date: '2026.04.07' },
    { name: '박민준', org: '한국복지연구원', email: 'park@kwi.re.kr', phone: '010-3456-7890', notify: '이메일', date: '2026.04.06' },
  ]

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/admin" className="font-medium text-blue-700">AI 복지 거버넌스</Link>
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md">관리자</span>
        </div>
        <div className="flex gap-4 text-sm">
          <Link href="/admin" className="text-gray-600 hover:text-blue-700">대시보드</Link>
          <Link href="/admin/experts" className="text-gray-600 hover:text-blue-700">전문가 관리</Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-medium">세미나 관리</h1>
          <button onClick={() => setShowForm(true)} className="bg-blue-700 text-white text-sm px-4 py-2 rounded-xl hover:bg-blue-800">+ 세미나 등록</button>
        </div>

        <div className="flex flex-col gap-4">
          {seminars.map(s => (
            <div key={s.id} className="bg-white rounded-2xl border p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${statusColor[s.status as keyof typeof statusColor]}`}>{statusLabel[s.status as keyof typeof statusLabel]}</span>
                  </div>
                  <h2 className="text-base font-medium mb-1">{s.title}</h2>
                  <p className="text-xs text-gray-500">📅 {s.date} &nbsp;|&nbsp; 📍 {s.venue} &nbsp;|&nbsp; 👤 {s.organizer}</p>
                </div>
                <div className="flex gap-2 ml-4 flex-shrink-0">
                  <select
                    value={s.status}
                    onChange={e => handleStatus(s.id, e.target.value)}
                    className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none"
                  >
                    <option value="upcoming">예정</option>
                    <option value="open">접수 중</option>
                    <option value="closed">종료</option>
                  </select>
                  <button onClick={() => handleDelete(s.id)} className="text-xs px-3 py-1 border text-red-400 rounded-lg hover:bg-red-50">삭제</button>
                </div>
              </div>

              <div className="flex items-center gap-4 mt-3">
                <div className="flex-1">
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{width: `${Math.round((s.registered/s.capacity)*100)}%`}} />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">신청 {s.registered} / {s.capacity}명 ({Math.round((s.registered/s.capacity)*100)}%)</p>
                </div>
                <button
                  onClick={() => setShowRegistrations(showRegistrations === s.id ? null : s.id)}
                  className="text-xs px-3 py-1.5 border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-50"
                >
                  참석자 목록 {showRegistrations === s.id ? '▲' : '▼'}
                </button>
                <Link href="/admin/files" className="text-xs px-3 py-1.5 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50">
                  파일 관리
                </Link>
              </div>

              {showRegistrations === s.id && (
                <div className="mt-4 border-t pt-4">
                  <p className="text-xs font-medium text-gray-500 mb-3">참석 신청자 목록</p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="text-left px-3 py-2 text-gray-500 font-medium rounded-l-lg">성명</th>
                          <th className="text-left px-3 py-2 text-gray-500 font-medium">소속</th>
                          <th className="text-left px-3 py-2 text-gray-500 font-medium">이메일</th>
                          <th className="text-left px-3 py-2 text-gray-500 font-medium">연락처</th>
                          <th className="text-left px-3 py-2 text-gray-500 font-medium">알림</th>
                          <th className="text-left px-3 py-2 text-gray-500 font-medium rounded-r-lg">신청일</th>
                        </tr>
                      </thead>
                      <tbody>
                        {registrations.map((r, i) => (
                          <tr key={i} className="border-b border-gray-50">
                            <td className="px-3 py-2 font-medium">{r.name}</td>
                            <td className="px-3 py-2 text-gray-500">{r.org}</td>
                            <td className="px-3 py-2 text-gray-500">{r.email}</td>
                            <td className="px-3 py-2 text-gray-500">{r.phone}</td>
                            <td className="px-3 py-2 text-gray-500">{r.notify}</td>
                            <td className="px-3 py-2 text-gray-400">{r.date}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <button className="mt-3 text-xs px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700">CSV 다운로드</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-medium">새 세미나 등록</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 text-lg">✕</button>
            </div>
            <div className="flex flex-col gap-3">
              <div><label className="text-xs text-gray-500 block mb-1">세미나 제목 *</label><input type="text" placeholder="세미나 제목을 입력하세요" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400" /></div>
              <div><label className="text-xs text-gray-500 block mb-1">일시 *</label><input type="text" placeholder="2026.04.15" value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400" /></div>
              <div><label className="text-xs text-gray-500 block mb-1">장소 *</label><input type="text" placeholder="경기복지재단 대회의실" value={form.venue} onChange={e => setForm({...form, venue: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400" /></div>
              <div><label className="text-xs text-gray-500 block mb-1">주관 기관</label><input type="text" placeholder="경기복지재단" value={form.organizer} onChange={e => setForm({...form, organizer: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400" /></div>
              <div><label className="text-xs text-gray-500 block mb-1">정원</label><input type="number" placeholder="50" value={form.capacity} onChange={e => setForm({...form, capacity: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400" /></div>
              <button onClick={handleAdd} className="w-full bg-blue-700 text-white py-3 rounded-xl text-sm font-medium hover:bg-blue-800 mt-1">등록 완료</button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
