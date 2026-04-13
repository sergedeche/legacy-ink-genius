import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const Rules = () => {
  return (
    <main className="min-h-screen" style={{ backgroundColor: 'hsl(25 20% 10%)' }}>
      <div className="container mx-auto px-4 md:px-8 py-12 md:py-20">
        {/* Back link */}
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 hover:opacity-80 transition-opacity mb-8"
          style={{ color: 'hsl(38 70% 50%)' }}
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="font-display text-sm tracking-wide">Вернуться на главную</span>
        </Link>

        {/* Content */}
        <article className="max-w-3xl mx-auto">
          <h1 className="font-display text-3xl md:text-4xl lg:text-5xl tracking-wide mb-4" style={{ color: 'hsl(38 70% 50%)' }}>
            Правила участия в интеллектуальном экскурсе
          </h1>
          
          <h2 className="font-display text-xl md:text-2xl mb-8" style={{ color: 'hsl(35 25% 95%)' }}>
            «Стратегия наследия»
          </h2>

          <div className="prose max-w-none space-y-8 font-body" style={{ color: 'hsl(35 20% 75%)' }}>
            <p className="text-base md:text-lg leading-relaxed">
              Интеллектуальный экскурс «Стратегия наследия» является авторским некоммерческим мероприятием, 
              проводимым в формате личной инициативы автора.
            </p>

            {/* Section 1 */}
            <section>
              <h3 className="font-display text-lg md:text-xl text-gold mb-4">1. Общие положения</h3>
              <p className="leading-relaxed">
                Участие в мероприятии предоставляется бесплатно и не является платной услугой, 
                образовательной программой или коммерческим продуктом.
              </p>
              <p className="leading-relaxed mt-3">
                Билеты на мероприятие предоставляются исключительно в знак благодарности лицам, 
                которые добровольно сделали пожертвование в благотворительный фонд «Жизнь как чудо».
              </p>
            </section>

            {/* Section 2 */}
            <section>
              <h3 className="font-display text-lg md:text-xl text-gold mb-4">2. О пожертвовании</h3>
              <p className="leading-relaxed mb-3">Пожертвование:</p>
              <ul className="list-disc list-inside space-y-2 pl-4">
                <li>носит добровольный и безвозмездный характер;</li>
                <li>направляется напрямую в благотворительный фонд «Жизнь как чудо»;</li>
                <li>не является оплатой участия, билета или услуги;</li>
                <li>возврату не подлежит в соответствии с правилами фонда и законодательством Российской Федерации.</li>
              </ul>
              <p className="leading-relaxed mt-4">
                Рекомендуемый размер пожертвования для одного участника составляет 25 000 (двадцать пять тысяч) рублей.
              </p>
              <p className="leading-relaxed mt-3">
                Факт пожертвования подтверждается автоматически на сайте и используется исключительно 
                для предоставления билета на мероприятие.
              </p>
            </section>

            {/* Section 3 */}
            <section>
              <h3 className="font-display text-lg md:text-xl text-gold mb-4">3. Предоставление билета</h3>
              <p className="leading-relaxed mb-3">Билет на мероприятие предоставляется:</p>
              <ul className="list-disc list-inside space-y-2 pl-4">
                <li>бесплатно;</li>
                <li>в ограниченном количестве;</li>
                <li>исключительно лицам, подтвердившим факт пожертвования в установленном размере.</li>
              </ul>
              <p className="leading-relaxed mt-4">
                Передача билета третьим лицам возможна только по предварительному согласованию с автором мероприятия.
              </p>
            </section>

            {/* Section 4 */}
            <section>
              <h3 className="font-display text-lg md:text-xl text-gold mb-4">4. Изменения, переносы и отмены</h3>
              <p className="leading-relaxed">
                В случае изменения даты, времени проведения или иных организационных условий мероприятия 
                актуальная информация публикуется исключительно в официальном Telegram-канале мероприятия.
              </p>
              <p className="leading-relaxed mt-3">
                Прямой сбор контактных данных участников на сайте не осуществляется, в связи с чем подписка 
                на Telegram-канал является рекомендуемым и основным способом получения информации.
              </p>
            </section>

            {/* Section 5 */}
            <section>
              <h3 className="font-display text-lg md:text-xl text-gold mb-4">5. Невозможность участия</h3>
              <p className="leading-relaxed mb-3">
                Если участник по личным причинам не может присутствовать на мероприятии:
              </p>
              <ul className="list-disc list-inside space-y-2 pl-4">
                <li>пожертвование не подлежит возврату;</li>
                <li>возможность переноса участия или иные варианты обсуждаются индивидуально и напрямую с автором мероприятия.</li>
              </ul>
              <p className="leading-relaxed mt-4">
                Мы всегда стремимся идти навстречу нашим участникам и меценатам в разумных и возможных рамках.
              </p>
            </section>

            {/* Section 6 */}
            <section>
              <h3 className="font-display text-lg md:text-xl text-gold mb-4">6. Связь и вопросы</h3>
              <p className="leading-relaxed">
                Все вопросы, связанные с участием, можно задать через официальный Telegram-канал мероприятия, 
                а также в личных сообщениях автору, контакты которого указаны в канале.
              </p>
            </section>

            {/* Section 7 */}
            <section>
              <h3 className="font-display text-lg md:text-xl text-gold mb-4">7. Персональные данные</h3>
              <p className="leading-relaxed">
                Сайт мероприятия не осуществляет сбор, хранение или обработку персональных данных пользователей.
              </p>
            </section>
          </div>
        </article>
      </div>
    </main>
  );
};

export default Rules;
