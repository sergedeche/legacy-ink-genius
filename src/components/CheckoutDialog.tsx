import { useState } from "react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { User, Mail, AlertCircle, ExternalLink } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import PaymentVerificationDialog from "./PaymentVerificationDialog";

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

interface CheckoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: Event;
  seatsCount: number;
  totalAmount: number;
  onBookingComplete: () => void;
}

const CheckoutDialog = ({ 
  open, 
  onOpenChange, 
  event, 
  seatsCount, 
  totalAmount,
  onBookingComplete 
}: CheckoutDialogProps) => {
  const [guestName, setGuestName] = useState("");
  const [guestEmail] = useState(""); // Email collected after payment now
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [verificationOpen, setVerificationOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Validate inputs
      if (!guestName.trim() || guestName.trim().length < 2) {
        throw new Error("Пожалуйста, введите ваше имя");
      }

      if (!guestEmail.trim() || !guestEmail.includes("@")) {
        throw new Error("Пожалуйста, введите корректный email");
      }

      // Create booking
      const { data, error: bookingError } = await supabase.functions.invoke('create-booking', {
        body: {
          event_id: event.id,
          guest_name: guestName.trim(),
          guest_email: guestEmail.trim(),
          seats_count: seatsCount,
        }
      });

      if (bookingError) {
        throw new Error(bookingError.message || "Ошибка при создании бронирования");
      }

      if (!data?.success) {
        throw new Error(data?.error || "Не удалось создать бронирование");
      }

      console.log('Booking created:', data);
      setBookingId(data.booking.id);

      // Open payment page in new tab
      const estafetaUrl =
        event.estafeta_url ||
        "https://estafeta.ru/events/master-klass/ekskurs-strategiya-naslediya-343403/";
      window.open(estafetaUrl, '_blank');

      // Show verification dialog
      setVerificationOpen(true);

    } catch (err) {
      console.error('Error creating booking:', err);
      setError(err instanceof Error ? err.message : "Произошла ошибка");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setGuestName("");
      setGuestEmail("");
      setError(null);
      onOpenChange(false);
    }
  };

  return (
    <>
      <Dialog open={open && !verificationOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md" style={{ backgroundColor: 'hsl(215 30% 15%)', borderColor: 'hsl(215 30% 25%)' }}>
          <DialogHeader>
            <DialogTitle className="font-display text-2xl" style={{ color: 'hsl(35 25% 95%)' }}>
              Оформление
            </DialogTitle>
            <DialogDescription style={{ color: 'hsl(35 20% 65%)' }}>
              {event.title} • {format(new Date(event.event_date), 'd MMMM, HH:mm', { locale: ru })}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="py-4 space-y-6">
            {/* Name Input */}
            <div className="space-y-2">
              <label 
                htmlFor="name" 
                className="text-sm font-medium flex items-center gap-2"
                style={{ color: 'hsl(35 20% 75%)' }}
              >
                <User className="w-4 h-4" />
                Ваше имя
              </label>
              <Input
                id="name"
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="Как вас зовут?"
                required
                className="h-12"
                style={{ 
                  backgroundColor: 'hsl(215 30% 12%)', 
                  borderColor: 'hsl(215 30% 25%)',
                  color: 'hsl(35 25% 95%)'
                }}
              />
              <p className="text-xs" style={{ color: 'hsl(38 70% 50%)' }}>
                ⚠️ Важно: при пожертвовании укажите имя в формате "<strong>{guestName.trim().split(/\s+/)[0] || 'Имя'} {guestName.trim().split(/\s+/)[1]?.charAt(0).toUpperCase() || 'Ф'}.</strong>" (Имя + первая буква фамилии)
              </p>
            </div>

            {/* Email Input */}
            <div className="space-y-2">
              <label 
                htmlFor="email" 
                className="text-sm font-medium flex items-center gap-2"
                style={{ color: 'hsl(35 20% 75%)' }}
              >
                <Mail className="w-4 h-4" />
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="h-12"
                style={{ 
                  backgroundColor: 'hsl(215 30% 12%)', 
                  borderColor: 'hsl(215 30% 25%)',
                  color: 'hsl(35 25% 95%)'
                }}
              />
              <p className="text-xs" style={{ color: 'hsl(35 20% 65%)' }}>
                На этот адрес будет отправлен билет
              </p>
            </div>

            {/* Summary */}
            <div 
              className="p-4 rounded-lg"
              style={{ backgroundColor: 'hsl(215 30% 12%)' }}
            >
              <div className="flex justify-between items-center mb-2">
                <span style={{ color: 'hsl(35 20% 65%)' }}>
                  {seatsCount} {seatsCount === 1 ? 'место' : seatsCount < 5 ? 'места' : 'мест'}
                </span>
                <span style={{ color: 'hsl(35 25% 95%)' }}>
                  {seatsCount} × {event.price_per_seat} ₽
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t" style={{ borderColor: 'hsl(215 30% 25%)' }}>
                <span className="font-medium" style={{ color: 'hsl(35 25% 95%)' }}>Итого</span>
                <span className="text-xl font-display" style={{ color: 'hsl(38 70% 50%)' }}>
                  {totalAmount} ₽
                </span>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div 
                className="p-3 rounded-lg flex items-center gap-2 text-sm"
                style={{ backgroundColor: 'hsla(0, 70%, 50%, 0.15)', color: 'hsl(0 70% 60%)' }}
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Instructions */}
            <div 
              className="p-4 rounded-lg text-sm space-y-2"
              style={{ backgroundColor: 'hsla(38, 70%, 50%, 0.1)', color: 'hsl(35 20% 75%)' }}
            >
              <p className="font-medium" style={{ color: 'hsl(38 70% 50%)' }}>Как это работает:</p>
              <ol className="list-decimal list-inside space-y-1 text-xs">
                <li>Нажмите "Оплатить" — откроется страница Эстафеты Чудес</li>
                <li>Сделайте пожертвование на сумму {totalAmount} ₽</li>
                <li>Укажите имя: <strong>{guestName.trim().split(/\s+/)[0] || 'Имя'} {guestName.trim().split(/\s+/)[1]?.charAt(0).toUpperCase() || 'Ф'}.</strong> (Имя + первая буква фамилии)</li>
                <li>Вернитесь сюда — система автоматически подтвердит оплату</li>
              </ol>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 text-lg font-display tracking-wider flex items-center justify-center gap-2"
              style={{ 
                background: 'linear-gradient(135deg, hsl(38 70% 50%), hsl(35 60% 35%))',
                color: 'hsl(35 25% 95%)'
              }}
            >
              {loading ? (
                <span className="animate-pulse">Создаём бронь...</span>
              ) : (
                <>
                  Оплатить через Эстафету Чудес
                  <ExternalLink className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {bookingId && (
        <PaymentVerificationDialog
          key={bookingId}
          open={verificationOpen}
          onOpenChange={setVerificationOpen}
          bookingId={bookingId}
          guestName={guestName}
          totalAmount={totalAmount}
          eventTitle={event.title}
          eventDate={event.event_date}
          estafetaUrl={
            event.estafeta_url ||
            "https://estafeta.ru/events/master-klass/ekskurs-strategiya-naslediya-343403/"
          }
          seatsCount={seatsCount}
          onVerified={() => {
            onBookingComplete();
            setVerificationOpen(false);
            setBookingId(null);
          }}
          onCancel={() => {
            setVerificationOpen(false);
            setBookingId(null);
          }}
        />
      )}
    </>
  );
};

export default CheckoutDialog;
