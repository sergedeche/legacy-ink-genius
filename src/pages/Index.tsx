import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import KeyInsightsSection from "@/components/KeyInsightsSection";
import UniqueFormatSection from "@/components/UniqueFormatSection";
import CharitySection from "@/components/CharitySection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <main className="min-h-screen">
      <Header />
      <HeroSection />
      <AboutSection />
      <KeyInsightsSection />
      <UniqueFormatSection />
      <CharitySection />
      <ContactSection />
      <Footer />
    </main>
  );
};

export default Index;
