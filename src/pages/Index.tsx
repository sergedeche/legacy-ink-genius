import { useState } from "react";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import KeyInsightsSection from "@/components/KeyInsightsSection";
import UniqueFormatSection from "@/components/UniqueFormatSection";
import EventCalendarSection from "@/components/EventCalendarSection";
import AuthorSection from "@/components/AuthorSection";
import CharitySection from "@/components/CharitySection";
import Footer from "@/components/Footer";
import TelegramDialog from "@/components/TelegramDialog";
import SavedTicketButton from "@/components/SavedTicketButton";

const Index = () => {
  const [telegramOpen, setTelegramOpen] = useState(false);
  
  const handleBookingClick = () => {
    // Scroll to calendar section
    const calendarSection = document.getElementById('calendar');
    if (calendarSection) {
      calendarSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <main className="min-h-screen">
      <Header onContactClick={() => setTelegramOpen(true)} />
      <HeroSection onBookingClick={handleBookingClick} />
      <AboutSection />
      <KeyInsightsSection />
      <UniqueFormatSection />
      <CharitySection onContactClick={() => setTelegramOpen(true)} />
      <EventCalendarSection />
      <AuthorSection />
      <Footer />
      <TelegramDialog open={telegramOpen} onOpenChange={setTelegramOpen} />
      <SavedTicketButton />
    </main>
  );
};

export default Index;
