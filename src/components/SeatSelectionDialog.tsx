import { useState } from "react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Users, Plus, Minus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import CheckoutDialog from "./CheckoutDialog";

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

interface SeatSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: Event;
  onBookingComplete: () => void;
}

const SeatSelectionDialog = ({ open, onOpenChange, event, onBookingComplete }: SeatSelectionDialogProps) => {
  const [selectedSeats, setSelectedSeats] = useState(1);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const maxSeats = Math.min(5, event.available_seats);
  const totalAmount = selectedSeats * event.price_per_seat;

  // Generate seat grid (4 rows x 5 columns = 20 seats)
  const rows = 4;
  const cols = 5;
  const bookedSeats = event.booked_seats;

  const handleIncrement = () => {
    if (selectedSeats < maxSeats) {
      setSelectedSeats(s => s + 1);
    }
  };

  const handleDecrement = () => {
    if (selectedSeats > 1) {
      setSelectedSeats(s => s - 1);
    }
  };

  const handleProceedToCheckout = () => {
    setCheckoutOpen(true);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg" style={{ backgroundColor: 'hsl(215 30% 15%)', borderColor: 'hsl(215 30% 25%)' }}>
          <DialogHeader>
            <DialogTitle className="font-display text-2xl" style={{ color: 'hsl(35 25% 95%)' }}>
              {event.title}
            </DialogTitle>
            <DialogDescription style={{ color: 'hsl(35 20% 65%)' }}>
              {format(new Date(event.event_date), 'd MMMM yyyy, HH:mm', { locale: ru })}
            </DialogDescription>
          </DialogHeader>

          <div className="py-6 space-y-6">
            {/* Seat Map */}
            <div>
              <p className="text-sm mb-4" style={{ color: 'hsl(35 20% 65%)' }}>
                Схема мест
              </p>
              <div className="p-4 rounded-lg" style={{ backgroundColor: 'hsl(215 30% 12%)' }}>
                {/* Stage indicator */}
                <div 
                  className="w-full h-8 rounded mb-4 flex items-center justify-center text-xs font-medium"
                  style={{ backgroundColor: 'hsl(215 30% 25%)', color: 'hsl(35 20% 65%)' }}
                >
                  СЦЕНА
                </div>
                
                {/* Seats grid */}
                <div className="space-y-2">
                  {Array.from({ length: rows }).map((_, rowIndex) => (
                    <div key={rowIndex} className="flex justify-center gap-2">
                      {Array.from({ length: cols }).map((_, colIndex) => {
                        const seatNumber = rowIndex * cols + colIndex + 1;
                        const isBooked = seatNumber <= bookedSeats;
                        
                        return (
                          <div
                            key={colIndex}
                            className="w-8 h-8 rounded flex items-center justify-center text-xs font-medium transition-all"
                            style={{
                              backgroundColor: isBooked 
                                ? 'hsl(0 0% 35%)' 
                                : 'hsl(38 70% 50%)',
                              color: isBooked 
                                ? 'hsl(0 0% 55%)' 
                                : 'hsl(25 20% 10%)',
                            }}
                          >
                            {seatNumber}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>

                {/* Legend */}
                <div className="flex items-center justify-center gap-6 mt-4 text-xs" style={{ color: 'hsl(35 20% 65%)' }}>
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded" style={{ backgroundColor: 'hsl(38 70% 50%)' }} />
                    <span>Свободно</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded" style={{ backgroundColor: 'hsl(0 0% 35%)' }} />
                    <span>Занято</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Seat Counter */}
            <div>
              <p className="text-sm mb-3" style={{ color: 'hsl(35 20% 65%)' }}>
                Количество мест (макс. {maxSeats})
              </p>
              <div className="flex items-center justify-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleDecrement}
                  disabled={selectedSeats <= 1}
                  className="h-12 w-12 rounded-full border-2"
                  style={{ 
                    borderColor: 'hsl(38 70% 50%)', 
                    color: 'hsl(38 70% 50%)',
                    backgroundColor: 'transparent'
                  }}
                >
                  <Minus className="h-5 w-5" />
                </Button>
                <span 
                  className="text-4xl font-display w-16 text-center"
                  style={{ color: 'hsl(35 25% 95%)' }}
                >
                  {selectedSeats}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleIncrement}
                  disabled={selectedSeats >= maxSeats}
                  className="h-12 w-12 rounded-full border-2"
                  style={{ 
                    borderColor: 'hsl(38 70% 50%)', 
                    color: 'hsl(38 70% 50%)',
                    backgroundColor: 'transparent'
                  }}
                >
                  <Plus className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Total */}
            <div 
              className="p-4 rounded-lg flex items-center justify-between"
              style={{ backgroundColor: 'hsl(215 30% 12%)' }}
            >
              <div className="flex items-center gap-2" style={{ color: 'hsl(35 20% 65%)' }}>
                <Users className="w-5 h-5" />
                <span>{selectedSeats} {selectedSeats === 1 ? 'место' : selectedSeats < 5 ? 'места' : 'мест'}</span>
              </div>
              <div className="text-right">
                <p className="text-sm" style={{ color: 'hsl(35 20% 65%)' }}>Итого:</p>
                <p className="text-2xl font-display" style={{ color: 'hsl(38 70% 50%)' }}>
                  {totalAmount} ₽
                </p>
              </div>
            </div>

            {/* Proceed Button */}
            <Button
              onClick={handleProceedToCheckout}
              className="w-full h-12 text-lg font-display tracking-wider"
              style={{ 
                background: 'linear-gradient(135deg, hsl(38 70% 50%), hsl(35 60% 35%))',
                color: 'hsl(35 25% 95%)'
              }}
            >
              Продолжить
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <CheckoutDialog
        open={checkoutOpen}
        onOpenChange={setCheckoutOpen}
        event={event}
        seatsCount={selectedSeats}
        totalAmount={totalAmount}
        onBookingComplete={() => {
          setCheckoutOpen(false);
          onOpenChange(false);
          onBookingComplete();
        }}
      />
    </>
  );
};

export default SeatSelectionDialog;
