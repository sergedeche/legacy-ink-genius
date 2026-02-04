import { useState } from "react";
import { toast } from "sonner";

const ContactSection = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast.success("Заявка отправлена", {
      description: "Мы свяжемся с вами в ближайшее время",
    });
    
    setFormData({ name: '', email: '', phone: '', message: '' });
    setIsSubmitting(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <section id="contact" className="py-8 md:py-10 px-6 bg-cream-dark">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <div className="section-divider" />
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-sepia mb-4">
            Оставить заявку
          </h2>
          <p className="font-body text-muted-foreground">
            Заполните форму, и мы свяжемся с вами для обсуждения деталей участия
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block font-body text-sm text-sepia mb-2">
              Имя *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-cream border border-border rounded font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition-all"
              placeholder="Ваше имя"
            />
          </div>
          
          <div>
            <label htmlFor="email" className="block font-body text-sm text-sepia mb-2">
              Email *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-cream border border-border rounded font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition-all"
              placeholder="email@example.com"
            />
          </div>
          
          <div>
            <label htmlFor="phone" className="block font-body text-sm text-sepia mb-2">
              Телефон
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-cream border border-border rounded font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition-all"
              placeholder="+7 (___) ___-__-__"
            />
          </div>
          
          <div>
            <label htmlFor="message" className="block font-body text-sm text-sepia mb-2">
              Сообщение
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-3 bg-cream border border-border rounded font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition-all resize-none"
              placeholder="Ваш вопрос или комментарий"
            />
          </div>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full btn-primary-heritage disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Отправка...' : 'Отправить заявку'}
          </button>
        </form>
      </div>
    </section>
  );
};

export default ContactSection;
