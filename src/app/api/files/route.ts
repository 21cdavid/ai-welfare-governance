import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function sanitizeFileName(name: string): string {
  const ext = name.split('.').pop() || 'bin'
  const base = name.replace(/\.[^.]+$/, '')
  const sanitized = base
    .replace(/[\(\)\[\]\{\}]/g, '')
    .replace(/[^a-zA-Z0-9가-힣\-]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
    .substring(0, 50)
  const safe = sanitized || 'file'
  return safe + '.' + ext.toLowerCase()
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

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const fileType = formData.get('file_type') as string
    const seminarId = formData.get('seminar_id') as string

    if (!file) return NextResponse.json({ error: '파일이 없습니다.' }, { status: 400 })

    const safeFileName = sanitizeFileName(file.name)
    const folder = seminarId ? seminarId : 'general'
    const filePath = folder + '/' + Date.now() + '_' + safeFileName

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const { error: uploadError } = await supabase.storage
      .from('seminar-files')
      .upload(filePath, buffer, {
        contentType: file.type || 'application/octet-stream',
        upsert: false
      })

    if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 400 })

    const { data, error } = await supabase
      .from('seminar_files')
      .insert({
        seminar_id: seminarId || null,
        file_name: file.name,
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
