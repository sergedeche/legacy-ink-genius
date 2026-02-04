import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import formatIconTouch from "@/assets/format-icon-touch-transparent.png";
import formatIconClosed from "@/assets/format-icon-closed-transparent.png";
import formatIconLimited from "@/assets/format-icon-limited-transparent.png";
import formatIconTea from "@/assets/format-icon-tea.png";

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

const UniqueFormatSection = () => {
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

  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: false,
    align: "start",
  });
  
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on("select", onSelect);
    onSelect();
  }, [emblaApi, onSelect]);

  const scrollTo = useCallback((index: number) => {
    if (emblaApi) emblaApi.scrollTo(index);
  }, [emblaApi]);

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

        {/* Tablet & Mobile: Carousel */}
        <div className="lg:hidden">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex">
              {/* Mobile: 1 item per slide */}
              <div className="flex-[0_0_100%] min-w-0 md:hidden">
                <FormatFeature {...features[0]} />
              </div>
              <div className="flex-[0_0_100%] min-w-0 md:hidden">
                <FormatFeature {...features[1]} />
              </div>
              <div className="flex-[0_0_100%] min-w-0 md:hidden">
                <FormatFeature {...features[2]} />
              </div>
              <div className="flex-[0_0_100%] min-w-0 md:hidden">
                <FormatFeature {...features[3]} />
              </div>

              {/* Tablet: 2 items per slide */}
              <div className="hidden md:flex flex-[0_0_100%] min-w-0 lg:hidden">
                <div className="w-1/2">
                  <FormatFeature {...features[0]} />
                </div>
                <div className="w-1/2">
                  <FormatFeature {...features[1]} />
                </div>
              </div>
              <div className="hidden md:flex flex-[0_0_100%] min-w-0 lg:hidden">
                <div className="w-1/2">
                  <FormatFeature {...features[2]} />
                </div>
                <div className="w-1/2">
                  <FormatFeature {...features[3]} />
                </div>
              </div>
            </div>
          </div>

          {/* Dots indicator */}
          <div className="flex justify-center gap-2 mt-6">
            {scrollSnaps.map((_, index) => (
              <button
                key={index}
                onClick={() => scrollTo(index)}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  index === selectedIndex 
                    ? "bg-gold w-6" 
                    : "bg-sepia/30 hover:bg-sepia/50"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default UniqueFormatSection;
