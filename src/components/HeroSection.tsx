import heroBg from "@/assets/hero-bg.png";

const HeroSection = () => {
  const scrollToContact = () => {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image - no overlay to keep center transparent */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBg})` }}
      />
      
      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto animate-fade-in">
        <p className="font-display text-lg md:text-xl tracking-[0.3em] uppercase text-sepia-light mb-4 opacity-0 animate-fade-up">
          Интеллектуальный экскурс:
        </p>
        
        <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-medium tracking-wide text-sepia mb-6 opacity-0 animate-fade-up delay-100">
          Стратегия Наследия
        </h1>
        
        <p className="font-display text-xl md:text-2xl italic text-sepia-light mb-4 opacity-0 animate-fade-up delay-200">
          Наследие прошлого — стратегии будущего
        </p>
        
        <p className="font-body text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mb-10 opacity-0 animate-fade-up delay-300">
          Формат для тех, кто готов создавать историю,
          <br />а не просто управлять бизнесом.
        </p>
        
        <button 
          onClick={scrollToContact}
          className="btn-heritage opacity-0 animate-fade-up delay-400"
        >
          Подробнее
        </button>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce opacity-50">
        <div className="w-px h-16 bg-gradient-to-b from-gold to-transparent" />
      </div>
    </section>
  );
};

export default HeroSection;

