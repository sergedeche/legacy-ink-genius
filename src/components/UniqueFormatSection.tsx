import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import formatIconTouch from "@/assets/format-icon-touch-transparent.png";
import formatIconClosed from "@/assets/format-icon-closed-transparent.png";
import formatIconLimited from "@/assets/format-icon-limited-transparent.png";
import formatIconTea from "@/assets/format-icon-tea.png";
import formatBg from "@/assets/format-bg.png";

interface FormatFeatureProps {
  image: string;
  title: string;
  description: string;
  scale?: string;
}

const FormatFeature = ({ image, title, description, scale = "scale-[1.12]" }: FormatFeatureProps) => {
  return (
    <div className="text-center p-4 md:p-6 group">
      <div className="w-28 h-28 md:w-32 md:h-32 mx-auto mb-4 rounded-full overflow-hidden bg-cream">
        <img 
          src={image} 
          alt={title}
          className={`w-full h-full object-cover ${scale} mix-blend-multiply`}
        />
      </div>
      <h3 className="font-display text-lg md:text-xl lg:text-2xl text-sepia mb-3">
        {title}
      </h3>
      <p className="font-body text-sm md:text-base text-muted-foreground leading-relaxed">
        {description}
      </p>
    </div>
  );
};

const features = [
  {
    image: formatIconTouch,
    title: "Прикосновение к вечности",
    description: "Все участники лично взаимодействуют с книгами музейного уровня, многим из которых более 200 лет, включая первые издания и автографы авторов.",
    scale: "scale-[1.12]",
  },
  {
    image: formatIconClosed,
    title: "Закрытый доступ",
    description: "Мероприятия проводятся на территории закрытых сообществ, куда попасть без приглашения и рекомендации невозможно.",
    scale: "scale-[1.25]",
  },
  {
    image: formatIconLimited,
    title: "Ограниченное количество гостей",
    description: "У каждого будет время и возможность «пообщаться» с каждым артефактом лично.",
    scale: "scale-[1.25]",
  },
  {
    image: formatIconTea,
    title: "Чаепитие в русских традициях",
    description: "Тёплый разговор за столом, предметы с историей и живая связь с культурным кодом.",
    scale: "scale-[1.25]",
  },
];

// Mobile carousel - 1 item per slide, 4 dots
const MobileCarousel = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, align: "start" });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    onSelect();
  }, [emblaApi, onSelect]);

  const scrollTo = useCallback((index: number) => {
    if (emblaApi) emblaApi.scrollTo(index);
  }, [emblaApi]);

  return (
    <div className="md:hidden">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {features.map((feature, index) => (
            <div key={index} className="flex-[0_0_100%] min-w-0">
              <FormatFeature {...feature} />
            </div>
          ))}
        </div>
      </div>

      {/* 4 dots for mobile */}
      <div className="flex justify-center gap-2 mt-6">
        {[0, 1, 2, 3].map((index) => (
          <button
            key={index}
            onClick={() => scrollTo(index)}
            className={`h-2.5 rounded-full transition-all duration-300 ${
              index === selectedIndex 
                ? "bg-gold w-6" 
                : "bg-sepia/30 hover:bg-sepia/50 w-2.5"
            }`}
            aria-label={`Перейти к слайду ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

// Tablet carousel - 2 items per slide, 2 dots
const TabletCarousel = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, align: "start" });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    onSelect();
  }, [emblaApi, onSelect]);

  const scrollTo = useCallback((index: number) => {
    if (emblaApi) emblaApi.scrollTo(index);
  }, [emblaApi]);

  // Group features into pairs for tablet
  const slides = [
    [features[0], features[1]],
    [features[2], features[3]],
  ];

  return (
    <div className="hidden md:block lg:hidden">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {slides.map((pair, slideIndex) => (
            <div key={slideIndex} className="flex-[0_0_100%] min-w-0 flex">
              {pair.map((feature, featureIndex) => (
                <div key={featureIndex} className="w-1/2">
                  <FormatFeature {...feature} />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* 2 dots for tablet */}
      <div className="flex justify-center gap-2 mt-6">
        {[0, 1].map((index) => (
          <button
            key={index}
            onClick={() => scrollTo(index)}
            className={`h-2.5 rounded-full transition-all duration-300 ${
              index === selectedIndex 
                ? "bg-gold w-6" 
                : "bg-sepia/30 hover:bg-sepia/50 w-2.5"
            }`}
            aria-label={`Перейти к слайду ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

const UniqueFormatSection = () => {
  return (
    <section id="format" className="py-6 md:py-8 px-6 bg-cream relative overflow-hidden">
      {/* Background image with super low opacity */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-[0.08] pointer-events-none"
        style={{ backgroundImage: `url(${formatBg})` }}
      />
      
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-8">
          <div className="section-divider" />
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-sepia mb-4">
            Уникальность формата
          </h2>
          <p className="font-body text-muted-foreground max-w-2xl mx-auto">
            Опыт, который невозможно воспроизвести в открытом доступе
          </p>
        </div>
        
        {/* Desktop: 4 columns grid */}
        <div className="hidden lg:grid grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <FormatFeature
              key={index}
              image={feature.image}
              title={feature.title}
              description={feature.description}
              scale={feature.scale}
            />
          ))}
        </div>

        {/* Mobile carousel - 4 slides */}
        <MobileCarousel />

        {/* Tablet carousel - 2 slides */}
        <TabletCarousel />
      </div>
    </section>
  );
};

export default UniqueFormatSection;
