import authorImage from "@/assets/author-sergey.webp";

const AuthorSection = () => {
  const achievements = [
    "Эксперт с 20+ летним опытом в компаниях Fortune 500, совет директоров",
    "Основатель агентства по автоматизации бизнеса через ИИ",
    "Спикер, ментор, инвестор",
    "Коллекционер антикварной литературы и патрон Пушкинского музея",
  ];

  return (
    <section id="author" className="py-20 md:py-32" style={{ backgroundColor: 'hsl(25 20% 10%)' }}>
      <div className="container mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="font-display text-4xl md:text-6xl lg:text-7xl tracking-[0.2em] uppercase mb-6" style={{ color: 'hsl(38 70% 50%)' }}>
            Об авторе
          </h2>
          <div className="w-24 h-px mx-auto" style={{ background: 'linear-gradient(90deg, transparent, hsl(38 70% 50%), transparent)' }} />
        </div>

        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Image */}
          <div className="flex justify-center">
            <div 
              className="relative w-64 h-80 md:w-80 md:h-96 overflow-hidden"
              style={{ 
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                border: '2px solid hsl(38 70% 50% / 0.3)',
                borderRadius: '1rem'
              }}
            >
              <img 
                src={authorImage} 
                alt="Сергей Черненко" 
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover object-top"
              />
            </div>
          </div>

          {/* Content */}
          <div className="space-y-6">
            <h3 className="font-display text-3xl md:text-4xl lg:text-5xl tracking-wide" style={{ color: 'hsl(35 25% 95%)' }}>
              Сергей Черненко
            </h3>
            
            <div className="space-y-4">
              {achievements.map((achievement, index) => (
                <div 
                  key={index}
                  className="flex items-start gap-4"
                >
                  <span 
                    className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                    style={{ backgroundColor: 'hsl(38 70% 50%)' }}
                  />
                  <p 
                    className="font-body text-base md:text-lg leading-relaxed"
                    style={{ color: 'hsl(35 20% 75%)' }}
                  >
                    {achievement}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AuthorSection;
