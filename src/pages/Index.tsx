import { useState, lazy, Suspense } from "react";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";

const AboutSection = lazy(() => import("@/components/AboutSection"));
const KeyInsightsSection = lazy(() => import("@/components/KeyInsightsSection"));
const UniqueFormatSection = lazy(() => import("@/components/UniqueFormatSection"));
const EventCalendarSection = lazy(() => import("@/components/EventCalendarSection"));
const AuthorSection = lazy(() => import("@/components/AuthorSection"));
const CharitySection = lazy(() => import("@/components/CharitySection"));
const PartnersSection = lazy(() => import("@/components/PartnersSection"));
const Footer = lazy(() => import("@/components/Footer"));
const TelegramDialog = lazy(() => import("@/components/TelegramDialog"));
const SavedTicketButton = lazy(() => import("@/components/SavedTicketButton"));

const Index = () => {
  const [telegramOpen, setTelegramOpen] = useState(false);
  
  const handleBookingClick = () => {
    const calendarSection = document.getElementById('calendar');
    if (calendarSection) {
      calendarSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <main className="min-h-screen">
      <Header onContactClick={() => setTelegramOpen(true)} />
      <HeroSection onBookingClick={handleBookingClick} />
      <Suspense fallback={null}>
        <AboutSection />
        <UniqueFormatSection />
        <KeyInsightsSection />
        <CharitySection onContactClick={() => setTelegramOpen(true)} />
        <PartnersSection />
        <EventCalendarSection />
        <AuthorSection />
        <Footer />
        <TelegramDialog open={telegramOpen} onOpenChange={setTelegramOpen} />
        <SavedTicketButton />
      </Suspense>
    </main>
  );
};

export default Index;
