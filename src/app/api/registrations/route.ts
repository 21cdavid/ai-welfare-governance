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

  let seminarTitle = '세미나'
  let seminarDate = ''
  let seminarVenue = ''

  if (body.seminar_id) {
    const { data: seminar } = await supabase
      .from('seminars')
      .select('title, start_at, venue')
      .eq('id', body.seminar_id)
      .single()
    if (seminar) {
      seminarTitle = seminar.title
      seminarDate = new Date(seminar.start_at).toLocaleString('ko-KR', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit'
      })
      seminarVenue = seminar.venue
    }
  }

  try {
    await resend.emails.send({
      from: 'AI복지거버넌스 <onboarding@resend.dev>',
      to: body.email,
      subject: '[신청완료] ' + seminarTitle + ' 참석 신청이 완료되었습니다',
      html: `
        <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; padding: 32px; background: #f9fafb; border-radius: 16px;">
          <div style="background: #1e3a8a; border-radius: 12px; padding: 24px; margin-bottom: 24px; text-align: center;">
            <h1 style="color: white; font-size: 18px; margin: 0;">AI 복지 거버넌스 플랫폼</h1>
            <p style="color: #93c5fd; font-size: 13px; margin: 8px 0 0;">경기복지재단</p>
          </div>

          <div style="background: white; border-radius: 12px; padding: 24px; margin-bottom: 16px;">
            <h2 style="color: #1e3a8a; font-size: 16px; margin: 0 0 16px;">참석 신청이 완료되었습니다</h2>
            <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 10px 0; color: #64748b; width: 100px;">성명</td>
                <td style="padding: 10px 0; color: #1e293b; font-weight: 500;">${body.name}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 10px 0; color: #64748b;">소속 기관</td>
                <td style="padding: 10px 0; color: #1e293b;">${body.organization || '-'}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #64748b;">이메일</td>
                <td style="padding: 10px 0; color: #1e293b;">${body.email}</td>
              </tr>
            </table>
          </div>

          <div style="background: #eff6ff; border-radius: 12px; padding: 24px; margin-bottom: 16px; border-left: 4px solid #3b82f6;">
            <h3 style="color: #1e40af; font-size: 14px; margin: 0 0 12px;">세미나 정보</h3>
            <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
              <tr style="border-bottom: 1px solid #dbeafe;">
                <td style="padding: 8px 0; color: #3b82f6; width: 60px;">세미나</td>
                <td style="padding: 8px 0; color: #1e3a8a; font-weight: 500;">${seminarTitle}</td>
              </tr>
              <tr style="border-bottom: 1px solid #dbeafe;">
                <td style="padding: 8px 0; color: #3b82f6;">일시</td>
                <td style="padding: 8px 0; color: #1e293b;">${seminarDate}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #3b82f6;">장소</td>
                <td style="padding: 8px 0; color: #1e293b;">${seminarVenue}</td>
              </tr>
            </table>
          </div>

          <div style="background: #f0fdf4; border-radius: 12px; padding: 16px; text-align: center;">
            <p style="color: #16a34a; font-size: 13px; margin: 0;">세미나 7일 전 사전 안내 메일이 발송될 예정입니다.</p>
          </div>

          <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 24px;">
            본 메일은 AI 복지 거버넌스 플랫폼에서 자동 발송된 메일입니다.<br/>
            문의: ${process.env.ADMIN_EMAIL}
          </p>
        </div>
      `
    })
  } catch (emailError) {
    console.error('이메일 발송 오류:', emailError)
  }

  return NextResponse.json(data)
}
