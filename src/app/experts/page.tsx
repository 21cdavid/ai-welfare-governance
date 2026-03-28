'use client'
import Link from 'next/link'
import { useState } from 'react'

const experts = [
  { id: 1, name: '김연희', org: '경기복지재단', position: '연구위원', field: 'policy', tags: ['사회보장', 'AI정책'], initial: '김연', color: 'bg-blue-100 text-blue-800' },
  { id: 2, name: '박준서', org: 'KAIST 산업공학과', position: '교수', field: 'ai', tags: ['머신러닝', '행정데이터'], initial: '박준', color: 'bg-teal-100 text-teal-800' },
  { id: 3, name: '이수민', org: '경기도 법무담당관', position: '담당관', field: 'law', tags: ['행정법', '개인정보'], initial: '이수', color: 'bg-orange-100 text-orange-800' },
  { id: 4, name: '최정원', org: '한국보건사회연구원', position: '연구위원', field: 'policy', tags: ['복지재정', '기초생활'], initial: '최정', color: 'bg-purple-100 text-purple-800' },
  { id: 5, name: '오현진', org: '수원시 복지정책과', position: '과장', field: 'field', tags: ['지역사회보장', '현장기획'], initial: '오현', color: 'bg-amber-100 text-amber-800' },
  { id: 6, name: '강태호', org: '서울대학교 행정대학원', position: '교수', field: 'law', tags: ['AI거버넌스', '규제'], initial: '강태', color: 'bg-green-100 text-green-800' },
]

const filters = [
  { key: 'all', label: '전체' },
  { key: 'policy', label: '사회복지정책' },
  { key: 'ai', label: 'AI·데이터' },
  { key: 'law', label: '법·행정' },
  { key: 'field', label: '현장·실무' },
]

export default function ExpertsPage() {
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({ name: '', org: '', position: '', field: '사회복지정책', tags: '', email: '', bio: '' })

  const filtered = experts.filter(e => {
    const matchFilter = filter === 'all' || e.field === filter
    const matchSearch = search === '' || e.name.includes(search) || e.org.includes(search) || e.tags.some(t => t.includes(search))
    return matchFilter && matchSearch
  })

  const handleSubmit = () => {
    if (!form.name || !form.org || !form.email) {
      alert('성명, 소속, 이메일은 필수입니다.')
      return
    }
    setSubmitted(true)
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <Link href="/" className="font-medium text-blue-700">AI 복지 거버넌스</Link>
        <div className="flex gap-4 text-sm">
          <Link href="/seminars" className="text-gray-600 hover:text-blue-700">세미나</Link>
          <Link href="/experts" className="text-blue-700 font-medium">전문가 풀</Link>
        </div>
      </nav>
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-medium">전문가 풀</h1>
            <p className="text-sm text-gray-500 mt-1">AI 복지 거버넌스 위원 {experts.length}명 등록</p>
          </div>
          <button onClick={() => { setShowForm(true); setSubmitted(false) }} className="bg-blue-700 text-white text-sm px-4 py-2 rounded-xl hover:bg-blue-800">+ 등록 신청</button>
        </div>
        <input type="text" placeholder="이름, 기관, 전문분야 검색..." className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm mb-4 focus:outline-none focus:border-blue-400" value={search} onChange={e => setSearch(e.target.value)} />
        <div className="flex gap-2 flex-wrap mb-6">
          {filters.map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)} className={`text-sm px-4 py-1.5 rounded-full border transition-colors ${filter === f.key ? 'bg-blue-700 text-white border-blue-700' : 'bg-white text-gray-600 border-gray-200 hover:bg-blue-50'}`}>{f.label}</button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {filtered.map(e => (
            <div key={e.id} className="bg-white rounded-2xl border p-5 text-center hover:border-blue-200 transition-all">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-medium mx-auto mb-3 ${e.color}`}>{e.initial}</div>
              <p className="text-sm font-medium">{e.name}</p>
              <p className="text-xs text-gray-500 mb-1">{e.position}</p>
              <p className="text-xs text-gray-400 mb-3">{e.org}</p>
              <div className="flex flex-wrap gap-1 justify-center">
                {e.tags.map(t => (<span key={t} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md">{t}</span>))}
              </div>
            </div>
          ))}
          {filtered.length === 0 && <div className="col-span-3 text-center py-12 text-sm text-gray-400">검색 결과가 없습니다.</div>}
        </div>
      </div>
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-screen overflow-y-auto">
            {submitted ? (
              <div className="text-center py-8">
                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"><span className="text-green-600 text-2xl">✓</span></div>
                <h2 className="text-base font-medium mb-2">등록 신청 완료</h2>
                <p className="text-sm text-gray-500 mb-6">검토 후 승인 시 전문가 풀에 등재됩니다.</p>
                <button onClick={() => setShowForm(false)} className="bg-blue-700 text-white text-sm px-6 py-2.5 rounded-xl">닫기</button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-medium">전문가 등록 신청</h2>
                  <button onClick={() => setShowForm(false)} className="text-gray-400 text-lg">✕</button>
                </div>
                <div className="bg-blue-50 rounded-xl px-4 py-3 text-xs text-blue-600 mb-4">관리자 검토·승인 후 전문가 풀에 등재됩니다.</div>
                <div className="flex flex-col gap-3">
                  <div><label className="text-xs text-gray-500 block mb-1">성명 *</label><input type="text" placeholder="홍길동" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400" /></div>
                  <div><label className="text-xs text-gray-500 block mb-1">소속 기관 *</label><input type="text" placeholder="경기복지재단" value={form.org} onChange={e => setForm({...form, org: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400" /></div>
                  <div><label className="text-xs text-gray-500 block mb-1">직위</label><input type="text" placeholder="연구위원" value={form.position} onChange={e => setForm({...form, position: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400" /></div>
                  <div><label className="text-xs text-gray-500 block mb-1">전문 분야</label><select value={form.field} onChange={e => setForm({...form, field: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400"><option>사회복지정책</option><option>AI·데이터</option><option>법·행정</option><option>현장·실무</option><option>기타</option></select></div>
                  <div><label className="text-xs text-gray-500 block mb-1">전문 키워드</label><input type="text" placeholder="사회보장, AI정책 (쉼표 구분)" value={form.tags} onChange={e => setForm({...form, tags: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400" /></div>
                  <div><label className="text-xs text-gray-500 block mb-1">이메일 *</label><input type="email" placeholder="example@organization.kr" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400" /></div>
                  <div><label className="text-xs text-gray-500 block mb-1">자기소개 (선택)</label><textarea placeholder="주요 연구 경력 및 관심 분야" rows={3} value={form.bio} onChange={e => setForm({...form, bio: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400 resize-none" /></div>
                  <button onClick={handleSubmit} className="w-full bg-blue-700 text-white py-3 rounded-xl text-sm font-medium hover:bg-blue-800 mt-1">등록 신청</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  )
}
