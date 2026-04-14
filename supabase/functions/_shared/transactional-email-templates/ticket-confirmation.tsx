import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Html, Preview, Text, Section, Row, Column, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "Стратегия наследия"

interface TicketConfirmationProps {
  guest_name?: string
  ticket_code?: string
  event_title?: string
  event_date?: string
  seats_count?: number
  venue?: string
}

const TicketConfirmationEmail = ({
  guest_name = 'Гость',
  ticket_code = 'XXXXXXXXXXXX',
  event_title = 'Стратегия наследия',
  event_date = '',
  seats_count = 1,
  venue = '',
}: TicketConfirmationProps) => {
  const seatsText = seats_count === 1 ? '1 место' : seats_count < 5 ? `${seats_count} места` : `${seats_count} мест`;

  let formattedDate = ''
  let formattedTime = ''
  if (event_date) {
    const d = new Date(event_date)
    formattedDate = d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
    formattedTime = d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
  }

  const displayCode = ticket_code.toUpperCase()

  return (
    <Html lang="ru" dir="ltr">
      <Head>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Special+Elite&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap');
        `}</style>
      </Head>
      <Preview>🎫 Ваш билет на «{event_title}»</Preview>
      <Body style={main}>
        <Container style={outerContainer}>
          {/* ═══ Ticket card ═══ */}
          <Section style={ticketCard}>

            {/* Top decorative border */}
            <Text style={decorBorderTop}>✦ ─── ✧ ─── ✦ ─── ✧ ─── ✦ ─── ✧ ─── ✦</Text>

            {/* БИЛЕТ */}
            <Text style={ticketHeader}>Б И Л Е Т</Text>

            {/* Decorative separator */}
            <Text style={decorSeparator}>⸻⸻⸻⸻⸻</Text>

            {/* Event info */}
            <Text style={eventSubtitle}>Экскурс</Text>
            <Text style={eventTitle}>«{event_title}»</Text>

            {/* Decorative separator */}
            <Text style={decorSeparator}>⸻⸻⸻⸻⸻</Text>

            {/* Tagline */}
            <Text style={tagline}>
              Возможность прикоснуться к прошлому,
              чтобы повлиять на будущее.
            </Text>

            {/* Fields — typewriter style */}
            <Section style={fieldsBlock}>
              <Text style={fieldRow}>
                <span style={fieldLabel}>Гость:</span>{' '}
                <span style={fieldValue}>{guest_name}</span>
              </Text>

              {formattedDate && (
                <Text style={fieldRow}>
                  <span style={fieldLabel}>Дата:</span>{' '}
                  <span style={fieldValue}>{formattedDate}</span>
                </Text>
              )}

              {formattedTime && (
                <Text style={fieldRow}>
                  <span style={fieldLabel}>Время:</span>{' '}
                  <span style={fieldValue}>{formattedTime}</span>
                </Text>
              )}

              {venue && (
                <Text style={fieldRow}>
                  <span style={fieldLabel}>Место:</span>{' '}
                  <span style={fieldValue}>{venue}</span>
                </Text>
              )}

            </Section>

            {/* Bottom decorative border */}
            <Text style={decorBorderBottom}>✦ ─── ✧ ─── ✦ ─── ✧ ─── ✦ ─── ✧ ─── ✦</Text>

          </Section>

          {/* ═══ Tear-off stub ═══ */}
          <Section style={tearLineSection}>
            <Text style={tearLineText}>✂ ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄</Text>
          </Section>

          <Section style={stubCard}>
            <Row>
              <Column style={stubLeft}>
                <Text style={stubSiteName}>{SITE_NAME}</Text>
                <Text style={stubHint}>Покажите при входе</Text>
              </Column>
              <Column style={stubRight}>
                <Text style={stubNoLabel}>№</Text>
                <Text style={stubCode}>{displayCode}</Text>
              </Column>
            </Row>
          </Section>

          {/* Footer hint */}
          <Text style={hintText}>💡 Сохраните это письмо или сделайте скриншот билета</Text>
          <Text style={contactText}>
            При возникновении любых вопросов обращайтесь:{' '}
            <a href="https://t.me/corphacker" style={telegramLink}>@corphacker в Telegram</a>
          </Text>
          <Text style={footerText}>{SITE_NAME} — экскурс для тех, кто думает о будущем</Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: TicketConfirmationEmail,
  subject: (data: Record<string, any>) => `🎫 Ваш билет: ${data.event_title || 'Мероприятие'}`,
  displayName: 'Подтверждение билета',
  previewData: {
    guest_name: 'Иван Петров',
    ticket_code: '8FBCEDE18046',
    event_title: 'Стратегия наследия',
    event_date: '2026-05-15T19:00:00',
    seats_count: 2,
    venue: 'Москва, ул. Тверская, 1',
  },
} satisfies TemplateEntry

/* ─── Styles ─── */

const main = {
  backgroundColor: '#ffffff',
  fontFamily: "'Playfair Display', 'Georgia', 'Times New Roman', serif",
}

const outerContainer = {
  maxWidth: '480px',
  margin: '20px auto',
  padding: '0 12px',
}

const ticketCard = {
  backgroundColor: '#f5edd4',
  backgroundImage: 'linear-gradient(170deg, #efe5c8 0%, #f5edd4 25%, #f0e6c6 50%, #ece0be 75%, #e8daB4 100%)',
  borderRadius: '10px 10px 0 0',
  border: '2px solid #c9ad7a',
  borderBottom: 'none',
  padding: '28px 28px 20px',
  boxShadow: '0 2px 16px rgba(120, 90, 40, 0.12), inset 0 0 60px rgba(200, 175, 130, 0.15)',
}

const decorBorderTop = {
  textAlign: 'center' as const,
  color: '#a08850',
  fontSize: '11px',
  margin: '0 0 16px',
  letterSpacing: '1px',
  opacity: '0.6',
}

const decorBorderBottom = {
  textAlign: 'center' as const,
  color: '#a08850',
  fontSize: '11px',
  margin: '16px 0 0',
  letterSpacing: '1px',
  opacity: '0.6',
}

const ticketHeader = {
  fontSize: '32px',
  fontWeight: '700' as const,
  color: '#2a1a08',
  textAlign: 'center' as const,
  margin: '0 0 4px',
  letterSpacing: '8px',
  fontFamily: "'Playfair Display', Georgia, serif",
}

const decorSeparator = {
  textAlign: 'center' as const,
  color: '#c9ad7a',
  fontSize: '14px',
  margin: '6px 0',
  letterSpacing: '2px',
  opacity: '0.5',
}

const eventSubtitle = {
  fontSize: '16px',
  color: '#6a5530',
  textAlign: 'center' as const,
  margin: '10px 0 2px',
  fontStyle: 'italic' as const,
  fontFamily: "'Playfair Display', Georgia, serif",
}

const eventTitle = {
  fontSize: '24px',
  fontWeight: '700' as const,
  color: '#2a1a08',
  textAlign: 'center' as const,
  margin: '0 0 4px',
  fontFamily: "'Playfair Display', Georgia, serif",
}

const tagline = {
  fontSize: '13px',
  color: '#7a6840',
  textAlign: 'center' as const,
  margin: '10px 20px 20px',
  lineHeight: '1.6',
  fontStyle: 'italic' as const,
}

const fieldsBlock = {
  padding: '0 4px',
}

const fieldRow = {
  fontSize: '14px',
  color: '#3a2a10',
  margin: '7px 0',
  lineHeight: '1.4',
}

const fieldLabel: React.CSSProperties = {
  fontFamily: "'Playfair Display', Georgia, serif",
  fontWeight: 700,
  color: '#3a2a10',
  fontSize: '14px',
}

const fieldValue: React.CSSProperties = {
  fontFamily: "'Special Elite', 'Courier New', monospace",
  fontWeight: 'normal',
  color: '#1a1008',
  fontSize: '14px',
}

/* ─── Tear-off stub ─── */

const tearLineSection = {
  padding: '0',
  margin: '0',
}

const tearLineText = {
  textAlign: 'center' as const,
  color: '#b09860',
  fontSize: '12px',
  margin: '0',
  padding: '6px 0',
  backgroundColor: '#ede3c6',
  borderLeft: '2px solid #c9ad7a',
  borderRight: '2px solid #c9ad7a',
  letterSpacing: '0px',
  lineHeight: '1',
}

const stubCard = {
  backgroundColor: '#f0e6c6',
  backgroundImage: 'linear-gradient(170deg, #ece0be 0%, #f0e6c6 100%)',
  borderRadius: '0 0 10px 10px',
  border: '2px solid #c9ad7a',
  borderTop: 'none',
  padding: '14px 24px 18px',
}

const stubLeft = {
  verticalAlign: 'middle' as const,
  width: '60%',
}

const stubRight = {
  verticalAlign: 'middle' as const,
  width: '40%',
  textAlign: 'right' as const,
}

const stubSiteName = {
  fontSize: '11px',
  color: '#8a7a55',
  margin: '0 0 2px',
  fontFamily: "'Playfair Display', Georgia, serif",
  fontStyle: 'italic' as const,
  textTransform: 'uppercase' as const,
  letterSpacing: '1px',
}

const stubHint = {
  fontSize: '10px',
  color: '#a09070',
  margin: '0',
  fontFamily: "'Playfair Display', Georgia, serif",
}

const stubNoLabel = {
  fontSize: '10px',
  color: '#8a7a55',
  margin: '0 0 2px',
  textAlign: 'right' as const,
  fontFamily: "'Playfair Display', Georgia, serif",
  textTransform: 'uppercase' as const,
  letterSpacing: '1px',
}

const stubCode = {
  fontSize: '18px',
  fontWeight: '700' as const,
  color: '#2a1a08',
  margin: '0',
  textAlign: 'right' as const,
  fontFamily: "'Special Elite', 'Courier New', monospace",
  letterSpacing: '3px',
}

const hintText = {
  textAlign: 'center' as const,
  color: '#8a7a55',
  fontSize: '12px',
  margin: '16px 0 4px',
  fontFamily: "'Playfair Display', Georgia, serif",
}

const footerText = {
  textAlign: 'center' as const,
  color: '#a09878',
  fontSize: '11px',
  margin: '4px 0 0',
  fontFamily: "'Playfair Display', Georgia, serif",
}
