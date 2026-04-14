import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function sanitizeFileName(name: string): string {
  const ext = (name.split('.').pop() || 'bin').toLowerCase()
  const allowed = ['pdf','pptx','ppt','docx','doc','xlsx','xls','hwp','hwpx','zip','png','jpg','jpeg','txt','csv','key']
  const safeExt = allowed.includes(ext) ? ext : 'bin'
  return 'file_' + Date.now() + '.' + safeExt
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const filePath = searchParams.get('path')
  const seminarId = searchParams.get('seminar_id')

  if (filePath) {
    const { data, error } = await supabase.storage
      .from('seminar-files')
      .createSignedUrl(filePath, 3600)
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ url: data.signedUrl })
  }

  let query = supabase.from('seminar_files').select('*').order('uploaded_at', { ascending: false })
  if (seminarId) query = query.eq('seminar_id', seminarId)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// PUT: presigned upload URL 생성 (브라우저 → Supabase 직접 업로드)
export async function PUT(req: Request) {
  try {
    const { fileName, seminarId } = await req.json()
    if (!fileName) return NextResponse.json({ error: '파일명이 없습니다.' }, { status: 400 })

    const safeFileName = sanitizeFileName(fileName)
    const folder = seminarId || 'general'
    const filePath = folder + '/' + Date.now() + '_' + safeFileName

    const { data, error } = await supabase.storage
      .from('seminar-files')
      .createSignedUploadUrl(filePath)

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ signedUrl: data.signedUrl, token: data.token, path: filePath })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// PATCH: 업로드 완료 후 DB에 메타데이터 저장
export async function PATCH(req: Request) {
  try {
    const { fileName, filePath, fileType, seminarId } = await req.json()
    if (!fileName || !filePath) return NextResponse.json({ error: '필수 항목 누락' }, { status: 400 })

    const { data, error } = await supabase
      .from('seminar_files')
      .insert({
        seminar_id: seminarId || null,
        file_name: fileName,
        file_path: filePath,
        file_type: fileType || '기타',
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json(data)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url)
  const filePath = searchParams.get('path')
  const fileId = searchParams.get('id')

  if (filePath) await supabase.storage.from('seminar-files').remove([filePath])
  if (fileId) await supabase.from('seminar_files').delete().eq('id', fileId)

  return NextResponse.json({ success: true })
}
