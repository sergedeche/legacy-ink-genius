const AboutSection = () => {
  return (
    <section className="py-24 px-6 bg-cream">
      <div className="max-w-4xl mx-auto text-center">
        <div className="section-divider" />
        
        <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-sepia mb-8">
          О проекте
        </h2>
        
        <div className="space-y-6 text-muted-foreground font-body text-lg leading-relaxed">
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
        
        <div className="section-divider mt-12" />
      </div>
    </section>
  );
};

export default AboutSection;
