import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const resend = new Resend(process.env.RESEND_API_KEY)

export async function GET() {
  const now = new Date()
  const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

  const startOfDay = new Date(sevenDaysLater)
  startOfDay.setHours(0, 0, 0, 0)
  const endOfDay = new Date(sevenDaysLater)
  endOfDay.setHours(23, 59, 59, 999)

  const { data: seminars } = await supabase
    .from('seminars')
    .select('*')
    .gte('start_at', startOfDay.toISOString())
    .lte('start_at', endOfDay.toISOString())
    .neq('status', 'closed')

  if (!seminars || seminars.length === 0) {
    return NextResponse.json({ message: '7일 후 세미나 없음' })
  }

  let totalSent = 0

  for (const seminar of seminars) {
    const { data: registrations } = await supabase
      .from('registrations')
      .select('*')
      .eq('seminar_id', seminar.id)
      .neq('notify_method', 'none')

    if (!registrations || registrations.length === 0) continue

    const seminarDate = new Date(seminar.start_at).toLocaleString('ko-KR', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit'
    })

    for (const reg of registrations) {
      try {
        await resend.emails.send({
          from: 'AI복지거버넌스 <onboarding@resend.dev>',
          to: reg.email,
          subject: '[D-7 사전안내] ' + seminar.title + ' 세미나가 7일 후 개최됩니다',
          html: `
            <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; padding: 32px; background: #f9fafb; border-radius: 16px;">
              <div style="background: #1e3a8a; border-radius: 12px; padding: 24px; margin-bottom: 24px; text-align: center;">
                <h1 style="color: white; font-size: 18px; margin: 0;">AI 복지 거버넌스 플랫폼</h1>
                <p style="color: #93c5fd; font-size: 13px; margin: 8px 0 0;">경기복지재단</p>
              </div>

              <div style="background: #fefce8; border-radius: 12px; padding: 20px; margin-bottom: 20px; border-left: 4px solid #eab308; text-align: center;">
                <p style="color: #854d0e; font-size: 24px; font-weight: bold; margin: 0;">D - 7</p>
                <p style="color: #a16207; font-size: 13px; margin: 8px 0 0;">세미나가 7일 후 개최됩니다</p>
              </div>

              <div style="background: white; border-radius: 12px; padding: 24px; margin-bottom: 16px;">
                <h2 style="color: #1e3a8a; font-size: 15px; margin: 0 0 16px;">${seminar.title}</h2>
                <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
                  <tr style="border-bottom: 1px solid #f1f5f9;">
                    <td style="padding: 8px 0; color: #64748b; width: 60px;">일시</td>
                    <td style="padding: 8px 0; color: #1e293b;">${seminarDate}</td>
                  </tr>
                  <tr style="border-bottom: 1px solid #f1f5f9;">
                    <td style="padding: 8px 0; color: #64748b;">장소</td>
                    <td style="padding: 8px 0; color: #1e293b;">${seminar.venue}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #64748b;">신청자</td>
                    <td style="padding: 8px 0; color: #1e293b;">${reg.name} (${reg.organization || ''})</td>
                  </tr>
                </table>
              </div>

              <div style="background: #eff6ff; border-radius: 12px; padding: 16px; text-align: center;">
                <p style="color: #1d4ed8; font-size: 13px; margin: 0;">참석 관련 문의사항이 있으시면 아래로 연락 바랍니다.</p>
                <p style="color: #1d4ed8; font-size: 13px; margin: 8px 0 0; font-weight: 500;">${process.env.ADMIN_EMAIL}</p>
              </div>

              <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 24px;">
                본 메일은 AI 복지 거버넌스 플랫폼에서 자동 발송된 메일입니다.
              </p>
            </div>
          `
        })
        totalSent++
      } catch (e) {
        console.error('D-7 이메일 오류:', e)
      }
    }
  }

  return NextResponse.json({ message: totalSent + '명에게 D-7 알림 발송 완료' })
}
