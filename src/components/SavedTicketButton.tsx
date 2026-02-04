import { useState } from "react";
import { Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTicketStorage, SavedTicket } from "@/hooks/useTicketStorage";
import TicketDialog from "./TicketDialog";

const SavedTicketButton = () => {
  const { savedTickets, hasTickets } = useTicketStorage();
  const [selectedTicket, setSelectedTicket] = useState<SavedTicket | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  if (!hasTickets) return null;

  const latestTicket = savedTickets[savedTickets.length - 1];

  const handleClick = () => {
    setSelectedTicket(latestTicket);
    setDialogOpen(true);
  };

  return (
    <>
      <Button
        onClick={handleClick}
        variant="outline"
        size="sm"
        className="fixed bottom-4 right-4 z-50 shadow-lg flex items-center gap-2 animate-in slide-in-from-bottom-4"
        style={{
          backgroundColor: 'hsl(215 30% 15%)',
          borderColor: 'hsl(38 70% 50%)',
          color: 'hsl(38 70% 50%)',
        }}
      >
        <Ticket className="w-4 h-4" />
        <span className="hidden sm:inline">Мой билет</span>
      </Button>

      {selectedTicket && (
        <TicketDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          ticketCode={selectedTicket.ticketCode}
          guestName={selectedTicket.guestName}
          eventTitle={selectedTicket.eventTitle}
          eventDate={selectedTicket.eventDate}
          seatsCount={selectedTicket.seatsCount}
        />
      )}
    </>
  );
};

export default SavedTicketButton;
