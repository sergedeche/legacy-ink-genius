import sectionGenius from "@/assets/section-genius.png";
import sectionDetails from "@/assets/section-details.png";
import sectionReputation from "@/assets/section-reputation.png";
import sectionTimeless from "@/assets/section-timeless.png";
import sectionLegacy from "@/assets/section-legacy.png";

interface InsightCardProps {
  title: string;
  description: string;
  image: string;
  reverse?: boolean;
}

const InsightCard = ({ title, description, image, reverse }: InsightCardProps) => {
  return (
    <div className={`flex flex-col ${reverse ? 'lg:flex-row-reverse' : 'lg:flex-row'} gap-6 lg:gap-10 items-center`}>
      <div className="w-full lg:w-1/2">
        <div className="overflow-hidden rounded shadow-card">
          <img 
            src={image} 
            alt={title}
            className="w-full h-48 lg:h-64 object-cover transition-transform duration-700 hover:scale-105"
          />
        </div>
      </div>
      
      <div className="w-full lg:w-1/2 text-center lg:text-left">
        <h3 className="font-display text-2xl md:text-3xl text-sepia mb-4">
          {title}
        </h3>
        <p className="font-body text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
};

const KeyInsightsSection = () => {
  const insights = [
    {
      title: "Умение распознавать гения",
      description: "На примерах Василия Жуковского, признавшего превосходство молодого Пушкина, или судьбы Сергея Довлатова, чей «человеческий актив» был оценён слишком поздно, мы обсуждаем навык лидера вовремя увидеть масштаб таланта в своём окружении.",
      image: sectionGenius,
    },
    {
      title: "Внимание к критическим деталям",
      description: "Разбирая «Евгения Онегина» и уникальные первые издания Льва Толстого, мы тренируем навык видеть смыслы, скрытые от большинства. Это разговор о нюансах, которые определяют успех всей стратегии.",
      image: sectionDetails,
    },
    {
      title: "Управление имиджем и контекстом",
      description: "История княгини Голицыной («Пиковой дамы») учит работе с репутацией на высшем уровне: не защищаться от интерпретаций, а использовать их для масштабирования своего влияния.",
      image: sectionReputation,
    },
    {
      title: "Масштаб личности и своевременность",
      description: "Через историю публикации Михаила Булгакова и других авторов мы обсуждаем феномен своевременности. Это диалог о воле лидера и способности идей преодолевать десятилетия.",
      image: sectionTimeless,
    },
    {
      title: "Наследие против Наследства",
      description: "Исследуя опыт меценатов (Румянцев, Третьяковы и др.), создававших проекты масштаба страны, мы говорим о том, как создать ценность, которая будет передаваться из века в век, в отличие от капитала, тающего буквально на следующем поколении.",
      image: sectionLegacy,
    },
  ];

  return (
    <section id="insights" className="py-12 md:py-16 px-6 bg-cream-dark">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <div className="section-divider" />
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-sepia mb-4">
            Ключевые смыслы
          </h2>
          <p className="font-body text-muted-foreground max-w-2xl mx-auto">
            Каждая тема — это глубокое исследование управленческих принципов через призму литературного наследия
          </p>
        </div>
        
        <div className="space-y-12">
          {insights.map((insight, index) => (
            <InsightCard
              key={index}
              title={insight.title}
              description={insight.description}
              image={insight.image}
              reverse={index % 2 === 1}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default KeyInsightsSection;
