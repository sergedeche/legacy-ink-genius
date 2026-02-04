import { BookOpen, Lock, Users } from "lucide-react";

interface FormatFeatureProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FormatFeature = ({ icon, title, description }: FormatFeatureProps) => {
  return (
    <div className="text-center p-6 group">
      <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-gold/10 flex items-center justify-center text-gold group-hover:bg-gold group-hover:text-cream transition-all duration-300">
        {icon}
      </div>
      <h3 className="font-display text-xl md:text-2xl text-sepia mb-3">
        {title}
      </h3>
      <p className="font-body text-muted-foreground leading-relaxed">
        {description}
      </p>
    </div>
  );
};

const UniqueFormatSection = () => {
  const features = [
    {
      icon: <BookOpen className="w-7 h-7" />,
      title: "Прикосновение к вечности",
      description: "Все участники лично взаимодействуют с книгами музейного уровня, многим из которых более 200 лет, включая первые издания и автографы авторов.",
    },
    {
      icon: <Lock className="w-7 h-7" />,
      title: "Закрытый доступ",
      description: "Мероприятия проводятся на территории закрытых сообществ, куда попасть без приглашения и рекомендации невозможно.",
    },
    {
      icon: <Users className="w-7 h-7" />,
      title: "Ограниченное количество гостей",
      description: "У каждого будет время и возможность «пообщаться» с каждым артефактом лично.",
    },
  ];

  return (
    <section id="format" className="py-8 md:py-10 px-6 bg-cream">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <div className="section-divider" />
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-sepia mb-4">
            Уникальность формата
          </h2>
          <p className="font-body text-muted-foreground max-w-2xl mx-auto">
            Опыт, который невозможно воспроизвести в открытом доступе
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FormatFeature
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default UniqueFormatSection;
