import { useState, useEffect } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths, isToday, isBefore, startOfDay } from "date-fns";
import { ru } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Calendar, Users, Clock, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import SeatSelectionDialog from "./SeatSelectionDialog";

interface Event {
  id: string;
  title: string;
  event_date: string;
  total_seats: number;
  price_per_seat: number;
  description: string | null;
  estafeta_url: string | null;
  booked_seats: number;
  available_seats: number;
}

const INITIAL_VISIBLE_COUNT = 3;

const EventCalendarSection = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [seatDialogOpen, setSeatDialogOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);

  // Defer fetch until section is near viewport to shorten critical request chain
  useEffect(() => {
    const section = document.getElementById('events');
    if (!section) {
      fetchEvents();
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          observer.disconnect();
          fetchEvents();
        }
      },
      { rootMargin: '400px' }
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('get-events');
      
      if (error) {
        console.error('Error fetching events:', error);
        return;
      }

      if (data?.success && data?.events) {
        setEvents(data.events);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get day of week for first day (0 = Sunday, adjust for Monday start)
  const startDayOfWeek = monthStart.getDay();
  const adjustedStartDay = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

  const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  const getEventForDay = (date: Date): Event | undefined => {
    return events.find(event => {
      const eventDate = new Date(event.event_date);
      return isSameDay(eventDate, date);
    });
  };

  const CYBERDOME_URL = "https://cyberlevel.moscow/feed/26-05-legacy-strategy?utm_source=partner&utm_medium=partner&utm_campaign=chernenko";
  const TELEGRAM_DIRECT_URL = "https://t.me/corphacker?direct";
  const VIP_COLOR = "hsl(8 72% 52%)";
  const GOLD_COLOR = "hsl(38 70% 50%)";

  const isCyberdome = (event: Event | null | undefined) =>
    !!event?.description && /кибер(дом|этаж)/i.test(event.description);

  const isVip = (event: Event | null | undefined) =>
    !!event && (/vip|вип/i.test(event.title) || /vip|вип/i.test(event.description || ''));

  const handleEventBook = (event: Event) => {
    if (isCyberdome(event)) {
      window.open(CYBERDOME_URL, '_blank', 'noopener,noreferrer');
      return;
    }
    setSelectedEvent(event);
    setSeatDialogOpen(true);
  };

  const handleDayClick = (date: Date) => {
    const event = getEventForDay(date);
    if (event && event.available_seats > 0) {
      handleEventBook(event);
    }
  };

  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  // Find next upcoming event
  const nextEvent = events.find(event => {
    const eventDate = new Date(event.event_date);
    return eventDate >= startOfDay(new Date());
  });

  return (
    <section id="calendar" className="py-20 md:py-32" style={{ backgroundColor: 'hsl(215 30% 20%)' }}>
      <div className="container mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="font-display text-4xl md:text-6xl lg:text-7xl tracking-[0.2em] uppercase mb-6" style={{ color: 'hsl(38 70% 50%)' }}>
            Расписание
          </h2>
          <div className="w-24 h-px mx-auto" style={{ background: 'linear-gradient(90deg, transparent, hsl(38 70% 50%), transparent)' }} />
        </div>

        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Calendar */}
          <div className="rounded-lg p-6 md:p-8" style={{ backgroundColor: 'hsl(215 30% 15%)' }}>
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={handlePrevMonth}
                className="p-2 rounded-full transition-colors hover:bg-white/10"
                style={{ color: 'hsl(35 25% 95%)' }}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h3 className="font-display text-xl md:text-2xl capitalize" style={{ color: 'hsl(35 25% 95%)' }}>
                {format(currentMonth, 'LLLL yyyy', { locale: ru })}
              </h3>
              <button
                onClick={handleNextMonth}
                className="p-2 rounded-full transition-colors hover:bg-white/10"
                style={{ color: 'hsl(35 25% 95%)' }}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Week Days */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {weekDays.map(day => (
                <div
                  key={day}
                  className="text-center text-xs font-medium py-2"
                  style={{ color: 'hsl(35 20% 65%)' }}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Empty cells for days before month start */}
              {Array.from({ length: adjustedStartDay }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}

              {days.map(day => {
                const event = getEventForDay(day);
                const hasEvent = !!event;
                const isPast = isBefore(day, startOfDay(new Date()));
                const isCurrentDay = isToday(day);
                const isSoldOut = hasEvent && event.available_seats === 0;

                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => handleDayClick(day)}
                    disabled={!hasEvent || isPast || isSoldOut}
                    className={`
                      aspect-square flex items-center justify-center rounded-lg text-sm font-medium
                      transition-all duration-200 relative
                      ${hasEvent && !isPast && !isSoldOut
                        ? 'cursor-pointer hover:scale-110'
                        : 'cursor-default'
                      }
                      ${isCurrentDay ? 'ring-2 ring-offset-2 ring-offset-transparent ring-[hsl(38_70%_50%)]' : ''}
                    `}
                    style={{
                      backgroundColor: hasEvent && !isPast
                        ? isSoldOut
                          ? 'hsl(0 0% 40%)'
                          : isVip(event)
                            ? VIP_COLOR
                            : GOLD_COLOR
                        : 'transparent',
                      color: hasEvent && !isPast
                        ? isVip(event) && !isSoldOut
                          ? 'hsl(35 25% 96%)'
                          : 'hsl(25 20% 10%)'
                        : isPast
                          ? 'hsl(35 20% 40%)'
                          : 'hsl(35 25% 85%)',
                    }}
                    title={hasEvent ? `${event.title} - ${event.available_seats} мест` : undefined}
                  >
                    {format(day, 'd')}
                    {hasEvent && !isPast && !isSoldOut && (
                      <span
                        className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                        style={{ backgroundColor: isVip(event) ? 'hsl(35 25% 96%)' : 'hsl(25 20% 10%)' }}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 mt-6 text-xs" style={{ color: 'hsl(35 20% 65%)' }}>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded" style={{ backgroundColor: GOLD_COLOR }} />
                <span>Есть места</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded" style={{ backgroundColor: VIP_COLOR }} />
                <span>VIP</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded" style={{ backgroundColor: 'hsl(0 0% 40%)' }} />
                <span>Мест нет</span>
              </div>
            </div>
          </div>

          {/* Event Details */}
          <div className="flex flex-col">
            {loading ? (
              <div className="text-center" style={{ color: 'hsl(35 20% 65%)' }}>
                <div className="animate-pulse">Загрузка...</div>
              </div>
            ) : events.length > 0 ? (
              <div className="space-y-4">
                {(showAll ? events : events.slice(0, INITIAL_VISIBLE_COUNT)).map((event) => {
                  const vip = isVip(event);
                  const accent = vip ? VIP_COLOR : GOLD_COLOR;
                  // Render description: replace literal "Telegram" word with a link for VIP rows
                  const renderDescription = (text: string) => {
                    if (!vip) return text;
                    const parts = text.split(/(Telegram)/i);
                    return parts.map((part, idx) =>
                      /^telegram$/i.test(part) ? (
                        <a
                          key={idx}
                          href={TELEGRAM_DIRECT_URL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline underline-offset-2 font-medium hover:opacity-80 transition-opacity"
                          style={{ color: VIP_COLOR }}
                        >
                          {part}
                        </a>
                      ) : (
                        <span key={idx}>{part}</span>
                      )
                    );
                  };
                  return (
                    <div
                      key={event.id}
                      className="p-4 rounded-lg relative"
                      style={{
                        backgroundColor: 'hsl(215 30% 15%)',
                        border: `1px solid ${vip ? accent : 'hsl(35 20% 25%)'}`,
                        boxShadow: vip ? `0 0 0 1px ${accent} inset, 0 6px 24px -12px ${accent}` : undefined,
                        opacity: event.available_seats === 0 ? 0.6 : 1,
                      }}
                    >
                      {vip && (
                        <span
                          className="absolute -top-2 right-3 px-2 py-0.5 rounded-full text-[10px] font-display tracking-[0.2em] uppercase"
                          style={{ backgroundColor: accent, color: 'hsl(35 25% 96%)' }}
                        >
                          VIP
                        </span>
                      )}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2" style={{ color: 'hsl(35 20% 75%)' }}>
                          <Calendar className="w-4 h-4 shrink-0" style={{ color: accent }} />
                          <span className="font-display text-base">
                            {format(new Date(event.event_date), 'd MMMM yyyy', { locale: ru })}
                          </span>
                          <span className="font-display text-base ml-1">
                            {format(new Date(event.event_date), 'HH:mm')}
                          </span>
                        </div>
                        {event.description && event.description !== 'Мест нет' && (
                          <div className="flex items-start gap-2" style={{ color: 'hsl(35 20% 75%)' }}>
                            <MapPin className="w-4 h-4 shrink-0 mt-0.5" style={{ color: accent }} />
                            <span className="font-body text-sm">{renderDescription(event.description)}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2" style={{ color: 'hsl(35 20% 75%)' }}>
                          <Users className="w-4 h-4 shrink-0" style={{ color: accent }} />
                          <span className="font-body text-sm">
                            {event.available_seats > 0
                              ? `${event.available_seats} из ${event.total_seats} мест`
                              : 'Все места заняты'}
                          </span>
                        </div>
                      </div>
                      {event.available_seats > 0 && (
                        <button
                          onClick={() => handleEventBook(event)}
                          className="w-full text-xs py-2.5 px-4 mt-3 rounded-full font-display tracking-[0.15em] uppercase transition-all hover:opacity-90"
                          style={
                            vip
                              ? { backgroundColor: accent, color: 'hsl(35 25% 96%)' }
                              : undefined
                          }
                        >
                          {vip ? (
                            `Забронировать VIP — ${event.price_per_seat.toLocaleString('ru-RU')} ₽`
                          ) : (
                            <span className="btn-primary-heritage w-full block">{`Забронировать — ${event.price_per_seat} ₽`}</span>
                          )}
                        </button>
                      )}
                    </div>
                  );
                })}
                {events.length > INITIAL_VISIBLE_COUNT && !showAll && (
                  <button
                    onClick={() => setShowAll(true)}
                    className="w-full py-2.5 rounded-lg text-sm font-medium transition-colors"
                    style={{
                      color: 'hsl(38 70% 50%)',
                      border: '1px solid hsl(35 20% 30%)',
                      backgroundColor: 'transparent',
                    }}
                  >
                    Ещё {events.length - INITIAL_VISIBLE_COUNT} мероприятий
                  </button>
                )}
              </div>
            ) : (
              <div className="text-center" style={{ color: 'hsl(35 20% 65%)' }}>
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="font-display text-xl">Мероприятия скоро появятся</p>
              </div>
            )}
          </div>
        </div>

        {/* Disclaimer note */}
        <div className="max-w-5xl mx-auto mt-8 md:mt-12">
          <div 
            className="p-5 rounded-lg text-center"
            style={{ backgroundColor: 'hsl(215 30% 15%)', border: '1px solid hsl(35 20% 30%)' }}
          >
            <p className="text-xs md:text-sm leading-relaxed" style={{ color: 'hsl(35 20% 70%)' }}>
              На сайте не осуществляется сбор и хранение персональных данных. Участие в мероприятии подтверждается пожертвованием, после которого вы получаете билет.
            </p>
            <p className="text-xs md:text-sm leading-relaxed mt-3" style={{ color: 'hsl(35 20% 70%)' }}>
              Вся важная информация — возможные изменения времени, организационные обновления и уведомления — публикуется в моём{' '}
              <a 
                href="https://t.me/corphacker" 
                target="_blank" 
                rel="noopener noreferrer"
                className="font-medium underline underline-offset-2 transition-colors hover:text-[hsl(38_70%_50%)]"
                style={{ color: 'hsl(38 70% 50%)' }}
              >
                Telegram-канале
              </a>.
            </p>
            <p className="text-xs md:text-sm leading-relaxed mt-3" style={{ color: 'hsl(35 20% 70%)' }}>
              Рекомендую подписаться, чтобы не пропустить важные сообщения. В канале также можно написать мне личное сообщение, если у вас возникнут вопросы.
            </p>
            <Link 
              to="/rules" 
              className="inline-block text-xs md:text-sm mt-4 underline underline-offset-2 transition-colors hover:text-[hsl(38_70%_50%)]"
              style={{ color: 'hsl(38 70% 50%)' }}
            >
              Правила участия
            </Link>
          </div>
        </div>
      </div>

      {/* Seat Selection Dialog */}
      {selectedEvent && (
        <SeatSelectionDialog
          open={seatDialogOpen}
          onOpenChange={setSeatDialogOpen}
          event={selectedEvent}
          onBookingComplete={() => {
            fetchEvents();
            setSeatDialogOpen(false);
          }}
        />
      )}
    </section>
  );
};

export default EventCalendarSection;
