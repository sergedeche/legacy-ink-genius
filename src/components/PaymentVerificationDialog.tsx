import { useState, useEffect, useCallback } from "react";
import { Clock, CheckCircle2, AlertCircle, ExternalLink, RefreshCw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import TicketDialog from "./TicketDialog";
import TelegramDialog from "./TelegramDialog";

interface PaymentVerificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingId: string;
  guestName: string;
  totalAmount: number;
  eventTitle: string;
  eventDate: string;
  estafetaUrl: string;
  onVerified: () => void;
  onCancel: () => void;
}

interface TicketData {
  id: string;
  ticket_code: string;
  created_at: string;
}

const PaymentVerificationDialog = ({
  open,
  onOpenChange,
  bookingId,
  guestName,
  totalAmount,
  eventTitle,
  eventDate,
  estafetaUrl,
  onVerified,
  onCancel,
}: PaymentVerificationDialogProps) => {
  const [checking, setChecking] = useState(false);
  const [verified, setVerified] = useState(false);
  const [ticket, setTicket] = useState<TicketData | null>(null);
  const [minutesLeft, setMinutesLeft] = useState(15);
  const [error, setError] = useState<string | null>(null);
  const [ticketDialogOpen, setTicketDialogOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);

  const checkPayment = useCallback(async () => {
    if (checking || verified) return;
    
    setChecking(true);
    setError(null);

    try {
      const { data, error: verifyError } = await supabase.functions.invoke('verify-payment', {
        body: { booking_id: bookingId }
      });

      if (verifyError) {
        throw new Error(verifyError.message || "Ошибка проверки");
      }

      console.log('Verification result:', data);

      if (data?.verified) {
        setVerified(true);
        setTicket(data.ticket);
        setTicketDialogOpen(true);
      } else if (data?.minutes_left !== undefined) {
        setMinutesLeft(data.minutes_left);
        if (data.minutes_left <= 0) {
          setError("Время бронирования истекло. Пожалуйста, создайте новое бронирование.");
        }
      } else if (data?.error) {
        setError(data.error);
      }
    } catch (err) {
      console.error('Error checking payment:', err);
      setError(err instanceof Error ? err.message : "Ошибка проверки оплаты");
    } finally {
      setChecking(false);
    }
  }, [bookingId, checking, verified]);

  // Auto-check every 30 seconds
  useEffect(() => {
    if (!open || verified) return;

    // Initial check after 10 seconds
    const initialTimeout = setTimeout(() => {
      checkPayment();
    }, 10000);

    // Then check every 30 seconds
    const interval = setInterval(() => {
      checkPayment();
    }, 30000);

    // Update minutes left every minute
    const minuteInterval = setInterval(() => {
      setMinutesLeft(prev => Math.max(0, prev - 1));
    }, 60000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
      clearInterval(minuteInterval);
    };
  }, [open, verified, checkPayment]);

  const handleOpenEstafeta = () => {
    window.open(estafetaUrl, '_blank');
  };

  const handleClose = () => {
    if (!checking && !verified) {
      onCancel();
    }
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open && !ticketDialogOpen} onOpenChange={handleClose}>
        <DialogContent 
          className="sm:max-w-md"
          style={{ backgroundColor: 'hsl(215 30% 15%)', borderColor: 'hsl(215 30% 25%)' }}
        >
          <DialogHeader>
            <DialogTitle className="font-display text-2xl" style={{ color: 'hsl(35 25% 95%)' }}>
              {verified ? "Оплата подтверждена!" : "Ожидаем оплату"}
            </DialogTitle>
            <DialogDescription style={{ color: 'hsl(35 20% 65%)' }}>
              {eventTitle}
            </DialogDescription>
          </DialogHeader>

          <div className="py-6 space-y-6">
            {!verified ? (
              <>
                {/* Timer */}
                <div 
                  className="p-4 rounded-lg flex items-center justify-between"
                  style={{ backgroundColor: 'hsl(215 30% 12%)' }}
                >
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5" style={{ color: minutesLeft <= 5 ? 'hsl(0 70% 60%)' : 'hsl(38 70% 50%)' }} />
                    <span style={{ color: 'hsl(35 20% 75%)' }}>Бронь действует:</span>
                  </div>
                  <span 
                    className="text-xl font-display"
                    style={{ color: minutesLeft <= 5 ? 'hsl(0 70% 60%)' : 'hsl(38 70% 50%)' }}
                  >
                    {minutesLeft} мин
                  </span>
                </div>

                {/* Status */}
                <div className="text-center space-y-3">
                  {checking ? (
                    <div className="flex items-center justify-center gap-2" style={{ color: 'hsl(35 20% 75%)' }}>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>Проверяем оплату...</span>
                    </div>
                  ) : (
                    <p style={{ color: 'hsl(35 20% 65%)' }}>
                      Система автоматически проверяет оплату каждые 30 секунд
                    </p>
                  )}
                </div>

                {/* Instructions reminder */}
                <div 
                  className="p-4 rounded-lg space-y-2 text-sm"
                  style={{ backgroundColor: 'hsla(38, 70%, 50%, 0.1)' }}
                >
                  <p className="font-medium" style={{ color: 'hsl(38 70% 50%)' }}>Напоминание:</p>
                  <ul className="list-disc list-inside space-y-1" style={{ color: 'hsl(35 20% 75%)' }}>
                    <li>Сумма пожертвования: <strong>{totalAmount} ₽</strong></li>
                    <li>Имя донатора: <strong>{guestName}</strong></li>
                    <li>Комментарий: <strong>СН</strong></li>
                  </ul>
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

                {/* Actions */}
                <div className="space-y-3">
                  <Button
                    onClick={handleOpenEstafeta}
                    variant="outline"
                    className="w-full h-12 flex items-center justify-center gap-2"
                    style={{ 
                      borderColor: 'hsl(38 70% 50%)', 
                      color: 'hsl(38 70% 50%)',
                      backgroundColor: 'transparent'
                    }}
                  >
                    Открыть Эстафету Чудес
                    <ExternalLink className="w-4 h-4" />
                  </Button>

                  <Button
                    onClick={checkPayment}
                    disabled={checking}
                    className="w-full h-12 text-lg font-display tracking-wider flex items-center justify-center gap-2"
                    style={{ 
                      background: 'linear-gradient(135deg, hsl(38 70% 50%), hsl(35 60% 35%))',
                      color: 'hsl(35 25% 95%)'
                    }}
                  >
                    {checking ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Проверяем...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4" />
                        Я оплатил, проверить
                      </>
                    )}
                  </Button>

                  {(!!error || minutesLeft <= 0) && (
                    <Button
                      onClick={() => setSupportOpen(true)}
                      variant="outline"
                      className="w-full h-12"
                      style={{
                        borderColor: 'hsl(215 30% 25%)',
                        color: 'hsl(35 20% 75%)',
                        backgroundColor: 'transparent',
                      }}
                    >
                      Написать в поддержку
                    </Button>
                  )}

                  <Button
                    onClick={handleClose}
                    variant="ghost"
                    className="w-full"
                    style={{ color: 'hsl(35 20% 65%)' }}
                  >
                    Отмена
                  </Button>
                </div>
              </>
            ) : (
              /* Success state */
              <div className="text-center space-y-4">
                <CheckCircle2 
                  className="w-16 h-16 mx-auto" 
                  style={{ color: 'hsl(120 50% 50%)' }} 
                />
                <p className="text-lg" style={{ color: 'hsl(35 25% 95%)' }}>
                  Ваш билет готов!
                </p>
                <Button
                  onClick={() => setTicketDialogOpen(true)}
                  className="w-full h-12 text-lg font-display tracking-wider"
                  style={{ 
                    background: 'linear-gradient(135deg, hsl(38 70% 50%), hsl(35 60% 35%))',
                    color: 'hsl(35 25% 95%)'
                  }}
                >
                  Показать билет
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {ticket && (
        <TicketDialog
          open={ticketDialogOpen}
          onOpenChange={(open) => {
            setTicketDialogOpen(open);
            if (!open) {
              onVerified();
            }
          }}
          ticketCode={ticket.ticket_code}
          guestName={guestName}
          eventTitle={eventTitle}
          eventDate={eventDate}
          seatsCount={Math.round(totalAmount / 100)}
        />
      )}

      <TelegramDialog open={supportOpen} onOpenChange={setSupportOpen} />
    </>
  );
};

export default PaymentVerificationDialog;
