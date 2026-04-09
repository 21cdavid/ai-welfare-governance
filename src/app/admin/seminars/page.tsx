'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'

const statusLabel: Record<string, string> = { open: '접수 중', upcoming: '예정', closed: '종료' }
const statusColor: Record<string, string> = {
  open: 'bg-green-100 text-green-700',
  upcoming: 'bg-blue-100 text-blue-700',
  closed: 'bg-gray-100 text-gray-500',
}

export default function AdminSeminarsPage() {
  const [seminars, setSeminars] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editTarget, setEditTarget] = useState<any>(null)
  const [showRegistrations, setShowRegistrations] = useState<string|null>(null)
  const [registrations, setRegistrations] = useState<any[]>([])
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [form, setForm] = useState({
    title: '', start_date: '', start_time: '14:00',
    venue: '', organizer: '', capacity: '50', description: '', status: 'upcoming'
  })

  useEffect(() => { fetchSeminars() }, [])

  const fetchSeminars = async () => {
    setLoading(true)
    const res = await fetch('/api/seminars')
    const data = await res.json()
    const list = Array.isArray(data) ? data : []
    list.sort((a: any, b: any) => {
      const score = (s: any) => s.status === 'closed' ? 1 : 0
      if (score(a) !== score(b)) return score(a) - score(b)
      return new Date(a.start_at).getTime() - new Date(b.start_at).getTime()
    })
    setSeminars(list)
    setLoading(false)
  }

  const fetchRegistrations = async (seminarId: string) => {
    const res = await fetch('/api/registrations?seminar_id=' + seminarId)
    const data = await res.json()
    setRegistrations(Array.isArray(data) ? data : [])
  }

  const openNew = () => {
    setEditTarget(null)
    setForm({ title: '', start_date: '', start_time: '14:00', venue: '', organizer: '', capacity: '50', description: '', status: 'upcoming' })
    setShowForm(true)
  }

  const openEdit = (s: any) => {
    const dt = new Date(s.start_at)
    const kst = dt.toLocaleString('sv-SE', { timeZone: 'Asia/Seoul' }) // "YYYY-MM-DD HH:MM:SS"
    const date = kst.slice(0, 10)
    const time = kst.slice(11, 16)
    setEditTarget(s)
    setForm({
      title: s.title || '',
      start_date: date,
      start_time: time,
      venue: s.venue || '',
      organizer: s.organizer || '',
      capacity: String(s.capacity || 50),
      description: s.description || '',
      status: s.status || 'upcoming',
    })
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!form.title || !form.start_date || !form.venue) {
      alert('제목, 날짜, 장소는 필수입니다.')
      return
    }
    setSaving(true)
    const startAt = new Date(form.start_date + 'T' + form.start_time + ':00+09:00').toISOString()
    const body = {
      title: form.title,
      start_at: startAt,
      venue: form.venue,
      organizer: form.organizer,
      capacity: Number(form.capacity),
      description: form.description,
      status: form.status,
    }

    if (editTarget) {
      const res = await fetch('/api/seminars/' + editTarget.id, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      setMessage(res.ok ? '수정되었습니다.' : '수정 실패.')
    } else {
      const res = await fetch('/api/seminars', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      setMessage(res.ok ? '등록되었습니다.' : '등록 실패.')
    }
    setSaving(false)
    setShowForm(false)
    fetchSeminars()
    setTimeout(() => setMessage(''), 3000)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('삭제하시겠습니까?')) return
    await fetch('/api/seminars/' + id, { method: 'DELETE' })
    fetchSeminars()
  }

  const toggleRegistrations = async (id: string) => {
    if (showRegistrations === id) {
      setShowRegistrations(null)
    } else {
      setShowRegistrations(id)
      await fetchRegistrations(id)
    }
  }

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
          <Link href="/admin/files" className="text-gray-600 hover:text-blue-700">파일 관리</Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-medium">세미나 관리</h1>
          <button onClick={openNew} className="bg-blue-700 text-white text-sm px-4 py-2 rounded-xl hover:bg-blue-800">+ 세미나 등록</button>
        </div>

        {message && (
          <div className={`text-sm px-4 py-3 rounded-xl mb-4 ${message.includes('실패') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}>
            {message}
          </div>
        )}

        <div className="flex flex-col gap-4">
          {loading ? (
            <div className="text-center py-10 text-sm text-gray-400">불러오는 중...</div>
          ) : seminars.map(s => (
            <div key={s.id} className="bg-white rounded-2xl border p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${statusColor[s.status] || 'bg-gray-100 text-gray-500'}`}>
                      {statusLabel[s.status] || s.status}
                    </span>
                  </div>
                  <h2 className="text-base font-medium mb-1">{s.title}</h2>
                  <p className="text-xs text-gray-500">
                    📅 {new Date(s.start_at).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })} &nbsp;|&nbsp;
                    📍 {s.venue} &nbsp;|&nbsp;
                    👤 {s.organizer}
                  </p>
                  {s.description && <p className="text-xs text-gray-400 mt-1">{s.description}</p>}
                </div>
                <div className="flex gap-2 ml-4 flex-shrink-0">
                  <button onClick={() => openEdit(s)} className="text-xs px-3 py-1.5 border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-50">수정</button>
                  <button onClick={() => handleDelete(s.id)} className="text-xs px-3 py-1 border text-red-400 rounded-lg hover:bg-red-50">삭제</button>
                </div>
              </div>

              <div className="flex items-center gap-4 mt-3">
                <p className="text-xs text-gray-400 flex-1">정원: {s.capacity}명</p>
                <button
                  onClick={() => toggleRegistrations(s.id)}
                  className="text-xs px-3 py-1.5 border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-50"
                >
                  참석자 목록 {showRegistrations === s.id ? '▲' : '▼'}
                </button>
                <DownloadBtn seminarId={s.id} seminarTitle={s.title} />
                <Link href="/admin/files" className="text-xs px-3 py-1.5 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50">
                  파일 관리
                </Link>
              </div>

              {showRegistrations === s.id && (
                <div className="mt-4 border-t pt-4">
                  <p className="text-xs font-medium text-gray-500 mb-3">참석 신청자 ({registrations.length}명)</p>
                  {registrations.length === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-4">신청자가 없습니다.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="text-left px-3 py-2 text-gray-500 font-medium">성명</th>
                            <th className="text-left px-3 py-2 text-gray-500 font-medium">소속</th>
                            <th className="text-left px-3 py-2 text-gray-500 font-medium">이메일</th>
                            <th className="text-left px-3 py-2 text-gray-500 font-medium">연락처</th>
                            <th className="text-left px-3 py-2 text-gray-500 font-medium">신청일</th>
                          </tr>
                        </thead>
                        <tbody>
                          {registrations.map((r: any) => (
                            <tr key={r.id} className="border-b border-gray-50">
                              <td className="px-3 py-2 font-medium">{r.name}</td>
                              <td className="px-3 py-2 text-gray-500">{r.organization}</td>
                              <td className="px-3 py-2 text-gray-500">{r.email}</td>
                              <td className="px-3 py-2 text-gray-500">{r.phone}</td>
                              <td className="px-3 py-2 text-gray-400">{new Date(r.registered_at).toLocaleDateString('ko-KR')}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
          {!loading && seminars.length === 0 && (
            <div className="text-center py-10 text-sm text-gray-400">등록된 세미나가 없습니다.</div>
          )}
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-medium">{editTarget ? '세미나 수정' : '새 세미나 등록'}</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 text-lg">✕</button>
            </div>
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs text-gray-500 block mb-1">세미나 제목 *</label>
                <input type="text" placeholder="세미나 제목을 입력하세요"
                  value={form.title} onChange={e => setForm({...form, title: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400" />
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-xs text-gray-500 block mb-1">날짜 *</label>
                  <input type="date"
                    value={form.start_date} onChange={e => setForm({...form, start_date: e.target.value})}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400" />
                </div>
                <div className="w-32">
                  <label className="text-xs text-gray-500 block mb-1">시간 *</label>
                  <input type="time"
                    value={form.start_time} onChange={e => setForm({...form, start_time: e.target.value})}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400" />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">장소 *</label>
                <input type="text" placeholder="경기복지재단 대회의실"
                  value={form.venue} onChange={e => setForm({...form, venue: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400" />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">주관 기관</label>
                <input type="text" placeholder="경기복지재단"
                  value={form.organizer} onChange={e => setForm({...form, organizer: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400" />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">정원</label>
                <input type="number" placeholder="50"
                  value={form.capacity} onChange={e => setForm({...form, capacity: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400" />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">상태</label>
                <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400">
                  <option value="upcoming">예정</option>
                  <option value="open">접수 중</option>
                  <option value="closed">종료</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">세미나 소개</label>
                <textarea placeholder="세미나 목적 및 주요 내용" rows={3}
                  value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400 resize-none" />
              </div>
              <button onClick={handleSave} disabled={saving}
                className="w-full bg-blue-700 text-white py-3 rounded-xl text-sm font-medium hover:bg-blue-800 disabled:opacity-50 mt-1">
                {saving ? '저장 중...' : (editTarget ? '수정 완료' : '등록 완료')}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

function DownloadBtn({ seminarId, seminarTitle }: { seminarId: string; seminarTitle: string }) {
  const handleClick = () => {
    const params = new URLSearchParams({ seminar_id: seminarId, title: seminarTitle })
    window.location.href = '/api/export?' + params.toString()
  }
  return (
    <button
      onClick={handleClick}
      className="text-xs px-3 py-1.5 border border-green-200 text-green-700 rounded-lg hover:bg-green-50"
    >
      엑셀 다운로드
    </button>
  )
}
