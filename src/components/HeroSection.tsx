import heroBg from "@/assets/hero-bg.png";

const HeroSection = () => {
  const scrollToContact = () => {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBg})` }}
      />
      
      {/* Content with backdrop */}
      <div className="relative z-10 text-center px-6 py-12 max-w-3xl mx-auto animate-fade-in">
        {/* Semi-transparent card backdrop */}
        <div className="absolute inset-0 bg-cream/80 backdrop-blur-sm rounded-lg border border-gold/20 shadow-elegant -z-10" />
        
        <div className="px-8 py-10 md:px-12 md:py-14">
          <p className="font-display text-base md:text-lg tracking-[0.25em] uppercase text-gold-dark mb-3 opacity-0 animate-fade-up">
            Интеллектуальный экскурс:
          </p>
          
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-medium tracking-wide text-sepia mb-4 opacity-0 animate-fade-up delay-100">
            Стратегия Наследия
          </h1>
          
          <p className="font-display text-lg md:text-xl italic text-sepia-light mb-3 opacity-0 animate-fade-up delay-200">
            Наследие прошлого — стратегии будущего
          </p>
          
          <div className="w-16 h-px bg-gold/50 mx-auto my-6 opacity-0 animate-fade-up delay-200" />
          
          <p className="font-body text-sm md:text-base text-muted-foreground max-w-lg mx-auto mb-8 opacity-0 animate-fade-up delay-300">
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
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce opacity-50">
        <div className="w-px h-16 bg-gradient-to-b from-gold to-transparent" />
      </div>
    </section>
  );
};

export default HeroSection;
