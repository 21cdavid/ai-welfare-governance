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
  const [privacyAgreed, setPrivacyAgreed] = useState(false)
  const [showPrivacy, setShowPrivacy] = useState(false)
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
    if (!privacyAgreed) {
      setError('개인정보 수집 및 이용에 동의해주세요.')
      return
    }
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
              📅 {new Date(seminar.start_at).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })} | 📍 {seminar.venue}
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

            <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="privacy"
                  checked={privacyAgreed}
                  onChange={e => setPrivacyAgreed(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-blue-700 cursor-pointer"
                />
                <div className="flex-1">
                  <label htmlFor="privacy" className="text-sm text-gray-700 cursor-pointer">
                    <span className="text-red-500 font-medium">[필수]</span> 개인정보 수집 및 이용에 동의합니다.
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPrivacy(!showPrivacy)}
                    className="text-xs text-blue-700 underline block mt-1"
                  >
                    {showPrivacy ? '내용 접기 ▲' : '내용 보기 ▼'}
                  </button>
                  {showPrivacy && (
                    <div className="mt-3 text-xs text-gray-500 bg-white border border-gray-200 rounded-lg p-3 leading-relaxed">
                      <p className="font-medium text-gray-700 mb-2">개인정보 수집 및 이용 동의</p>
                      <table className="w-full border-collapse text-xs">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="border border-gray-200 px-2 py-1.5 text-left font-medium text-gray-600">수집 항목</th>
                            <th className="border border-gray-200 px-2 py-1.5 text-left font-medium text-gray-600">수집 목적</th>
                            <th className="border border-gray-200 px-2 py-1.5 text-left font-medium text-gray-600">보유 기간</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="border border-gray-200 px-2 py-1.5">성명, 소속 기관, 직위, 이메일, 연락처</td>
                            <td className="border border-gray-200 px-2 py-1.5">세미나 참석 신청 및 운영 관리</td>
                            <td className="border border-gray-200 px-2 py-1.5">세미나 종료 후 1년</td>
                          </tr>
                        </tbody>
                      </table>
                      <p className="mt-2 text-gray-500">※ 위 개인정보 수집 및 이용에 동의하지 않을 권리가 있으나, 동의 거부 시 세미나 참석 신청이 제한될 수 있습니다.</p>
                      <p className="mt-1 text-gray-500">※ 수집된 개인정보는 경기복지재단 개인정보 처리방침에 따라 안전하게 관리됩니다.</p>
                    </div>
                  )}
                </div>
              </div>
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
