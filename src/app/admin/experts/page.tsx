'use client'
import Link from 'next/link'
import { useState } from 'react'

type Expert = {
  id: number
  name: string
  org: string
  position: string
  field: string
  tags: string
  email: string
  bio: string
  status: 'approved' | 'pending' | 'rejected'
  registeredBy: 'admin' | 'self'
}

const initExperts: Expert[] = [
  { id: 1, name: '김연희', org: '경기복지재단', position: '연구위원', field: '사회복지정책', tags: '사회보장, AI정책', email: 'kim@ggwf.or.kr', bio: '', status: 'approved', registeredBy: 'admin' },
  { id: 2, name: '박준서', org: 'KAIST 산업공학과', position: '교수', field: 'AI·데이터', tags: '머신러닝, 행정데이터', email: 'park@kaist.ac.kr', bio: '', status: 'approved', registeredBy: 'admin' },
  { id: 3, name: '이수민', org: '경기도 법무담당관', position: '담당관', field: '법·행정', tags: '행정법, 개인정보', email: 'lee@gg.go.kr', bio: '', status: 'approved', registeredBy: 'admin' },
  { id: 4, name: '홍길동', org: '수원시청', position: '주임', field: '현장·실무', tags: '지역복지, 사례관리', email: 'hong@suwon.go.kr', bio: '사회복지 현장 10년 경력', status: 'pending', registeredBy: 'self' },
  { id: 5, name: '정민아', org: '성균관대학교', position: '박사과정', field: 'AI·데이터', tags: '복지빅데이터, NLP', email: 'jung@skku.edu', bio: '복지 텍스트 분석 연구', status: 'pending', registeredBy: 'self' },
]

const fieldOptions = ['사회복지정책', 'AI·데이터', '법·행정', '현장·실무', '기타']
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
  const [experts, setExperts] = useState<Expert[]>(initExperts)
  const [tab, setTab] = useState<'all' | 'pending'>('all')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', org: '', position: '', field: '사회복지정책', tags: '', email: '', bio: '' })

  const filtered = tab === 'pending' ? experts.filter(e => e.status === 'pending') : experts

  const approve = (id: number) => setExperts(prev => prev.map(e => e.id === id ? { ...e, status: 'approved' } : e))
  const reject = (id: number) => setExperts(prev => prev.map(e => e.id === id ? { ...e, status: 'rejected' } : e))
  const remove = (id: number) => setExperts(prev => prev.filter(e => e.id !== id))

  const handleAdd = () => {
    if (!form.name || !form.org || !form.email) return alert('성명, 소속, 이메일은 필수입니다.')
    setExperts(prev => [...prev, {
      id: Date.now(),
      ...form,
      status: 'approved',
      registeredBy: 'admin',
    }])
    setForm({ name: '', org: '', position: '', field: '사회복지정책', tags: '', email: '', bio: '' })
    setShowForm(false)
  }

  const pendingCount = experts.filter(e => e.status === 'pending').length

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <Link href="/" className="font-medium text-blue-700">AI 복지 거버넌스</Link>
        <div className="flex gap-4 text-sm">
          <Link href="/admin" className="text-gray-600 hover:text-blue-700">관리자 홈</Link>
          <Link href="/experts" className="text-gray-600 hover:text-blue-700">전문가 풀 (공개)</Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-medium">전문가 풀 관리</h1>
          <button onClick={() => setShowForm(true)} className="bg-blue-700 text-white text-sm px-4 py-2 rounded-xl hover:bg-blue-800">
            + 직접 등록
          </button>
        </div>

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

        <div className="flex flex-col gap-3">
          {filtered.map(e => (
            <div key={e.id} className="bg-white rounded-2xl border p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium">{e.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${statusColor[e.status]}`}>{statusLabel[e.status]}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-md ${e.registeredBy === 'admin' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                      {e.registeredBy === 'admin' ? '관리자 등록' : '자기 신청'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">{e.org} · {e.position} · {e.field}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{e.email}</p>
                  {e.tags && <div className="flex gap-1 flex-wrap mt-2">{e.tags.split(',').map(t => <span key={t} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md">{t.trim()}</span>)}</div>}
                  {e.bio && <p className="text-xs text-gray-500 mt-2 bg-gray-50 rounded-lg px-3 py-2">{e.bio}</p>}
                </div>
                <div className="flex gap-2 ml-4 flex-shrink-0">
                  {e.status === 'pending' && (
                    <>
                      <button onClick={() => approve(e.id)} className="text-xs px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700">승인</button>
                      <button onClick={() => reject(e.id)} className="text-xs px-3 py-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200">반려</button>
                    </>
                  )}
                  {e.status === 'approved' && (
                    <button onClick={() => reject(e.id)} className="text-xs px-3 py-1.5 border text-gray-500 rounded-lg hover:bg-gray-50">취소</button>
                  )}
                  <button onClick={() => remove(e.id)} className="text-xs px-3 py-1.5 border text-red-400 rounded-lg hover:bg-red-50">삭제</button>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-12 text-sm text-gray-400">항목이 없습니다.</div>
          )}
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-medium">전문가 직접 등록 (즉시 승인)</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="flex flex-col gap-3">
              <input type="text" placeholder="성명 *" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400" />
              <input type="text" placeholder="소속 기관 *" value={form.org} onChange={e => setForm({...form, org: e.target.value})} className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400" />
              <input type="text" placeholder="직위" value={form.position} onChange={e => setForm({...form, position: e.target.value})} className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400" />
              <select value={form.field} onChange={e => setForm({...form, field: e.target.value})} className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400">
                {fieldOptions.map(f => <option key={f}>{f}</option>)}
              </select>
              <input type="text" placeholder="전문 키워드 (쉼표 구분)" value={form.tags} onChange={e => setForm({...form, tags: e.target.value})} className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400" />
              <input type="email" placeholder="이메일 *" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400" />
              <textarea placeholder="소개 (선택)" rows={3} value={form.bio} onChange={e => setForm({...form, bio: e.target.value})} className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400 resize-none" />
              <div className="bg-blue-50 rounded-xl px-4 py-3 text-xs text-blue-600">관리자 직접 등록은 즉시 승인 처리됩니다.</div>
              <button onClick={handleAdd} className="w-full bg-blue-700 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-blue-800">등록 완료</button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
