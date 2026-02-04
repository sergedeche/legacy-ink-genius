import formatIconTouch from "@/assets/format-icon-touch-transparent.png";
import formatIconClosed from "@/assets/format-icon-closed-transparent.png";
import formatIconLimited from "@/assets/format-icon-limited-transparent.png";
import formatIconTea from "@/assets/format-icon-tea.png";

interface FormatFeatureProps {
  image: string;
  title: string;
  description: string;
}

const FormatFeature = ({ image, title, description }: FormatFeatureProps) => {
  return (
    <div className="text-center p-6 group">
      <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden bg-cream">
        <img 
          src={image} 
          alt={title}
          className="w-full h-full object-cover scale-[1.12] mix-blend-multiply"
        />
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
      image: formatIconTouch,
      title: "Прикосновение к вечности",
      description: "Все участники лично взаимодействуют с книгами музейного уровня, многим из которых более 200 лет, включая первые издания и автографы авторов.",
    },
    {
      image: formatIconClosed,
      title: "Закрытый доступ",
      description: "Мероприятия проводятся на территории закрытых сообществ, куда попасть без приглашения и рекомендации невозможно.",
    },
    {
      image: formatIconLimited,
      title: "Ограниченное количество гостей",
      description: "У каждого будет время и возможность «пообщаться» с каждым артефактом лично.",
    },
    {
      image: formatIconTea,
      title: "Чаепитие в русских традициях",
      description: "Тёплый разговор за столом, предметы с историей и живая связь с культурным кодом.",
    },
  ];

  return (
    <section id="format" className="py-6 md:py-8 px-6 bg-cream">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <div className="section-divider" />
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-sepia mb-4">
            Уникальность формата
          </h2>
          <p className="font-body text-muted-foreground max-w-2xl mx-auto">
            Опыт, который невозможно воспроизвести в открытом доступе
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {features.map((feature, index) => (
            <FormatFeature
              key={index}
              image={feature.image}
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
