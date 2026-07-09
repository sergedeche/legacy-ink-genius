import React, { useRef, useState, useEffect } from "react";
import savvaLogo from "@/assets/partner-savva.webp";
import kulturaDoma from "@/assets/partner-kultura-doma.webp";
import domVishnevskihLogo from "@/assets/partner-dom-vishnevskih.webp";

interface Partner {
  name: string;
  description: string;
  logo?: string;
  initials?: string;
  url: string;
}

const partners: Partner[] = [
  {
    name: "Культура Дома",
    description:
      "«Культура Дома» — российский бренд премиальных товаров для дома: текстиля, посуды, декора и домашней одежды для всей семьи.\n\nВдохновением для Культуры Дома является наша страна с огромным культурным наследием, в которой каждый регион славится своими уникальными промыслами. Эти промыслы передаются из поколения в поколение, сохраняя многовековые традиции и мастерство.\n\nКультура Дома поддерживает русские традиции и искусство, помогает создавать уникальную атмосферу в каждом доме с русским стилем и самобытностью в его современном прочтении.",
    logo: kulturaDoma,
    url: "https://kultura-doma.ru",
  },
  {
    name: "SAVVA",
    description:
      "SAVVA — ресторан в исторических интерьерах отеля «Метрополь», сочетающий русскую, французскую и нордическую кухни. Здесь, под сводами легендарного здания, задуманного Саввой Мамонтовым, среди майолик Врубеля, читал стихи Сергей Есенин и пел Фёдор Шаляпин. Более 100 лет именно тут собирался весь московский бомонд.\n\nСегодня эта история продолжается благодаря бренд-шефу Андрею Шмакову. Под его руководством ресторан SAVVA получил звезду Michelin в Гиде Michelin-Moscow 2022 и вошёл в число самых заметных гастрономических проектов России.\n\nОтдельного внимания заслуживает специальное меню «Русская классика \u2018Метрополь 120\u2019» — переосмысление русской гастрономической традиции, где старинные рецепты звучат по-новому, сохраняя вкус наследия и приобретая интонацию нашего времени.",
    logo: savvaLogo,
    url: "https://www.savvarest.ru/index.html",
  },
  {
    name: "Дом Вишневских",
    description:
      "Дом Вишневских — исторический московский особняк, в котором сохранилась атмосфера старой Москвы с её неспешным ритмом, традициями гостеприимства и уважением к культуре. Подобные городские дома были местом, где пересекались частная жизнь, интеллектуальные беседы и общественная деятельность, а архитектура становилась отражением эпохи и вкуса своих владельцев.\n\nСегодня Дом Вишневских открывает новую главу своей истории, оставаясь пространством для встреч, лекций, камерных концертов, выставок, деловых мероприятий и частных событий. Исторические интерьеры создают особую среду, где культурное наследие становится естественной частью современного общения, а каждое событие приобретает глубину и неповторимую атмосферу.",
    logo: domVishnevskihLogo.url,
    url: "https://domvishnevski.com/",
  },
];

const PartnerCard = ({ partner }: { partner: Partner }) => (
  <div className="flex flex-col items-center text-center p-6 md:p-8 min-w-[85vw] md:min-w-0 snap-center">
    <a
      href={partner.url}
      target="_blank"
      rel="noopener noreferrer"
      className="w-28 h-28 md:w-32 md:h-32 rounded-full overflow-hidden mb-5 border border-border block hover:shadow-lg transition-shadow"
    >
      {partner.logo ? (
        <img
          src={partner.logo}
          alt={partner.name}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover !rounded-none"
        />
      ) : (
        <div
          className="w-full h-full flex items-center justify-center font-display text-4xl"
          style={{ backgroundColor: 'hsl(var(--card))', color: 'hsl(var(--gold))' }}
          aria-label={partner.name}
        >
          {partner.initials || partner.name.charAt(0)}
        </div>
      )}
    </a>
    <p className="font-body text-sm md:text-base text-muted-foreground leading-relaxed whitespace-pre-line">
      {partner.description}
    </p>
  </div>
);

const PartnersSection = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    const onScroll = () => {
      const scrollLeft = container.scrollLeft;
      const width = container.clientWidth;
      setActiveIndex(Math.round(scrollLeft / width));
    };
    container.addEventListener("scroll", onScroll, { passive: true });
    return () => container.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section id="partners" className="py-8 md:py-12 px-6 bg-background">
      <div className="max-w-6xl mx-auto">
        <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-center mb-8 md:mb-12 text-foreground">
          Партнёры мероприятия
        </h2>

        {/* Desktop grid */}
        <div className="hidden md:grid grid-cols-3 gap-6">
          {partners.map((p) => (
            <PartnerCard key={p.name} partner={p} />
          ))}
        </div>

        {/* Mobile swipe */}
        <div className="md:hidden">
          <div
            ref={scrollRef}
            className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide gap-4"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none", WebkitOverflowScrolling: "touch" }}
          >
            {partners.map((p) => (
              <PartnerCard key={p.name} partner={p} />
            ))}
          </div>
          {/* Dots */}
          <div className="flex justify-center gap-2 mt-4">
            {partners.map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full transition-colors duration-300"
                style={{
                  backgroundColor: i === activeIndex ? 'hsl(var(--gold))' : 'hsl(var(--border))',
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PartnersSection;
