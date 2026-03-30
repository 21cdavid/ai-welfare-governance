import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import * as XLSX from 'xlsx'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const seminarId = searchParams.get('seminar_id')
  const seminarTitle = searchParams.get('title') || '신청자목록'

  let query = supabase
    .from('registrations')
    .select('*')
    .order('registered_at', { ascending: true })

  if (seminarId) query = query.eq('seminar_id', seminarId)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const rows = (data || []).map((r: any, i: number) => ({
    '번호': i + 1,
    '성명': r.name,
    '소속 기관': r.organization || '',
    '직위': r.position || '',
    '이메일': r.email || '',
    '연락처': r.phone || '',
    '알림 수신': r.notify_method || '',
    '신청일시': new Date(r.registered_at).toLocaleString('ko-KR'),
  }))

  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.json_to_sheet(rows)
  ws['!cols'] = [
    { wch: 6 }, { wch: 10 }, { wch: 20 }, { wch: 12 },
    { wch: 25 }, { wch: 15 }, { wch: 12 }, { wch: 20 },
  ]
  XLSX.utils.book_append_sheet(wb, ws, '신청자목록')

  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })
  const fileName = encodeURIComponent(seminarTitle + '_신청자목록.xlsx')

  return new NextResponse(buf, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename*=UTF-8\'\''+fileName,
    }
  })
}
