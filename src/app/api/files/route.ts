import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function sanitizeFileName(name: string): string {
  const ext = name.split('.').pop() || ''
  const base = name.replace(/\.[^.]+$/, '')
  const sanitized = base
    .replace(/[^a-zA-Z0-9가-힣]/g, '_')
    .replace(/_+/g, '_')
    .substring(0, 50)
  return sanitized + '.' + ext
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const filePath = searchParams.get('path')

  if (filePath) {
    const { data, error } = await supabase.storage
      .from('seminar-files')
      .createSignedUrl(filePath, 3600)
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ url: data.signedUrl })
  }

  const { data, error } = await supabase
    .from('seminar_files')
    .select('*')
    .order('uploaded_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const fileType = formData.get('file_type') as string

    if (!file) return NextResponse.json({ error: '파일이 없습니다.' }, { status: 400 })

    const safeFileName = sanitizeFileName(file.name)
    const filePath = 'general/' + Date.now() + '_' + safeFileName

    console.log('업로드 파일:', file.name, '->', filePath)

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const { error: uploadError } = await supabase.storage
      .from('seminar-files')
      .upload(filePath, buffer, {
        contentType: file.type || 'application/octet-stream',
        upsert: false
      })

    if (uploadError) {
      console.error('업로드 오류:', uploadError)
      return NextResponse.json({ error: uploadError.message }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('seminar_files')
      .insert({
        seminar_id: null,
        file_name: file.name,
        file_path: filePath,
        file_type: fileType || '기타',
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json(data)
  } catch (e: any) {
    console.error('예외:', e)
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
