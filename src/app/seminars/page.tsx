import Link from 'next/link'

async function getSeminars() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL + '/rest/v1/seminars?order=start_at.asc'
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const res = await fetch(url, {
      headers: { apikey: key, Authorization: 'Bearer ' + key },
      cache: 'no-store',
    })
    return await res.json()
  } catch {
    return []
  }
}

async function getSeminarFiles(seminarId) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL + '/rest/v1/seminar_files?seminar_id=eq.' + seminarId
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const res = await fetch(url, {
      headers: { apikey: key, Authorization: 'Bearer ' + key },
      cache: 'no-store',
    })
    return await res.json()
  } catch {
    return []
  }
}

export default async function SeminarsPage() {
  const seminars = await getSeminars()
  const seminarsWithFiles = await Promise.all(
    seminars.map(async (s) => ({ ...s, files: await getSeminarFiles(s.id) }))
  )
  seminarsWithFiles.sort((a, b) => {
    const score = (s: any) => s.status === 'closed' ? 1 : 0
    if (score(a) !== score(b)) return score(a) - score(b)
    return new Date(a.start_at).getTime() - new Date(b.start_at).getTime()
  })

  const statusLabel = { open: '접수 중', upcoming: '예정', closed: '종료' }
  const statusColor = { open: 'bg-green-100 text-green-700', upcoming: 'bg-blue-100 text-blue-700', closed: 'bg-gray-100 text-gray-500' }

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <Link href="/" className="font-medium text-blue-700">AI 복지 거버넌스</Link>
        <div className="flex gap-4 text-sm">
          <Link href="/seminars" className="text-blue-700 font-medium">세미나</Link>
        </div>
      </nav>
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-medium">세미나 목록</h1>
          <span className="text-sm text-gray-500">총 {seminarsWithFiles.length}건</span>
        </div>
        <div className="flex flex-col gap-4">
          {seminarsWithFiles.map((s) => (
            <div key={s.id} className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="mb-3">
                <span className={statusColor[s.status] + ' text-xs font-medium px-2 py-1 rounded-md'}>
                  {statusLabel[s.status] || s.status}
                </span>
              </div>
              <h2 className="text-base font-medium mb-3">{s.title}</h2>
              <div className="text-sm text-gray-500 space-y-1 mb-4">
                <p>📅 {new Date(s.start_at).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}</p>
                <p>📍 {s.venue}</p>
                <p>👤 주관: {s.organizer}</p>
              </div>
              {s.files && s.files.length > 0 && (
                <div className="border-t pt-4 mb-4">
                  <p className="text-xs text-gray-500 font-medium mb-2">첨부 자료</p>
                  <FileList files={s.files} />
                </div>
              )}
              <div className="flex gap-2 mt-2">
                {s.status !== 'closed' ? (
                  <Link href={'/seminars/' + s.id + '/register'} className="bg-blue-700 text-white text-sm px-4 py-2 rounded-xl hover:bg-blue-800">
                    참석 신청
                  </Link>
                ) : (
                  <span className="text-sm px-4 py-2 rounded-xl border border-gray-200 text-gray-400">신청 마감</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}

function FileList({ files }: { files: any[] }) {
  return (
    <div className="flex flex-col gap-1">
      {files.map((f) => (
        <div key={f.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
          <span className="text-xs text-gray-600">📄 {f.file_name}</span>
          <DownloadLink path={f.file_path} name={f.file_name} />
        </div>
      ))}
    </div>
  )
}

function DownloadLink({ path, name }: { path: string; name: string }) {
  const url = '/api/download?path=' + path
  return (
    <a href={url} className="text-xs text-blue-700 hover:underline" target="_blank" rel="noreferrer">
      다운로드
    </a>
  )
}
