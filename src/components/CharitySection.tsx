import { useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import charityLogo from "@/assets/charity-logo.webp";

interface CharitySectionProps {
  onContactClick: () => void;
}

const CharitySection = ({ onContactClick }: CharitySectionProps) => {
  const goal = 5000000;
  const [currentAmount, setCurrentAmount] = useState(0); // Will be fetched from API
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
        
        if (data?.success && typeof data?.amount === 'number') {
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


  return (
    <section id="charity" className="py-6 md:py-8 px-6 bg-navy text-cream">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-12">
          {/* Logo on the left */}
          <div className="flex-shrink-0">
            <img 
              src={charityLogo} 
              alt="Жизнь как чудо" 
              className="w-32 md:w-40 h-auto"
            />
          </div>
          
          {/* All text on the right */}
          <div className="flex-1 text-center md:text-left">
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl mb-6">
              Благотворительная миссия
            </h2>
            
            <p className="font-body text-cream/80 text-lg leading-relaxed mb-6">
              Проект носит исключительно благотворительный характер. Все средства от участия 
              направляются в фонд{" "}
              <a 
                href="https://kakchudo.ru" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gold font-medium hover:underline inline-flex items-center gap-1"
              >
                «Жизнь как чудо»
                <ExternalLink className="w-4 h-4" />
              </a>.
            </p>
            
            <p className="font-body text-cream/70 mb-8">
              Ваше участие — это возможность трансформировать интеллектуальный поиск 
              в реальную помощь детям с заболеваниями печени.
            </p>

            {/* Progress counter */}
            <div className="bg-cream/5 backdrop-blur-sm rounded-lg p-6 md:p-8 border border-cream/10">
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
          </div>
        </div>
      </div>
    </section>
  );
};

export default CharitySection;
