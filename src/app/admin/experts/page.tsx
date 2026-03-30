'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'

const statusColor: Record<string, string> = {
  approved: 'bg-green-100 text-green-700',
  pending: 'bg-amber-100 text-amber-700',
  rejected: 'bg-red-100 text-red-500',
}
const statusLabel: Record<string, string> = {
  approved: '승인됨',
  pending: '승인 대기',
  rejected: '반려',
}

export default function AdminExpertsPage() {
  const [experts, setExperts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'all' | 'pending'>('all')
  const [showForm, setShowForm] = useState(false)
  const [message, setMessage] = useState('')
  const [form, setForm] = useState({
    name: '', org: '', position: '', field: '사회복지정책', tags: '', email: '', bio: ''
  })

  useEffect(() => { fetchExperts() }, [])

  const fetchExperts = async () => {
    setLoading(true)
    const res = await fetch('/api/experts/all')
    const data = await res.json()
    setExperts(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  const handleApprove = async (id: string) => {
    await fetch('/api/experts', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: 'approved' })
    })
    fetchExperts()
  }

  const handleReject = async (id: string) => {
    await fetch('/api/experts', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: 'rejected' })
    })
    fetchExperts()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('삭제하시겠습니까?')) return
    await fetch('/api/experts?id=' + id, { method: 'DELETE' })
    fetchExperts()
  }

  const handleAdd = async () => {
    if (!form.name || !form.org || !form.email) {
      alert('성명, 소속, 이메일은 필수입니다.')
      return
    }
    await fetch('/api/experts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name,
        organization: form.org,
        position: form.position,
        field: form.field,
        keywords: form.tags ? form.tags.split(',').map((t: string) => t.trim()) : [],
        email: form.email,
        bio: form.bio,
        status: 'approved',
      })
    })
    setForm({ name: '', org: '', position: '', field: '사회복지정책', tags: '', email: '', bio: '' })
    setShowForm(false)
    setMessage('등록되었습니다.')
    fetchExperts()
    setTimeout(() => setMessage(''), 3000)
  }

  const filtered = tab === 'pending' ? experts.filter(e => e.status === 'pending') : experts
  const pendingCount = experts.filter(e => e.status === 'pending').length

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/admin" className="font-medium text-blue-700">AI 복지 거버넌스</Link>
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md">관리자</span>
        </div>
        <div className="flex gap-4 text-sm">
          <Link href="/admin" className="text-gray-600 hover:text-blue-700">대시보드</Link>
          <Link href="/admin/seminars" className="text-gray-600 hover:text-blue-700">세미나 관리</Link>
          <Link href="/admin/files" className="text-gray-600 hover:text-blue-700">파일 관리</Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-medium">전문가 풀 관리</h1>
          <button onClick={() => setShowForm(true)} className="bg-blue-700 text-white text-sm px-4 py-2 rounded-xl hover:bg-blue-800">+ 직접 등록</button>
        </div>

        {message && <div className="bg-green-50 text-green-700 text-sm px-4 py-3 rounded-xl mb-4">{message}</div>}

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl border p-4 text-center">
            <p className="text-2xl font-medium text-blue-700">{experts.filter(e => e.status === 'approved').length}</p>
            <p className="text-xs text-gray-500 mt-1">승인된 전문가</p>
          </div>
          <div className="bg-white rounded-xl border p-4 text-center">
            <p className="text-2xl font-medium text-amber-500">{pendingCount}</p>
            <p className="text-xs text-gray-500 mt-1">승인 대기</p>
          </div>
          <div className="bg-white rounded-xl border p-4 text-center">
            <p className="text-2xl font-medium text-gray-700">{experts.length}</p>
            <p className="text-xs text-gray-500 mt-1">전체 등록</p>
          </div>
        </div>

        <div className="flex gap-2 mb-4">
          <button onClick={() => setTab('all')} className={`text-sm px-4 py-1.5 rounded-full border transition-colors ${tab === 'all' ? 'bg-blue-700 text-white border-blue-700' : 'bg-white text-gray-600 border-gray-200'}`}>
            전체 ({experts.length})
          </button>
          <button onClick={() => setTab('pending')} className={`text-sm px-4 py-1.5 rounded-full border transition-colors ${tab === 'pending' ? 'bg-amber-500 text-white border-amber-500' : 'bg-white text-gray-600 border-gray-200'}`}>
            승인 대기 ({pendingCount})
          </button>
        </div>

        {loading ? (
          <div className="text-center py-10 text-sm text-gray-400">불러오는 중...</div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map(e => (
              <div key={e.id} className="bg-white rounded-2xl border p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">{e.name}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${statusColor[e.status]}`}>{statusLabel[e.status]}</span>
                    </div>
                    <p className="text-xs text-gray-500">{e.organization} · {e.position} · {e.field}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{e.email}</p>
                    {e.keywords && e.keywords.length > 0 && (
                      <div className="flex gap-1 flex-wrap mt-2">
                        {e.keywords.map((k: string) => (
                          <span key={k} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md">{k}</span>
                        ))}
                      </div>
                    )}
                    {e.bio && <p className="text-xs text-gray-500 mt-2 bg-gray-50 rounded-lg px-3 py-2">{e.bio}</p>}
                  </div>
                  <div className="flex gap-2 ml-4 flex-shrink-0">
                    {e.status === 'pending' && (
                      <>
                        <button onClick={() => handleApprove(e.id)} className="text-xs px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700">승인</button>
                        <button onClick={() => handleReject(e.id)} className="text-xs px-3 py-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200">반려</button>
                      </>
                    )}
                    {e.status === 'approved' && (
                      <button onClick={() => handleReject(e.id)} className="text-xs px-3 py-1.5 border text-gray-500 rounded-lg hover:bg-gray-50">취소</button>
                    )}
                    <button onClick={() => handleDelete(e.id)} className="text-xs px-3 py-1.5 border text-red-400 rounded-lg hover:bg-red-50">삭제</button>
                  </div>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="text-center py-12 text-sm text-gray-400">항목이 없습니다.</div>
            )}
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-medium">전문가 직접 등록 (즉시 승인)</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 text-lg">✕</button>
            </div>
            <div className="flex flex-col gap-3">
              <div><label className="text-xs text-gray-500 block mb-1">성명 *</label><input type="text" placeholder="홍길동" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400" /></div>
              <div><label className="text-xs text-gray-500 block mb-1">소속 기관 *</label><input type="text" placeholder="경기복지재단" value={form.org} onChange={e => setForm({...form, org: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400" /></div>
              <div><label className="text-xs text-gray-500 block mb-1">직위</label><input type="text" placeholder="연구위원" value={form.position} onChange={e => setForm({...form, position: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400" /></div>
              <div><label className="text-xs text-gray-500 block mb-1">전문 분야</label>
                <select value={form.field} onChange={e => setForm({...form, field: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400">
                  <option>사회복지정책</option><option>AI·데이터</option><option>법·행정</option><option>현장·실무</option><option>기타</option>
                </select>
              </div>
              <div><label className="text-xs text-gray-500 block mb-1">전문 키워드</label><input type="text" placeholder="사회보장, AI정책 (쉼표 구분)" value={form.tags} onChange={e => setForm({...form, tags: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400" /></div>
              <div><label className="text-xs text-gray-500 block mb-1">이메일 *</label><input type="email" placeholder="example@organization.kr" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400" /></div>
              <div><label className="text-xs text-gray-500 block mb-1">소개 (선택)</label><textarea placeholder="주요 연구 경력 및 관심 분야" rows={3} value={form.bio} onChange={e => setForm({...form, bio: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400 resize-none" /></div>
              <div className="bg-blue-50 rounded-xl px-4 py-3 text-xs text-blue-600">관리자 직접 등록은 즉시 승인 처리됩니다.</div>
              <button onClick={handleAdd} className="w-full bg-blue-700 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-blue-800">등록 완료</button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
