import { useRef } from "react";
import heroMobile from "@/assets/hero-mobile.webp";
import heroDesktop from "@/assets/hero-desktop.webp";
import { useIsMobile } from "@/hooks/use-mobile";

interface HeroSectionProps {
  onBookingClick: () => void;
}

const HeroSection = ({ onBookingClick }: HeroSectionProps) => {
  const isMobile = useIsMobile();

  // Mobile layout: text overlaid on image with cloud backdrop
  if (isMobile) {
    return (
      <section className="relative min-h-screen flex flex-col items-center justify-end overflow-hidden pb-12">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroMobile})` }}
        />
        
        {/* Text content with cloud backdrop */}
        <div className="relative z-10 text-center mx-6 animate-fade-in">
          <div 
            className="absolute inset-0 -z-20"
            style={{
              background: 'linear-gradient(to bottom, hsl(40 35% 93% / 0.85) 0%, hsl(40 35% 93% / 0.8) 30%, hsl(40 35% 93% / 0.5) 60%, transparent 100%)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              borderRadius: '2rem 2rem 2rem 2rem',
            }}
          />
          
          <div className="px-8 pt-8 pb-8">
            <p className="font-display text-xs font-medium tracking-[0.15em] uppercase text-gold-dark mb-2 opacity-0 animate-fade-up">
              Интеллектуальный экскурс
            </p>
            
            <h1 className="font-display text-4xl font-medium tracking-wide text-sepia leading-none opacity-0 animate-fade-up delay-100">
              Стратегия
            </h1>
            <h1 className="font-display text-4xl font-medium tracking-wide text-sepia mb-2 leading-none opacity-0 animate-fade-up delay-100">
              Наследия
            </h1>
            
            <p className="font-display text-lg font-medium italic text-sepia leading-snug opacity-0 animate-fade-up delay-200">
              Наследие прошлого — стратегия
            </p>
            <p className="font-display text-lg font-medium italic text-sepia leading-snug opacity-0 animate-fade-up delay-200">
              будущего
            </p>
          </div>
        </div>
        
        {/* Button */}
        <div className="relative z-10 mt-10 animate-fade-in">
          <button 
            onClick={onBookingClick}
            className="relative text-xs px-8 py-3 opacity-0 animate-fade-up delay-400 tracking-[0.15em] font-display uppercase transition-all duration-300"
            style={{
              background: 'hsl(40 35% 93% / 0.75)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              borderRadius: '9999px',
              border: '1px solid hsl(38 70% 50% / 0.4)',
              color: 'hsl(35 60% 30%)',
            }}
          >
            Забронировать место
          </button>
        </div>
      </section>
    );
  }

  // Desktop layout: static hero image with text at bottom
  return (
    <section className="relative h-screen overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroDesktop})` }}
      />

      {/* CTA button — top left with pulsing effect */}
      <div className="absolute top-24 left-8 z-10 opacity-0 animate-fade-up delay-400">
        <button
          onClick={onBookingClick}
          className="relative btn-heritage text-xs px-6 py-2.5 pulse"
          style={{
            background: 'hsl(40 35% 93% / 0.8)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            border: '1px solid hsl(38 70% 50% / 0.3)',
          }}
        >
          Забронировать место
        </button>
      </div>

      {/* Content overlay — pinned to bottom, 80% width */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[80%] z-10 animate-fade-in">
        <div className="relative px-10 py-4">
          {/* Semi-transparent backdrop */}
          <div
            className="absolute inset-0 bg-cream/75 backdrop-blur-sm border border-gold/20 shadow-elegant -z-10"
            style={{ borderRadius: '1.5rem' }}
          />

          <div className="flex flex-col items-center text-center gap-1.5">
            <p className="font-display text-sm tracking-[0.2em] uppercase text-gold-dark opacity-0 animate-fade-up">
              Интеллектуальный экскурс:
            </p>
            <h1 className="font-display text-4xl font-medium tracking-wide text-sepia opacity-0 animate-fade-up delay-100">
              Стратегия Наследия
            </h1>
            <div className="w-10 h-px bg-gold/50 opacity-0 animate-fade-up delay-200" />
            <p className="font-display text-base italic text-sepia-light opacity-0 animate-fade-up delay-200">
              Наследие прошлого — стратегии будущего
            </p>
            <p className="font-body text-xs text-muted-foreground opacity-0 animate-fade-up delay-300">
              Формат для тех, кто готов создавать историю, а не просто управлять бизнесом.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
