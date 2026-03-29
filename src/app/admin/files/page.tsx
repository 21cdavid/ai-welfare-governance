'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'

const typeColor: Record<string, string> = {
  '발표자료': 'bg-blue-100 text-blue-700',
  '사전자료': 'bg-teal-100 text-teal-700',
  '결과보고서': 'bg-purple-100 text-purple-700',
  '참고문헌': 'bg-amber-100 text-amber-700',
}

export default function AdminFilesPage() {
  const [files, setFiles] = useState<any[]>([])
  const [seminars, setSeminars] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')
  const [fileType, setFileType] = useState('발표자료')
  const [seminarId, setSeminarId] = useState('')

  useEffect(() => {
    fetchFiles()
    fetchSeminars()
  }, [])

  const fetchFiles = async () => {
    setLoading(true)
    const res = await fetch('/api/files')
    const data = await res.json()
    setFiles(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  const fetchSeminars = async () => {
    const res = await fetch('/api/seminars')
    const data = await res.json()
    setSeminars(Array.isArray(data) ? data : [])
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setMessage('')
    const fd = new FormData()
    fd.append('file', file)
    fd.append('file_type', fileType)
    if (seminarId) fd.append('seminar_id', seminarId)
    try {
      const res = await fetch('/api/files', { method: 'POST', body: fd })
      const data = await res.json()
      if (res.ok) {
        setMessage('✓ 업로드 완료: ' + file.name)
        fetchFiles()
      } else {
        setMessage('✗ 업로드 실패: ' + (data.error || ''))
      }
    } catch {
      setMessage('✗ 오류가 발생했습니다.')
    }
    setUploading(false)
    e.target.value = ''
    setTimeout(() => setMessage(''), 4000)
  }

  const handleDownload = async (filePath: string, fileName: string) => {
    const res = await fetch('/api/files?path=' + encodeURIComponent(filePath))
    const data = await res.json()
    if (data.url) {
      const a = document.createElement('a')
      a.href = data.url
      a.download = fileName
      a.click()
    }
  }

  const handleDelete = async (id: string, filePath: string) => {
    if (!confirm('파일을 삭제하시겠습니까?')) return
    await fetch('/api/files?id=' + id + '&path=' + encodeURIComponent(filePath), { method: 'DELETE' })
    fetchFiles()
  }

  const getSeminarTitle = (id: string) => {
    const s = seminars.find(s => s.id === id)
    return s ? s.title.substring(0, 20) + '...' : '-'
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
          <Link href="/admin/seminars" className="text-gray-600 hover:text-blue-700">세미나 관리</Link>
          <Link href="/admin/experts" className="text-gray-600 hover:text-blue-700">전문가 관리</Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-medium">파일 관리</h1>
            <p className="text-sm text-gray-500 mt-1">세미나 자료 업로드 및 다운로드 관리</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border p-6 mb-6">
          <h2 className="text-sm font-medium mb-4">파일 업로드</h2>
          <div className="flex items-end gap-4 flex-wrap">
            <div>
              <label className="text-xs text-gray-500 block mb-1">세미나 선택</label>
              <select
                value={seminarId}
                onChange={e => setSeminarId(e.target.value)}
                className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400 min-w-48"
              >
                <option value="">세미나 선택 (선택사항)</option>
                {seminars.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.title.length > 20 ? s.title.substring(0, 20) + '...' : s.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">파일 유형</label>
              <select
                value={fileType}
                onChange={e => setFileType(e.target.value)}
                className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400"
              >
                <option>발표자료</option>
                <option>사전자료</option>
                <option>결과보고서</option>
                <option>참고문헌</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">파일 선택 후 자동 업로드</label>
              <label className={`cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white ${uploading ? 'bg-gray-400' : 'bg-blue-700 hover:bg-blue-800'}`}>
                {uploading ? '업로드 중...' : '📁 파일 선택'}
                <input
                  type="file"
                  accept=".pdf,.pptx,.docx,.xlsx,.hwp"
                  onChange={handleFileChange}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            </div>
          </div>
          {message && (
            <div className={`mt-3 text-sm px-4 py-2 rounded-xl ${message.includes('✓') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
              {message}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">파일명</th>
                <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">유형</th>
                <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">연결 세미나</th>
                <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">업로드일</th>
                <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">관리</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="text-center py-10 text-sm text-gray-400">불러오는 중...</td></tr>
              ) : files.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-10 text-sm text-gray-400">업로드된 파일이 없습니다.</td></tr>
              ) : files.map(f => (
                <tr key={f.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span>📄</span>
                      <span className="text-sm font-medium text-gray-700">{f.file_name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${typeColor[f.file_type] || 'bg-gray-100 text-gray-600'}`}>{f.file_type}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {f.seminar_id ? getSeminarTitle(f.seminar_id) : '-'}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">
                    {new Date(f.uploaded_at).toLocaleDateString('ko-KR')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => handleDownload(f.file_path, f.file_name)} className="text-xs px-2.5 py-1 border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-50">다운로드</button>
                      <button onClick={() => handleDelete(f.id, f.file_path)} className="text-xs px-2.5 py-1 border text-red-400 rounded-lg hover:bg-red-50">삭제</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}
