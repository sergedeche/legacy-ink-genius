import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="py-12 px-6 bg-sepia text-cream/60">
      <div className="max-w-4xl mx-auto text-center">
        <p className="font-display text-2xl text-cream mb-4">
          Стратегия Наследия
        </p>
        
        <div className="section-divider opacity-30" />
        
        <p className="font-body text-sm mb-2">
          Все средства направляются в благотворительный фонд «Жизнь как чудо».
        </p>
        
        <div className="flex items-center justify-center gap-4 mb-4">
          <Link 
            to="/rules" 
            className="font-body text-sm text-cream/60 hover:text-gold transition-colors underline underline-offset-2"
          >
            Правила участия
          </Link>
          <span className="text-cream/30">•</span>
          <a 
            href="https://t.me/corphacker?direct" 
            target="_blank" 
            rel="noopener noreferrer"
            className="font-body text-sm text-cream/60 hover:text-gold transition-colors underline underline-offset-2"
          >
            Связаться с организатором
          </a>
        </div>
        
        <p className="font-body text-xs text-cream/40">
          © {new Date().getFullYear()} Все права защищены
        </p>
      </div>
    </footer>
  );
};

export default Footer;
