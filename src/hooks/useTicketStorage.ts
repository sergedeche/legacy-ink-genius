import { useState, useEffect, useCallback } from "react";

export interface SavedTicket {
  ticketCode: string;
  guestName: string;
  eventTitle: string;
  eventDate: string;
  seatsCount: number;
  venue?: string;
  savedAt: string;
}

const STORAGE_KEY = "legacy_saved_tickets";

export function useTicketStorage() {
  const [savedTickets, setSavedTickets] = useState<SavedTicket[]>([]);

  // Load tickets from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as SavedTicket[];
        // Filter out expired tickets (older than 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const validTickets = parsed.filter(
          (t) => new Date(t.savedAt) > thirtyDaysAgo
        );
        setSavedTickets(validTickets);
        // Update storage if we removed any
        if (validTickets.length !== parsed.length) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(validTickets));
        }
      }
    } catch (e) {
      console.error("Failed to load saved tickets:", e);
    }
  }, []);

  const saveTicket = useCallback((ticket: Omit<SavedTicket, "savedAt">) => {
    setSavedTickets((prev) => {
      // Check if ticket already exists
      const exists = prev.some((t) => t.ticketCode === ticket.ticketCode);
      if (exists) return prev;

      const newTicket: SavedTicket = {
        ...ticket,
        savedAt: new Date().toISOString(),
      };
      const updated = [...prev, newTicket];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const removeTicket = useCallback((ticketCode: string) => {
    setSavedTickets((prev) => {
      const updated = prev.filter((t) => t.ticketCode !== ticketCode);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const getLatestTicket = useCallback((): SavedTicket | null => {
    if (savedTickets.length === 0) return null;
    return savedTickets[savedTickets.length - 1];
  }, [savedTickets]);

  return {
    savedTickets,
    saveTicket,
    removeTicket,
    getLatestTicket,
    hasTickets: savedTickets.length > 0,
  };
}
