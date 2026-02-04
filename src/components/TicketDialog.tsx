import { useState } from "react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Ticket, Calendar, User, Users, Mail, Wallet, Send, X, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface TicketDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticketCode: string;
  guestName: string;
  eventTitle: string;
  eventDate: string;
  seatsCount: number;
}

const TicketDialog = ({
  open,
  onOpenChange,
  ticketCode,
  guestName,
  eventTitle,
  eventDate,
  seatsCount,
}: TicketDialogProps) => {
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [email, setEmail] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);

  const handleSendToEmail = async () => {
    if (!email || !email.includes("@")) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, введите корректный email",
        variant: "destructive",
      });
      return;
    }

    setSendingEmail(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-ticket-email', {
        body: {
          email,
          ticket_code: ticketCode,
          guest_name: guestName,
          event_title: eventTitle,
          event_date: eventDate,
          seats_count: seatsCount,
        }
      });

      if (error) throw error;

      toast({
        title: "Билет отправлен!",
        description: `Копия билета отправлена на ${email}`,
      });
      setShowEmailInput(false);
      setEmail("");
    } catch (err) {
      console.error('Error sending ticket email:', err);
      toast({
        title: "Ошибка отправки",
        description: "Не удалось отправить билет. Попробуйте позже.",
        variant: "destructive",
      });
    } finally {
      setSendingEmail(false);
    }
  };

  const handleAddToWallet = (type: 'apple' | 'google') => {
    // For now, show a message that wallet integration is coming soon
    toast({
      title: "Скоро будет доступно",
      description: `Добавление в ${type === 'apple' ? 'Apple Wallet' : 'Google Wallet'} появится в ближайшее время`,
    });
  };

  const formattedDate = format(new Date(eventDate), 'd MMMM yyyy', { locale: ru });
  const formattedTime = format(new Date(eventDate), 'HH:mm', { locale: ru });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="sm:max-w-md p-0 overflow-hidden max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: 'hsl(35 25% 95%)', borderColor: 'hsl(38 70% 50%)' }}
      >
        {/* Ticket Header */}
        <div 
          className="p-4 sm:p-6 text-center"
          style={{ background: 'linear-gradient(135deg, hsl(38 70% 50%), hsl(35 60% 35%))' }}
        >
          <Ticket className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3" style={{ color: 'hsl(35 25% 95%)' }} />
          <DialogHeader>
            <DialogTitle className="font-display text-xl sm:text-2xl" style={{ color: 'hsl(35 25% 95%)' }}>
              Билет подтверждён
            </DialogTitle>
          </DialogHeader>
        </div>

        {/* Ticket Body */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Ticket Code */}
          <div className="text-center">
            <p className="text-xs sm:text-sm uppercase tracking-wider mb-2" style={{ color: 'hsl(35 20% 50%)' }}>
              Код билета
            </p>
            <div 
              className="font-mono text-xl sm:text-2xl md:text-3xl tracking-[0.15em] sm:tracking-[0.3em] py-3 sm:py-4 px-3 sm:px-6 rounded-lg inline-block break-all"
              style={{ 
                backgroundColor: 'hsl(215 30% 15%)', 
                color: 'hsl(38 70% 50%)',
                fontFamily: 'monospace'
              }}
            >
              {ticketCode}
            </div>
            <p className="text-xs mt-2" style={{ color: 'hsl(35 20% 50%)' }}>
              Покажите этот код при входе
            </p>
          </div>

          {/* Divider with cut-out effect */}
          <div className="relative py-2">
            <div 
              className="border-t-2 border-dashed"
              style={{ borderColor: 'hsl(35 25% 80%)' }}
            />
            <div 
              className="absolute -left-4 sm:-left-6 top-1/2 -translate-y-1/2 w-3 sm:w-4 h-6 sm:h-8 rounded-r-full"
              style={{ backgroundColor: 'hsl(var(--background))' }}
            />
            <div 
              className="absolute -right-4 sm:-right-6 top-1/2 -translate-y-1/2 w-3 sm:w-4 h-6 sm:h-8 rounded-l-full"
              style={{ backgroundColor: 'hsl(var(--background))' }}
            />
          </div>

          {/* Event Details */}
          <div className="space-y-3">
            <h3 className="font-display text-lg sm:text-xl text-center" style={{ color: 'hsl(25 20% 15%)' }}>
              {eventTitle}
            </h3>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="flex items-center gap-2" style={{ color: 'hsl(35 20% 40%)' }}>
                <Calendar className="w-4 h-4 flex-shrink-0" style={{ color: 'hsl(38 70% 50%)' }} />
                <span className="text-xs sm:text-sm">{formattedDate}</span>
              </div>
              <div className="flex items-center gap-2" style={{ color: 'hsl(35 20% 40%)' }}>
                <Calendar className="w-4 h-4 flex-shrink-0" style={{ color: 'hsl(38 70% 50%)' }} />
                <span className="text-xs sm:text-sm">{formattedTime}</span>
              </div>
              <div className="flex items-center gap-2" style={{ color: 'hsl(35 20% 40%)' }}>
                <User className="w-4 h-4 flex-shrink-0" style={{ color: 'hsl(38 70% 50%)' }} />
                <span className="text-xs sm:text-sm truncate">{guestName}</span>
              </div>
              <div className="flex items-center gap-2" style={{ color: 'hsl(35 20% 40%)' }}>
                <Users className="w-4 h-4 flex-shrink-0" style={{ color: 'hsl(38 70% 50%)' }} />
                <span className="text-xs sm:text-sm">
                  {seatsCount} {seatsCount === 1 ? 'место' : seatsCount < 5 ? 'места' : 'мест'}
                </span>
              </div>
            </div>
          </div>

          {/* Save Ticket Options */}
          <div className="space-y-2">
            <p className="text-xs text-center" style={{ color: 'hsl(35 20% 50%)' }}>
              Сохраните билет, чтобы не потерять
            </p>
            
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={() => handleAddToWallet('apple')}
                variant="outline"
                className="h-10 text-xs sm:text-sm flex items-center justify-center gap-1.5"
                style={{ 
                  borderColor: 'hsl(215 30% 25%)', 
                  color: 'hsl(25 20% 15%)',
                  backgroundColor: 'white'
                }}
              >
                <Wallet className="w-4 h-4" />
                Apple Wallet
              </Button>
              <Button
                onClick={() => handleAddToWallet('google')}
                variant="outline"
                className="h-10 text-xs sm:text-sm flex items-center justify-center gap-1.5"
                style={{ 
                  borderColor: 'hsl(215 30% 25%)', 
                  color: 'hsl(25 20% 15%)',
                  backgroundColor: 'white'
                }}
              >
                <Wallet className="w-4 h-4" />
                Google Wallet
              </Button>
            </div>

            {/* Email Send Option */}
            {!showEmailInput ? (
              <Button
                onClick={() => setShowEmailInput(true)}
                variant="outline"
                className="w-full h-10 text-xs sm:text-sm flex items-center justify-center gap-1.5"
                style={{ 
                  borderColor: 'hsl(38 70% 50%)', 
                  color: 'hsl(38 60% 35%)',
                  backgroundColor: 'white'
                }}
              >
                <Mail className="w-4 h-4" />
                Отправить на почту
              </Button>
            ) : (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="h-10 text-sm flex-1"
                    style={{ 
                      backgroundColor: 'white', 
                      borderColor: 'hsl(35 25% 80%)',
                      color: 'hsl(25 20% 15%)'
                    }}
                    disabled={sendingEmail}
                  />
                  <Button
                    onClick={handleSendToEmail}
                    disabled={sendingEmail}
                    className="h-10 px-3"
                    style={{ 
                      background: 'linear-gradient(135deg, hsl(38 70% 50%), hsl(35 60% 35%))',
                      color: 'hsl(35 25% 95%)'
                    }}
                  >
                    {sendingEmail ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    onClick={() => {
                      setShowEmailInput(false);
                      setEmail("");
                    }}
                    variant="ghost"
                    className="h-10 px-3"
                    style={{ color: 'hsl(35 20% 50%)' }}
                    disabled={sendingEmail}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Ticket retrieval hint */}
          <div 
            className="p-3 rounded-lg text-center"
            style={{ backgroundColor: 'hsla(38, 70%, 50%, 0.1)' }}
          >
            <p className="text-xs" style={{ color: 'hsl(35 20% 40%)' }}>
              💡 Запомните код билета или сделайте скриншот. 
              Если потеряете — напишите нам в Telegram и мы восстановим билет.
            </p>
          </div>

          {/* Close Button */}
          <Button
            onClick={() => onOpenChange(false)}
            className="w-full h-11 sm:h-12 text-base sm:text-lg font-display tracking-wider"
            style={{ 
              background: 'linear-gradient(135deg, hsl(38 70% 50%), hsl(35 60% 35%))',
              color: 'hsl(35 25% 95%)'
            }}
          >
            Отлично!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TicketDialog;
