import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Ticket, Calendar, User, Users, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="sm:max-w-md p-0 overflow-hidden"
        style={{ backgroundColor: 'hsl(35 25% 95%)', borderColor: 'hsl(38 70% 50%)' }}
      >
        {/* Ticket Header */}
        <div 
          className="p-6 text-center"
          style={{ background: 'linear-gradient(135deg, hsl(38 70% 50%), hsl(35 60% 35%))' }}
        >
          <Ticket className="w-12 h-12 mx-auto mb-3" style={{ color: 'hsl(35 25% 95%)' }} />
          <DialogHeader>
            <DialogTitle className="font-display text-2xl" style={{ color: 'hsl(35 25% 95%)' }}>
              Билет подтверждён
            </DialogTitle>
          </DialogHeader>
        </div>

        {/* Ticket Body */}
        <div className="p-6 space-y-6">
          {/* Ticket Code */}
          <div className="text-center">
            <p className="text-sm uppercase tracking-wider mb-2" style={{ color: 'hsl(35 20% 50%)' }}>
              Код билета
            </p>
            <div 
              className="font-mono text-3xl tracking-[0.3em] py-4 px-6 rounded-lg inline-block"
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
              className="absolute -left-6 top-1/2 -translate-y-1/2 w-4 h-8 rounded-r-full"
              style={{ backgroundColor: 'hsl(var(--background))' }}
            />
            <div 
              className="absolute -right-6 top-1/2 -translate-y-1/2 w-4 h-8 rounded-l-full"
              style={{ backgroundColor: 'hsl(var(--background))' }}
            />
          </div>

          {/* Event Details */}
          <div className="space-y-3">
            <h3 className="font-display text-xl text-center" style={{ color: 'hsl(25 20% 15%)' }}>
              {eventTitle}
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2" style={{ color: 'hsl(35 20% 40%)' }}>
                <Calendar className="w-4 h-4" style={{ color: 'hsl(38 70% 50%)' }} />
                <span className="text-sm">
                  {format(new Date(eventDate), 'd MMMM yyyy', { locale: ru })}
                </span>
              </div>
              <div className="flex items-center gap-2" style={{ color: 'hsl(35 20% 40%)' }}>
                <Calendar className="w-4 h-4" style={{ color: 'hsl(38 70% 50%)' }} />
                <span className="text-sm">
                  {format(new Date(eventDate), 'HH:mm', { locale: ru })}
                </span>
              </div>
              <div className="flex items-center gap-2" style={{ color: 'hsl(35 20% 40%)' }}>
                <User className="w-4 h-4" style={{ color: 'hsl(38 70% 50%)' }} />
                <span className="text-sm">{guestName}</span>
              </div>
              <div className="flex items-center gap-2" style={{ color: 'hsl(35 20% 40%)' }}>
                <Users className="w-4 h-4" style={{ color: 'hsl(38 70% 50%)' }} />
                <span className="text-sm">
                  {seatsCount} {seatsCount === 1 ? 'место' : seatsCount < 5 ? 'места' : 'мест'}
                </span>
              </div>
            </div>
          </div>

          {/* Confirmation message */}
          <div 
            className="p-3 rounded-lg flex items-center gap-2"
            style={{ backgroundColor: 'hsla(120, 50%, 50%, 0.1)' }}
          >
            <Check className="w-5 h-5" style={{ color: 'hsl(120 50% 40%)' }} />
            <p className="text-sm" style={{ color: 'hsl(120 40% 30%)' }}>
              Копия билета отправлена на email
            </p>
          </div>

          {/* Close Button */}
          <Button
            onClick={() => onOpenChange(false)}
            className="w-full h-12 text-lg font-display tracking-wider"
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
