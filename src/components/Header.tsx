import { Home } from "lucide-react";

const Header = () => {
  const navItems = [
    { label: "О проекте", href: "#about" },
    { label: "Ключевые смыслы", href: "#insights" },
    { label: "Формат", href: "#format" },
    { label: "Благотворительность", href: "#charity" },
    { label: "Контакты", href: "#contact" },
  ];

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header className="absolute top-0 left-0 right-0 z-50">
      <div className="bg-navy/30 backdrop-blur-[2px]">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <nav className="flex items-center justify-between h-12 md:h-14">
            {/* Home link */}
            <a 
              href="https://sergeichernenko.ru/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-cream hover:text-gold transition-colors"
              title="sergeichernenko.ru"
            >
              <Home className="w-4 h-4 md:w-5 md:h-5" />
              <span className="hidden sm:inline font-body text-xs md:text-sm">sergeichernenko.ru</span>
            </a>

            {/* Navigation */}
            <ul className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <li key={item.href}>
                  <button
                    onClick={() => scrollToSection(item.href)}
                    className="font-body text-xs text-cream/80 hover:text-gold px-2 lg:px-3 py-2 transition-colors"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>

            {/* Mobile: simplified nav */}
            <div className="md:hidden flex items-center gap-4">
              <button
                onClick={() => scrollToSection('#about')}
                className="font-body text-xs text-cream/80 hover:text-gold"
              >
                О проекте
              </button>
              <button
                onClick={() => scrollToSection('#contact')}
                className="font-body text-xs text-cream/80 hover:text-gold"
              >
                Контакты
              </button>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
