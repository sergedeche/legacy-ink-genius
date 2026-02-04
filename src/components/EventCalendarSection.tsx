import { useState, useEffect } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths, isToday, isBefore, startOfDay } from "date-fns";
import { ru } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Calendar, Users, Clock } from "lucide-react";
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

const EventCalendarSection = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [seatDialogOpen, setSeatDialogOpen] = useState(false);

  useEffect(() => {
    fetchEvents();
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

  const handleDayClick = (date: Date) => {
    const event = getEventForDay(date);
    if (event && event.available_seats > 0) {
      setSelectedEvent(event);
      setSeatDialogOpen(true);
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
                          : 'hsl(38 70% 50%)'
                        : 'transparent',
                      color: hasEvent && !isPast
                        ? 'hsl(25 20% 10%)'
                        : isPast
                          ? 'hsl(35 20% 40%)'
                          : 'hsl(35 25% 85%)',
                    }}
                    title={hasEvent ? `${event.title} - ${event.available_seats} мест` : undefined}
                  >
                    {format(day, 'd')}
                    {hasEvent && !isPast && (
                      <span
                        className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                        style={{ backgroundColor: isSoldOut ? 'hsl(0 0% 60%)' : 'hsl(25 20% 10%)' }}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 mt-6 text-xs" style={{ color: 'hsl(35 20% 65%)' }}>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded" style={{ backgroundColor: 'hsl(38 70% 50%)' }} />
                <span>Есть места</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded" style={{ backgroundColor: 'hsl(0 0% 40%)' }} />
                <span>Мест нет</span>
              </div>
            </div>
          </div>

          {/* Event Details */}
          <div className="flex flex-col justify-center">
            {loading ? (
              <div className="text-center" style={{ color: 'hsl(35 20% 65%)' }}>
                <div className="animate-pulse">Загрузка...</div>
              </div>
            ) : nextEvent ? (
              <div className="space-y-6">
                <p className="text-sm tracking-[0.2em] uppercase" style={{ color: 'hsl(38 70% 50%)' }}>
                  Ближайший экскурс
                </p>
                <h3 className="font-display text-2xl md:text-3xl lg:text-4xl" style={{ color: 'hsl(35 25% 95%)' }}>
                  {nextEvent.title}
                </h3>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3" style={{ color: 'hsl(35 20% 75%)' }}>
                    <Calendar className="w-5 h-5" style={{ color: 'hsl(38 70% 50%)' }} />
                    <span className="font-display text-lg">
                      {format(new Date(nextEvent.event_date), 'd MMMM yyyy', { locale: ru })}
                    </span>
                  </div>
                  <div className="flex items-center gap-3" style={{ color: 'hsl(35 20% 75%)' }}>
                    <Clock className="w-5 h-5" style={{ color: 'hsl(38 70% 50%)' }} />
                    <span className="font-display text-lg">
                      {format(new Date(nextEvent.event_date), 'HH:mm', { locale: ru })}
                    </span>
                  </div>
                  <div className="flex items-center gap-3" style={{ color: 'hsl(35 20% 75%)' }}>
                    <Users className="w-5 h-5" style={{ color: 'hsl(38 70% 50%)' }} />
                    <span className="font-display text-lg">
                      {nextEvent.available_seats} из {nextEvent.total_seats} мест свободно
                    </span>
                  </div>
                </div>

                <div className="pt-4">
                  <p className="text-2xl font-display mb-4" style={{ color: 'hsl(38 70% 50%)' }}>
                    {nextEvent.price_per_seat} ₽ <span className="text-base" style={{ color: 'hsl(35 20% 65%)' }}>/ место</span>
                  </p>
                  
                {nextEvent.available_seats > 0 ? (
                    <button
                      onClick={() => {
                        setSelectedEvent(nextEvent);
                        setSeatDialogOpen(true);
                      }}
                      className="btn-primary-heritage w-full md:w-auto text-sm md:text-base py-3 px-6 md:py-4 md:px-8"
                    >
                      Забронировать место
                    </button>
                  ) : (
                    <p className="text-lg font-display" style={{ color: 'hsl(0 0% 60%)' }}>
                      Все места заняты
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center" style={{ color: 'hsl(35 20% 65%)' }}>
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="font-display text-xl">Мероприятия скоро появятся</p>
              </div>
            )}
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
