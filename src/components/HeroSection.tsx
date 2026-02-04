import heroBg from "@/assets/hero-bg.png";
import heroMobile from "@/assets/hero-mobile.png";
import monogram from "@/assets/monogram.png";
import { useIsMobile } from "@/hooks/use-mobile";

const HeroSection = () => {
  const isMobile = useIsMobile();
  
  const scrollToContact = () => {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Mobile layout: image with monogram on top, text below
  if (isMobile) {
    return (
      <section className="relative overflow-hidden bg-cream">
        {/* Mobile Hero Image with Monogram */}
        <div className="relative w-full aspect-[3/4]">
          <img 
            src={heroMobile} 
            alt="Heritage Strategy" 
            className="w-full h-full object-cover"
          />
          {/* Floating Monogram */}
          <div className="absolute inset-0 flex items-center justify-center">
            <img 
              src={monogram} 
              alt="СН Monogram" 
              className="w-40 h-40 object-contain drop-shadow-lg animate-fade-in"
            />
          </div>
        </div>
        
        {/* Text content below image */}
        <div className="px-6 py-8 text-center animate-fade-in">
          <p className="font-display text-sm tracking-[0.2em] uppercase text-gold-dark mb-2">
            Интеллектуальный экскурс:
          </p>
          
          <h1 className="font-display text-3xl font-medium tracking-wide text-sepia mb-2">
            Стратегия Наследия
          </h1>
          
          <p className="font-display text-base italic text-sepia-light mb-2">
            Наследие прошлого — стратегии будущего
          </p>
          
          <div className="w-12 h-px bg-gold/50 mx-auto my-4" />
          
          <p className="font-body text-xs text-muted-foreground max-w-md mx-auto mb-5">
            Формат для тех, кто готов создавать историю,
            <br />а не просто управлять бизнесом.
          </p>
          
          <button 
            onClick={scrollToContact}
            className="btn-heritage text-sm px-6 py-3"
          >
            Подробнее
          </button>
        </div>
      </section>
    );
  }

  // Desktop layout: original design
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
        
        <div className="px-6 py-6 md:px-8 md:py-8">
          <p className="font-display text-sm md:text-base tracking-[0.2em] uppercase text-gold-dark mb-2 opacity-0 animate-fade-up">
            Интеллектуальный экскурс:
          </p>
          
          <h1 className="font-display text-3xl md:text-5xl font-medium tracking-wide text-sepia mb-2 opacity-0 animate-fade-up delay-100">
            Стратегия Наследия
          </h1>
          
          <p className="font-display text-base md:text-lg italic text-sepia-light mb-2 opacity-0 animate-fade-up delay-200">
            Наследие прошлого — стратегии будущего
          </p>
          
          <div className="w-12 h-px bg-gold/50 mx-auto my-4 opacity-0 animate-fade-up delay-200" />
          
          <p className="font-body text-xs md:text-sm text-muted-foreground max-w-md mx-auto mb-5 opacity-0 animate-fade-up delay-300">
            Формат для тех, кто готов создавать историю,
            <br />а не просто управлять бизнесом.
          </p>
          
          <button 
            onClick={scrollToContact}
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
