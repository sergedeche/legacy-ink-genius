import heroBg from "@/assets/hero-bg.png";
import heroMobile from "@/assets/hero-mobile.png";
import { useIsMobile } from "@/hooks/use-mobile";

interface HeroSectionProps {
  onBookingClick: () => void;
}

const HeroSection = ({ onBookingClick }: HeroSectionProps) => {
  const isMobile = useIsMobile();

  // Mobile layout: text overlaid on image with backdrop
  if (isMobile) {
    return (
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroMobile})` }}
        />
        
        {/* Content with glass backdrop - rounded corners, transparent edges */}
        <div className="relative z-10 text-center mx-6 animate-fade-in" style={{ marginTop: '8vh' }}>
          {/* Background with gradient fade and rounded border */}
          <div 
            className="absolute inset-0 -z-20"
            style={{
              background: 'linear-gradient(to bottom, transparent 0%, hsl(40 35% 93% / 0.7) 15%, hsl(40 35% 93% / 0.75) 50%, hsl(40 35% 93% / 0.7) 85%, transparent 100%)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid hsl(38 70% 50% / 0.2)',
              borderRadius: '2rem',
            }}
          />
          
          <div className="px-8 py-10">
            <p className="font-display text-xs tracking-[0.15em] uppercase text-gold-dark mb-2 opacity-0 animate-fade-up">
              Интеллектуальный экскурс
            </p>
            
            <h1 className="font-display text-4xl font-medium tracking-wide text-sepia leading-none opacity-0 animate-fade-up delay-100">
              Стратегия
            </h1>
            <h1 className="font-display text-4xl font-medium tracking-wide text-sepia mb-2 leading-none opacity-0 animate-fade-up delay-100">
              Наследия
            </h1>
            
            <p className="font-display text-base italic text-sepia-light leading-snug opacity-0 animate-fade-up delay-200">
              Наследие прошлого — стратегия
            </p>
            <p className="font-display text-base italic text-sepia-light mb-6 leading-snug opacity-0 animate-fade-up delay-200">
              будущего
            </p>
            
            {/* Button inside the card */}
            <button 
              onClick={onBookingClick}
              className="btn-heritage text-xs px-8 py-3 opacity-0 animate-fade-up delay-400 tracking-[0.15em]"
            >
              Забронировать место
            </button>
          </div>
        </div>
      </section>
    );
  }

  // Desktop layout: original overlay style
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBg})` }}
      />
      
      {/* Content with compact backdrop */}
      <div className="relative z-10 text-center px-4 py-6 max-w-xl mx-auto animate-fade-in">
        {/* Semi-transparent card backdrop */}
        <div className="absolute inset-0 bg-cream/75 backdrop-blur-sm border border-gold/20 shadow-elegant -z-10" style={{ borderRadius: '2rem' }} />
        
        <div className="px-8 py-8">
          <p className="font-display text-base tracking-[0.2em] uppercase text-gold-dark mb-2 opacity-0 animate-fade-up">
            Интеллектуальный экскурс:
          </p>
          
          <h1 className="font-display text-5xl font-medium tracking-wide text-sepia mb-2 opacity-0 animate-fade-up delay-100">
            Стратегия Наследия
          </h1>
          
          <p className="font-display text-lg italic text-sepia-light mb-2 opacity-0 animate-fade-up delay-200">
            Наследие прошлого — стратегии будущего
          </p>
          
          <div className="w-12 h-px bg-gold/50 mx-auto my-4 opacity-0 animate-fade-up delay-200" />
          
          <p className="font-body text-sm text-muted-foreground max-w-md mx-auto mb-5 opacity-0 animate-fade-up delay-300">
            Формат для тех, кто готов создавать историю,
            <br />а не просто управлять бизнесом.
          </p>
          
          <button 
            onClick={onBookingClick}
            className="btn-heritage text-sm px-6 py-3 opacity-0 animate-fade-up delay-400"
          >
            Забронировать место
          </button>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce opacity-50">
        <div className="w-px h-16 bg-gradient-to-b from-gold to-transparent" />
      </div>
    </section>
  );
};

export default HeroSection;
