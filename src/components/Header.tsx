import { useState } from "react";
import { Home, Menu, X } from "lucide-react";

interface HeaderProps {
  onContactClick: () => void;
}

const Header = ({ onContactClick }: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { label: "О проекте", href: "#about" },
    { label: "Ключевые смыслы", href: "#insights" },
    { label: "Формат", href: "#format" },
    { label: "Благотворительность", href: "#charity" },
    { label: "Об авторе", href: "#author" },
  ];

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    element?.scrollIntoView({ behavior: 'smooth' });
    setIsMenuOpen(false);
  };

  const handleContactClick = () => {
    onContactClick();
    setIsMenuOpen(false);
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
              className="flex items-center text-cream hover:text-gold transition-colors"
              title="sergeichernenko.ru"
            >
              <Home className="w-5 h-5 md:w-6 md:h-6" />
            </a>

            {/* Desktop Navigation */}
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
              <li>
                <button
                  onClick={onContactClick}
                  className="font-body text-xs text-cream/80 hover:text-gold px-2 lg:px-3 py-2 transition-colors"
                >
                  Контакты
                </button>
              </li>
            </ul>

            {/* Mobile: Burger button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden flex items-center justify-center w-10 h-10 text-cream hover:text-gold transition-colors"
              aria-label={isMenuOpen ? "Закрыть меню" : "Открыть меню"}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </nav>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="md:hidden bg-navy/95 backdrop-blur-md border-t border-cream/10">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <ul className="flex flex-col gap-2">
              {navItems.map((item) => (
                <li key={item.href}>
                  <button
                    onClick={() => scrollToSection(item.href)}
                    className="w-full text-left font-body text-sm text-cream/90 hover:text-gold py-3 px-2 transition-colors border-b border-cream/10"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
              <li>
                <button
                  onClick={handleContactClick}
                  className="w-full text-left font-body text-sm text-cream/90 hover:text-gold py-3 px-2 transition-colors"
                >
                  Контакты
                </button>
              </li>
            </ul>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
