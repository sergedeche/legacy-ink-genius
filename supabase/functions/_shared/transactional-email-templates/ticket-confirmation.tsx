import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Html, Preview, Text, Section, Row, Column,
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
  ticket_code = 'XXXXXX',
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

  // Pad ticket code for display
  const displayCode = ticket_code.toUpperCase()

  return (
    <Html lang="ru" dir="ltr">
      <Head>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Special+Elite&family=Cormorant+Garamond:wght@400;600;700&display=swap');
        `}</style>
      </Head>
      <Preview>🎫 Ваш билет на {event_title}</Preview>
      <Body style={main}>
        <Container style={outerContainer}>
          {/* Ticket wrapper */}
          <Section style={ticketWrapper}>
            <Row>
              {/* Main ticket area */}
              <Column style={mainTicket}>
                {/* Ornamental top border */}
                <Text style={ornamentTop}>═══════════════════════════════</Text>

                {/* БИЛЕТ header */}
                <Text style={ticketHeader}>БИЛЕТ</Text>

                <Text style={ornamentLine}>─────────────────</Text>

                {/* Event title */}
                <Text style={eventSubtitle}>Экскурс</Text>
                <Text style={eventTitle}>«{event_title}»</Text>

                <Text style={ornamentLine}>─────────────────</Text>

                {/* Tagline */}
                <Text style={tagline}>
                  Возможность прикоснуться к прошлому,{'\n'}чтобы повлиять на будущее.
                </Text>

                {/* Guest name - typewriter style */}
                <Text style={fieldLabel}>
                  Гость: <span style={fieldValue}>{guest_name}</span>
                </Text>

                {/* Date & Time - typewriter style */}
                {formattedDate && (
                  <Text style={fieldLabel}>
                    Дата: <span style={fieldValue}>{formattedDate}</span>
                  </Text>
                )}

                {formattedTime && (
                  <Text style={fieldLabel}>
                    Время: <span style={fieldValue}>{formattedTime}</span>
                  </Text>
                )}

                {/* Venue */}
                {venue && (
                  <Text style={fieldLabel}>
                    Место: <span style={fieldValue}>{venue}</span>
                  </Text>
                )}

                {/* Seats */}
                <Text style={fieldLabel}>
                  Мест: <span style={fieldValue}>{seatsText}</span>
                </Text>

                {/* Bottom ornament */}
                <Text style={ornamentBottom}>═══════════════════════════════</Text>
              </Column>

              {/* Dashed separator / tear line */}
              <Column style={tearLine}>
                <Text style={tearDashes}>┆</Text>
              </Column>

              {/* Right stub with ticket number */}
              <Column style={stubColumn}>
                <Section style={stubInner}>
                  <Text style={stubOrnamentTop}>═══</Text>
                  <Text style={stubLabel}>№</Text>
                  {/* Vertical ticket code - each char on its own line */}
                  {displayCode.split('').map((char, i) => (
                    <Text key={i} style={stubCodeChar}>{char}</Text>
                  ))}
                  <Text style={stubOrnamentBottom}>═══</Text>
                </Section>
              </Column>
            </Row>
          </Section>

          {/* Hint below ticket */}
          <Text style={hintText}>💡 Сохраните это письмо — покажите билет при входе</Text>
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
    ticket_code: 'ABC123',
    event_title: 'Стратегия наследия',
    event_date: '2026-05-15T19:00:00',
    seats_count: 2,
    venue: 'Москва, ул. Тверская, 1',
  },
} satisfies TemplateEntry

/* ─── Styles ─── */

const main = {
  backgroundColor: '#ffffff',
  fontFamily: "'Cormorant Garamond', 'Georgia', 'Times New Roman', serif",
}

const outerContainer = {
  maxWidth: '520px',
  margin: '20px auto',
  padding: '0',
}

const ticketWrapper = {
  backgroundColor: '#f0e6d3',
  backgroundImage: 'linear-gradient(135deg, #e8dcc8 0%, #f0e6d3 30%, #ede2ce 60%, #e5d9c3 100%)',
  borderRadius: '8px',
  border: '2px solid #c4a97d',
  boxShadow: '0 4px 20px rgba(139, 98, 36, 0.15), inset 0 0 40px rgba(196, 169, 125, 0.2)',
  padding: '0',
  overflow: 'hidden' as const,
}

const mainTicket = {
  width: '78%',
  padding: '28px 24px 20px 28px',
  verticalAlign: 'top' as const,
}

const tearLine = {
  width: '2%',
  verticalAlign: 'top' as const,
  paddingTop: '12px',
  paddingBottom: '12px',
}

const tearDashes = {
  color: '#b8a080',
  fontSize: '14px',
  lineHeight: '8px',
  letterSpacing: '0',
  margin: '0',
  padding: '0',
  whiteSpace: 'pre-wrap' as const,
  textAlign: 'center' as const,
}

const stubColumn = {
  width: '20%',
  backgroundColor: 'rgba(196, 169, 125, 0.15)',
  verticalAlign: 'top' as const,
  borderLeft: '1px dashed #b8a080',
}

const stubInner = {
  padding: '20px 8px',
  textAlign: 'center' as const,
}

const stubOrnamentTop = {
  color: '#8b6224',
  fontSize: '10px',
  margin: '0 0 12px',
  letterSpacing: '2px',
  textAlign: 'center' as const,
}

const stubOrnamentBottom = {
  color: '#8b6224',
  fontSize: '10px',
  margin: '12px 0 0',
  letterSpacing: '2px',
  textAlign: 'center' as const,
}

const stubLabel = {
  color: '#5a4a2e',
  fontSize: '14px',
  fontWeight: '700' as const,
  margin: '0 0 6px',
  textAlign: 'center' as const,
  fontFamily: "'Cormorant Garamond', Georgia, serif",
}

const stubCodeChar = {
  color: '#3a2a10',
  fontSize: '20px',
  fontWeight: '700' as const,
  fontFamily: "'Special Elite', 'Courier New', monospace",
  margin: '0',
  padding: '1px 0',
  lineHeight: '1.3',
  textAlign: 'center' as const,
  letterSpacing: '2px',
}

const ornamentTop = {
  color: '#8b6224',
  fontSize: '10px',
  textAlign: 'center' as const,
  margin: '0 0 8px',
  letterSpacing: '1px',
  opacity: '0.7',
}

const ornamentLine = {
  color: '#c4a97d',
  fontSize: '10px',
  textAlign: 'center' as const,
  margin: '4px 0',
  letterSpacing: '2px',
  opacity: '0.6',
}

const ornamentBottom = {
  color: '#8b6224',
  fontSize: '10px',
  textAlign: 'center' as const,
  margin: '12px 0 0',
  letterSpacing: '1px',
  opacity: '0.7',
}

const ticketHeader = {
  fontSize: '28px',
  fontWeight: '700' as const,
  color: '#2a1a08',
  textAlign: 'center' as const,
  margin: '0 0 2px',
  letterSpacing: '6px',
  textTransform: 'uppercase' as const,
  fontFamily: "'Cormorant Garamond', Georgia, serif",
}

const eventSubtitle = {
  fontSize: '16px',
  color: '#5a4a2e',
  textAlign: 'center' as const,
  margin: '8px 0 2px',
  fontStyle: 'italic' as const,
}

const eventTitle = {
  fontSize: '22px',
  fontWeight: '700' as const,
  color: '#2a1a08',
  textAlign: 'center' as const,
  margin: '0 0 4px',
  fontFamily: "'Cormorant Garamond', Georgia, serif",
}

const tagline = {
  fontSize: '13px',
  color: '#6a5a3e',
  textAlign: 'center' as const,
  margin: '8px 0 16px',
  lineHeight: '1.5',
  fontStyle: 'italic' as const,
}

const fieldLabel = {
  fontSize: '14px',
  color: '#5a4a2e',
  margin: '6px 0',
  fontFamily: "'Cormorant Garamond', Georgia, serif",
  fontWeight: '600' as const,
}

const fieldValue: React.CSSProperties = {
  fontFamily: "'Special Elite', 'Courier New', monospace",
  color: '#1a1008',
  fontWeight: 'normal',
  fontSize: '14px',
}

const hintText = {
  textAlign: 'center' as const,
  color: '#7a6a4e',
  fontSize: '12px',
  margin: '16px 0 4px',
  fontFamily: "'Cormorant Garamond', Georgia, serif",
}

const footerText = {
  textAlign: 'center' as const,
  color: '#9a8a6e',
  fontSize: '11px',
  margin: '4px 0 0',
  fontFamily: "'Cormorant Garamond', Georgia, serif",
}
