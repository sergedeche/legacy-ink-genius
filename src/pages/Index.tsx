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

const Index = () => {
  const [telegramOpen, setTelegramOpen] = useState(false);

  return (
    <main className="min-h-screen">
      <Header onContactClick={() => setTelegramOpen(true)} />
      <HeroSection onContactClick={() => setTelegramOpen(true)} />
      <AboutSection />
      <KeyInsightsSection />
      <UniqueFormatSection />
      <EventCalendarSection />
      <CharitySection onContactClick={() => setTelegramOpen(true)} />
      <Footer />
      <TelegramDialog open={telegramOpen} onOpenChange={setTelegramOpen} />
    </main>
  );
};

export default Index;
