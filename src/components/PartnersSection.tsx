import React from "react";

interface Partner {
  name: string;
  description: string;
  logo?: string;
}

const partners: Partner[] = [
  {
    name: "SAVVA",
    description:
      "SAVVA — ресторан в исторических интерьерах отеля «Метрополь», сочетающий русскую, французскую и нордическую кухни. Здесь, под сводами легендарного здания, задуманного Саввой Мамонтовым, среди майолик Врубеля, читал стихи Сергей Есенин и пел Фёдор Шаляпин. Более 100 лет именно тут собирался весь московский бомонд.\n\nСегодня эта история продолжается благодаря бренд-шефу Андрею Шмакову. Под его руководством ресторан SAVVA получил звезду Michelin в Гиде Michelin-Moscow 2022 и вошёл в число самых заметных гастрономических проектов России.\n\nОтдельного внимания заслуживает специальное меню «Русская классика \u2018Метрополь 120\u2019» — переосмысление русской гастрономической традиции, где старинные рецепты звучат по-новому, сохраняя вкус наследия и приобретая интонацию нашего времени.",
  },
  {
    name: "Культура Дома",
    description:
      "«Культура Дома» — российский бренд премиальных товаров для дома: текстиля, посуды, декора и домашней одежды для всей семьи.\n\nВдохновением для Культуры Дома является наша страна с огромным культурным наследием, в которой каждый регион славится своими уникальными промыслами. Эти промыслы передаются из поколения в поколение, сохраняя многовековые традиции и мастерство.\n\nКультура Дома поддерживает русские традиции и искусство, помогает создавать уникальную атмосферу в каждом доме с русским стилем и самобытностью в его современном прочтении.",
  },
];

const PartnerCard = ({ partner }: { partner: Partner }) => (
  <div className="flex flex-col items-center text-center p-6 md:p-8">
    {/* Logo placeholder */}
    <div className="w-32 h-32 md:w-36 md:h-36 rounded-2xl bg-cream-dark flex items-center justify-center mb-5 border border-border">
      <span className="font-display text-lg text-muted-foreground">{partner.name}</span>
    </div>
    <h3 className="font-display text-2xl md:text-3xl mb-3 text-foreground">{partner.name}</h3>
    <p className="font-body text-sm md:text-base text-muted-foreground leading-relaxed whitespace-pre-line">
      {partner.description}
    </p>
  </div>
);

const PartnersSection = () => {

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollLeft = container.scrollLeft;
      const width = container.clientWidth;
      setActiveIndex(Math.round(scrollLeft / width));
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section id="partners" className="py-8 md:py-12 px-6 bg-background">
      <div className="max-w-5xl mx-auto">
        <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-center mb-8 md:mb-12 text-foreground">
          Партнёры мероприятия
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {partners.map((p) => (
            <PartnerCard key={p.name} partner={p} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PartnersSection;
