import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const CharitySection = () => {
  const goal = 5000000;
  const [currentAmount, setCurrentAmount] = useState(4432610); // Fallback value
  const [displayAmount, setDisplayAmount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  // Fetch real donation amount from estafeta.ru
  useEffect(() => {
    const fetchDonationAmount = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('fetch-donation-amount');
        
        if (error) {
          console.error('Error fetching donation amount:', error);
          return;
        }
        
        if (data?.success && data?.amount) {
          setCurrentAmount(data.amount);
        }
      } catch (err) {
        console.error('Failed to fetch donation amount:', err);
      }
    };

    fetchDonationAmount();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    const section = document.getElementById('charity');
    if (section) observer.observe(section);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (isVisible && displayAmount < currentAmount) {
      const increment = currentAmount / 60;
      const timer = setInterval(() => {
        setDisplayAmount(prev => {
          const next = prev + increment;
          if (next >= currentAmount) {
            clearInterval(timer);
            return currentAmount;
          }
          return next;
        });
      }, 30);
      return () => clearInterval(timer);
    }
  }, [isVisible, currentAmount]);

  const percentage = (currentAmount / goal) * 100;
  const formatNumber = (num: number) => {
    return Math.floor(num).toLocaleString('ru-RU');
  };

  const scrollToContact = () => {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="charity" className="py-12 md:py-16 px-6 bg-navy text-cream">
      <div className="max-w-4xl mx-auto text-center">
        <div className="flex justify-center mb-6">
          <Heart className="w-12 h-12 text-gold animate-pulse" />
        </div>
        
        <h2 className="font-display text-3xl md:text-4xl lg:text-5xl mb-6">
          Благотворительная миссия
        </h2>
        
        <p className="font-body text-cream/80 text-lg leading-relaxed mb-8 max-w-2xl mx-auto">
          Проект носит исключительно благотворительный характер. Все средства от участия 
          направляются в фонд <span className="text-gold font-medium">«Жизнь как чудо»</span>.
        </p>
        
        <p className="font-body text-cream/70 mb-12">
          Ваше участие — это возможность трансформировать интеллектуальный поиск 
          в реальную помощь детям с заболеваниями печени.
        </p>

        {/* Progress counter */}
        <div className="bg-cream/5 backdrop-blur-sm rounded-lg p-8 mb-8 border border-cream/10">
          <p className="font-display text-xl text-cream/60 mb-2">
            Собрано
          </p>
          
          <div className="font-display text-4xl md:text-5xl lg:text-6xl text-gold mb-4">
            {formatNumber(displayAmount)} ₽
          </div>
          
          <p className="font-body text-cream/50 mb-6">
            из {formatNumber(goal)} ₽
          </p>

          {/* Progress bar */}
          <div className="h-3 bg-cream/10 rounded-full overflow-hidden">
            <div 
              className="h-full gradient-gold rounded-full transition-all duration-1000 ease-out"
              style={{ width: isVisible ? `${percentage}%` : '0%' }}
            />
          </div>
          
          <p className="font-body text-sm text-cream/40 mt-4">
            Цель на текущий год
          </p>
        </div>

        <button 
          onClick={scrollToContact}
          className="btn-primary-heritage"
        >
          Оставить заявку
        </button>
      </div>
    </section>
  );
};

export default CharitySection;
