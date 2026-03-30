'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'

export default function RegisterPage() {
  const params = useParams()
  const seminarId = params.id as string
  const [seminar, setSeminar] = useState<any>(null)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '', organization: '', position: '', email: '', phone: '', notify_method: 'email'
  })

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL + '/rest/v1/seminars?id=eq.' + seminarId
    fetch(url, { headers: { apikey: key || '', Authorization: 'Bearer ' + key } })
    .then(r => r.json())
    .then(data => { if (data && data[0]) setSeminar(data[0]) })
  }, [seminarId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          seminar_id: seminarId,
          name: form.name,
          organization: form.organization,
          position: form.position,
          email: form.email,
          phone: form.phone,
          notify_method: form.notify_method,
        }),
      })
      if (!res.ok) throw new Error('신청 중 오류가 발생했습니다.')
      setSubmitted(true)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl border p-10 text-center max-w-md w-full mx-4">
          <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-green-600 text-2xl">✓</span>
          </div>
          <h2 className="text-lg font-medium mb-2">신청이 완료되었습니다</h2>
          <p className="text-sm text-gray-500 mb-6">참석 신청이 정상적으로 접수되었습니다.</p>
          <Link href="/seminars" className="bg-blue-700 text-white text-sm px-6 py-2.5 rounded-xl hover:bg-blue-800">
            세미나 목록으로
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <Link href="/" className="font-medium text-blue-700">AI 복지 거버넌스</Link>
        <Link href="/seminars" className="text-sm text-gray-600 hover:text-blue-700">← 세미나 목록</Link>
      </nav>
      <div className="max-w-xl mx-auto px-6 py-10">
        {seminar ? (
          <div className="bg-blue-50 rounded-2xl p-5 mb-6 border border-blue-100">
            <p className="text-xs text-blue-600 font-medium mb-1">신청 세미나</p>
            <p className="text-sm font-medium text-blue-900">{seminar.title}</p>
            <p className="text-xs text-blue-600 mt-1">
              📅 {new Date(seminar.start_at).toLocaleString('ko-KR')} | 📍 {seminar.venue}
            </p>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-2xl p-5 mb-6 border">
            <p className="text-xs text-gray-400">세미나 정보 불러오는 중...</p>
          </div>
        )}
        <div className="bg-white rounded-2xl border p-6">
          <h1 className="text-lg font-medium mb-6">참석 신청</h1>
          {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">{error}</div>}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-xs text-gray-500 block mb-1">성명 *</label>
              <input type="text" required placeholder="홍길동"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400"
                value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">소속 기관 *</label>
              <input type="text" required placeholder="경기복지재단"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400"
                value={form.organization} onChange={e => setForm({...form, organization: e.target.value})} />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">직위</label>
              <input type="text" placeholder="연구위원"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400"
                value={form.position} onChange={e => setForm({...form, position: e.target.value})} />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">이메일 *</label>
              <input type="email" required placeholder="example@ggwf.or.kr"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400"
                value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">연락처</label>
              <input type="tel" placeholder="010-0000-0000"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400"
                value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">사전 알림 수신</label>
              <select className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400"
                value={form.notify_method} onChange={e => setForm({...form, notify_method: e.target.value})}>
                <option value="email">이메일 알림</option>
                <option value="sms">문자 알림</option>
                <option value="both">이메일 + 문자</option>
                <option value="none">수신 안 함</option>
              </select>
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-blue-700 text-white py-3 rounded-xl text-sm font-medium hover:bg-blue-800 disabled:opacity-50 mt-2">
              {loading ? '신청 중...' : '신청 완료'}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
