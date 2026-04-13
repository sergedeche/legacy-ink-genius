import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Section, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "Стратегия наследия"

interface TicketConfirmationProps {
  guest_name?: string
  ticket_code?: string
  event_title?: string
  event_date?: string
  seats_count?: number
}

const TicketConfirmationEmail = ({
  guest_name = 'Гость',
  ticket_code = 'XXXXXX',
  event_title = 'Мероприятие',
  event_date = '',
  seats_count = 1,
}: TicketConfirmationProps) => {
  const seatsText = seats_count === 1 ? '1 место' : seats_count < 5 ? `${seats_count} места` : `${seats_count} мест`;

  let formattedDate = ''
  let formattedTime = ''
  if (event_date) {
    const d = new Date(event_date)
    formattedDate = d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
    formattedTime = d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <Html lang="ru" dir="ltr">
      <Head />
      <Preview>🎫 Ваш билет на {event_title}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={emoji}>🎫</Text>
            <Heading style={h1}>Билет подтверждён</Heading>
          </Section>

          <Section style={content}>
            <Text style={label}>Код билета</Text>
            <Section style={codeBox}>
              <Text style={codeText}>{ticket_code}</Text>
            </Section>
            <Text style={hint}>Покажите этот код при входе</Text>

            <Hr style={divider} />

            <Heading style={h2}>{event_title}</Heading>

            {formattedDate && (
              <Text style={detail}>📅 {formattedDate}  🕐 {formattedTime}</Text>
            )}
            <Text style={detail}>👤 {guest_name}  👥 {seatsText}</Text>

            <Section style={tipBox}>
              <Text style={tipText}>💡 Сохраните это письмо или сделайте скриншот билета</Text>
            </Section>
          </Section>

          <Text style={footer}>{SITE_NAME} — экскурс для тех, кто думает о будущем</Text>
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
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Montserrat', Arial, sans-serif" }
const container = { maxWidth: '400px', margin: '0 auto' }
const header = {
  background: 'linear-gradient(135deg, #c7923e, #8b6224)',
  borderRadius: '16px 16px 0 0',
  padding: '24px',
  textAlign: 'center' as const,
}
const emoji = { fontSize: '40px', margin: '0 0 12px' }
const h1 = { margin: '0', fontSize: '24px', fontWeight: '600', color: '#f5f3f0' }
const content = { backgroundColor: '#f5f3f0', padding: '24px', borderRadius: '0 0 16px 16px' }
const label = { margin: '0 0 8px', color: '#7a6f5d', fontSize: '12px', textTransform: 'uppercase' as const, letterSpacing: '1px', textAlign: 'center' as const }
const codeBox = { backgroundColor: '#1a2332', borderRadius: '8px', padding: '16px 20px', textAlign: 'center' as const }
const codeText = { color: '#c7923e', fontFamily: 'monospace', fontSize: '24px', letterSpacing: '4px', margin: '0' }
const hint = { margin: '8px 0 0', color: '#7a6f5d', fontSize: '12px', textAlign: 'center' as const }
const divider = { border: 'none', borderTop: '2px dashed #d4cfc4', margin: '20px 0' }
const h2 = { margin: '0 0 16px', color: '#2a2318', fontSize: '20px', textAlign: 'center' as const }
const detail = { fontSize: '14px', color: '#5a5145', textAlign: 'center' as const, margin: '4px 0' }
const tipBox = { backgroundColor: 'rgba(199, 146, 62, 0.1)', padding: '12px', borderRadius: '8px', textAlign: 'center' as const, marginTop: '20px' }
const tipText = { margin: '0', color: '#5a5145', fontSize: '12px' }
const footer = { textAlign: 'center' as const, color: '#7a6f5d', fontSize: '12px', marginTop: '20px' }
