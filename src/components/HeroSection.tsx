import heroBg from "@/assets/hero-bg.png";
import heroMobile from "@/assets/hero-mobile.png";
import { useIsMobile } from "@/hooks/use-mobile";

interface HeroSectionProps {
  onContactClick: () => void;
}

const HeroSection = ({ onContactClick }: HeroSectionProps) => {
  const isMobile = useIsMobile();

  // Mobile layout: image on top, text below
  if (isMobile) {
    return (
      <section className="flex flex-col">
        {/* Mobile Image */}
        <div className="w-full">
          <img 
            src={heroMobile} 
            alt="Стратегия Наследия" 
            className="w-full h-auto object-contain"
          />
        </div>
        
        {/* Mobile Text Content */}
        <div className="bg-cream px-4 py-8 text-center animate-fade-in">
          <p className="font-display text-sm tracking-[0.2em] uppercase text-gold-dark mb-2 opacity-0 animate-fade-up">
            Интеллектуальный экскурс:
          </p>
          
          <h1 className="font-display text-3xl font-medium tracking-wide text-sepia mb-2 opacity-0 animate-fade-up delay-100">
            Стратегия Наследия
          </h1>
          
          <p className="font-display text-base italic text-sepia-light mb-2 opacity-0 animate-fade-up delay-200">
            Наследие прошлого — стратегии будущего
          </p>
          
          <div className="w-12 h-px bg-gold/50 mx-auto my-4 opacity-0 animate-fade-up delay-200" />
          
          <p className="font-body text-xs text-muted-foreground max-w-md mx-auto mb-5 opacity-0 animate-fade-up delay-300">
            Формат для тех, кто готов создавать историю,
            <br />а не просто управлять бизнесом.
          </p>
          
          <button 
            onClick={onContactClick}
            className="btn-heritage text-sm px-6 py-3 opacity-0 animate-fade-up delay-400"
          >
            Подробнее
          </button>
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
        <div className="absolute inset-0 bg-cream/75 backdrop-blur-sm rounded border border-gold/20 shadow-elegant -z-10" />
        
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
            onClick={onContactClick}
            className="btn-heritage text-sm px-6 py-3 opacity-0 animate-fade-up delay-400"
          >
            Подробнее
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
