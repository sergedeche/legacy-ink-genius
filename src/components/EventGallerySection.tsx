import { useEffect, useState } from "react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "@/components/ui/carousel";
import img1 from "@/assets/event/event-01.jpeg";
import img2 from "@/assets/event/event-02.jpeg";
import img3 from "@/assets/event/event-03.jpeg";
import img4 from "@/assets/event/event-04.jpeg";
import img5 from "@/assets/event/event-05.jpeg";
import img6 from "@/assets/event/event-06.jpeg";
import img7 from "@/assets/event/event-07.jpeg";
import img8 from "@/assets/event/event-08.jpeg";
import img9 from "@/assets/event/event-09.jpeg";
import img10 from "@/assets/event/event-10.jpeg";
import img11 from "@/assets/event/event-11.jpeg";
import img12 from "@/assets/event/event-12.jpeg";
import img13 from "@/assets/event/event-13.jpeg";
import img14 from "@/assets/event/event-14.jpeg";
import img15 from "@/assets/event/event-15.jpeg";
import img16 from "@/assets/event/event-16.jpeg";

const photos = [
  { src: img4, alt: "Сергей Чернеко на встрече «Стратегия Наследия»" },
  { src: img10, alt: "Гости за круглым столом с редкими изданиями" },
  { src: img5, alt: "Гости рассматривают редкие книги в белых перчатках" },
  { src: img16, alt: "Сергей Чернеко представляет редкое издание «Стратегия Наследия»" },
  { src: img11, alt: "Семья изучает иллюминированную рукопись" },
  { src: img9, alt: "Организаторы встречи в SAVVA Метрополь" },
  { src: img13, alt: "Гости вечера в SAVVA Метрополь" },
  { src: img6, alt: "Книга с автографом Сергея Довлатова" },
  { src: img15, alt: "Авторская подача — пельмени с крабом от шефа" },
  { src: img12, alt: "Прижизненное издание сочинений М. В. Ломоносова" },
  { src: img3, alt: "Сервировка стола — Культура Дома" },
  { src: img1, alt: "Фарфоровые чашки с поэтическими надписями" },
  { src: img14, alt: "Гости изучают старинный журнал «Кулинар»" },
  { src: img8, alt: "Архивный экземпляр «Меценаты Российской державы»" },
  { src: img7, alt: "Перчатки SAVVA для работы с редкими изданиями" },
  { src: img2, alt: "Открытка гостиницы «Метрополь»" },
];

const EventGallerySection = () => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap());
    api.on("select", () => setCurrent(api.selectedScrollSnap()));
  }, [api]);

  return (
    <section id="gallery" className="py-20 md:py-32" style={{ backgroundColor: "hsl(215 30% 18%)" }}>
      <div className="container mx-auto px-4 md:px-8">
        <div className="text-center mb-12 md:mb-16">
          <h2
            className="font-display text-4xl md:text-6xl lg:text-7xl tracking-[0.2em] uppercase mb-6"
            style={{ color: "hsl(38 70% 50%)" }}
          >
            Атмосфера встреч
          </h2>
          <div
            className="w-24 h-px mx-auto"
            style={{ background: "linear-gradient(90deg, transparent, hsl(38 70% 50%), transparent)" }}
          />
          <p className="mt-6 font-body text-sm md:text-base max-w-xl mx-auto" style={{ color: "hsl(35 20% 70%)" }}>
            Несколько кадров с прошедших мероприятий — книги, разговоры и детали вечера.
          </p>
        </div>

        {/* Mobile carousel */}
        <div className="md:hidden">
          <Carousel setApi={setApi} opts={{ loop: true, align: "center" }}>
            <CarouselContent>
              {photos.map((p, i) => (
                <CarouselItem key={i} className="basis-[85%]">
                  <div
                    className="overflow-hidden rounded-2xl aspect-[3/4]"
                    style={{ border: "1px solid hsl(35 20% 25%)" }}
                  >
                    <img
                      src={p.src}
                      alt={p.alt}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
          <div className="flex justify-center gap-1.5 mt-5">
            {photos.map((_, i) => (
              <button
                key={i}
                aria-label={`Слайд ${i + 1}`}
                onClick={() => api?.scrollTo(i)}
                className="h-1.5 rounded-full transition-all"
                style={{
                  width: current === i ? 20 : 6,
                  backgroundColor: current === i ? "hsl(38 70% 50%)" : "hsl(35 20% 35%)",
                }}
              />
            ))}
          </div>
        </div>

        {/* Desktop masonry — true CSS columns, no cropping */}
        <div className="hidden md:block max-w-6xl mx-auto columns-3 lg:columns-4 gap-4 [column-fill:_balance]">
          {photos.map((p, i) => (
            <div
              key={i}
              className="mb-4 break-inside-avoid overflow-hidden rounded-2xl group"
              style={{ border: "1px solid hsl(35 20% 25%)" }}
            >
              <img
                src={p.src}
                alt={p.alt}
                loading="lazy"
                className="w-full h-auto block transition-transform duration-700 group-hover:scale-[1.03]"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default EventGallerySection;
