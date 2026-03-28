import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const resend = new Resend(process.env.RESEND_API_KEY)

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const seminarId = searchParams.get('seminar_id')
  let query = supabase.from('registrations').select('*').order('registered_at', { ascending: false })
  if (seminarId) query = query.eq('seminar_id', seminarId)
  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: Request) {
  const body = await req.json()

  const { data, error } = await supabase
    .from('registrations')
    .insert(body)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  try {
    await resend.emails.send({
      from: 'AI복지거버넌스 <onboarding@resend.dev>',
      to: body.email,
      subject: '[신청완료] AI 복지 거버넌스 세미나 참석 신청이 완료되었습니다',
      html: `
        <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; padding: 32px;">
          <h2 style="color: #1e3a8a; margin-bottom: 8px;">참석 신청이 완료되었습니다</h2>
          <p style="color: #6b7280; margin-bottom: 24px;">아래 내용을 확인해주세요.</p>

          <div style="background: #eff6ff; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
            <p style="font-size: 12px; color: #3b82f6; margin: 0 0 6px;">신청자 정보</p>
            <p style="margin: 4px 0; font-size: 14px;"><strong>성명:</strong> ${body.name}</p>
            <p style="margin: 4px 0; font-size: 14px;"><strong>소속:</strong> ${body.organization}</p>
            <p style="margin: 4px 0; font-size: 14px;"><strong>이메일:</strong> ${body.email}</p>
          </div>

          <div style="background: #f9fafb; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
            <p style="font-size: 12px; color: #6b7280; margin: 0 0 6px;">세미나 정보</p>
            <p style="margin: 4px 0; font-size: 14px;"><strong>세미나:</strong> AI 기반 사회보장 급여 적정성 평가 방법론 세미나</p>
            <p style="margin: 4px 0; font-size: 14px;"><strong>일시:</strong> 2026. 04. 15 (화) 14:00–17:00</p>
            <p style="margin: 4px 0; font-size: 14px;"><strong>장소:</strong> 경기복지재단 대회의실</p>
          </div>

          <p style="font-size: 13px; color: #9ca3af;">세미나 7일 전 사전 안내 메일이 발송됩니다.<br>문의: ${process.env.ADMIN_EMAIL}</p>
        </div>
      `,
    })
  } catch (emailError) {
    console.error('이메일 발송 오류:', emailError)
  }

  return NextResponse.json(data)
}
