import aboutBg from "@/assets/about-bg.png";

const AboutSection = () => {
  return (
    <section id="about" className="py-8 md:py-10 px-6 bg-cream relative overflow-hidden">
      {/* Background image with low opacity */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-15"
        style={{ backgroundImage: `url(${aboutBg})` }}
      />
      
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <div className="section-divider" />
        
        <h2 className="font-display text-2xl md:text-3xl lg:text-4xl text-sepia mb-5">
          О проекте
        </h2>
        
        <div className="space-y-4 text-muted-foreground font-body text-base leading-relaxed">
          <p>
            Этот проект — не классическая лекция по литературе, а исследование механик успеха, 
            визионерства и личного следа через призму великих редких книг и их известных авторов.
          </p>
          
          <p>
            Литературные артефакты будут использованы как инструмент для разговора о больших смыслах 
            и управленческих вызовах. Ведь в периоды турбулентности мы ищем опору внутри, 
            в нашем культурном коде, идентичности.
          </p>
          
          <p className="text-sepia font-display text-xl italic">
            И именно это помогает сохранять смыслы, команду и мотивацию.
          </p>
        </div>
        
        <div className="section-divider mt-8" />
      </div>
    </section>
  );
};

export default AboutSection;
