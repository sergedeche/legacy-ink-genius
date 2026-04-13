import React, { useRef, useState, useEffect } from "react";
import savvaLogo from "@/assets/partner-savva.jpeg";
import kulturaDoma from "@/assets/partner-kultura-doma.png";

interface Partner {
  name: string;
  description: string;
  logo: string;
}

const partners: Partner[] = [
  {
    name: "SAVVA",
    description:
      "SAVVA — ресторан в исторических интерьерах отеля «Метрополь», сочетающий русскую, французскую и нордическую кухни. Здесь, под сводами легендарного здания, задуманного Саввой Мамонтовым, среди майолик Врубеля, читал стихи Сергей Есенин и пел Фёдор Шаляпин. Более 100 лет именно тут собирался весь московский бомонд.\n\nСегодня эта история продолжается благодаря бренд-шефу Андрею Шмакову. Под его руководством ресторан SAVVA получил звезду Michelin в Гиде Michelin-Moscow 2022 и вошёл в число самых заметных гастрономических проектов России.\n\nОтдельного внимания заслуживает специальное меню «Русская классика \u2018Метрополь 120\u2019» — переосмысление русской гастрономической традиции, где старинные рецепты звучат по-новому, сохраняя вкус наследия и приобретая интонацию нашего времени.",
    logo: savvaLogo,
  },
  {
    name: "Культура Дома",
    description:
      "«Культура Дома» — российский бренд премиальных товаров для дома: текстиля, посуды, декора и домашней одежды для всей семьи.\n\nВдохновением для Культуры Дома является наша страна с огромным культурным наследием, в которой каждый регион славится своими уникальными промыслами. Эти промыслы передаются из поколения в поколение, сохраняя многовековые традиции и мастерство.\n\nКультура Дома поддерживает русские традиции и искусство, помогает создавать уникальную атмосферу в каждом доме с русским стилем и самобытностью в его современном прочтении.",
    logo: kulturaDoma,
  },
];

const PartnerCard = ({ partner }: { partner: Partner }) => (
  <div className="flex flex-col items-center text-center p-6 md:p-8 min-w-[85vw] md:min-w-0 snap-center">
    <div className="w-28 h-28 md:w-32 md:h-32 rounded-full overflow-hidden mb-5 border border-border">
      <img
        src={partner.logo}
        alt={partner.name}
        className="w-full h-full object-cover !rounded-none"
      />
    </div>
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
      <div className="max-w-5xl mx-auto">
        <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-center mb-8 md:mb-12 text-foreground">
          Партнёры мероприятия
        </h2>

        {/* Desktop grid */}
        <div className="hidden md:grid grid-cols-2 gap-6">
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
