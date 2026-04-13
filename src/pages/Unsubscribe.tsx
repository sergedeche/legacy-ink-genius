import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const Unsubscribe = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "valid" | "already" | "error" | "success">("loading");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      return;
    }

    const validate = async () => {
      try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
        const res = await fetch(
          `${supabaseUrl}/functions/v1/handle-email-unsubscribe?token=${token}`,
          { headers: { apikey: anonKey } }
        );
        const data = await res.json();
        if (data.valid === false && data.reason === "already_unsubscribed") {
          setStatus("already");
        } else if (data.valid) {
          setStatus("valid");
        } else {
          setStatus("error");
        }
      } catch {
        setStatus("error");
      }
    };
    validate();
  }, [token]);

  const handleUnsubscribe = async () => {
    try {
      const { data } = await supabase.functions.invoke("handle-email-unsubscribe", {
        body: { token },
      });
      if (data?.success) {
        setStatus("success");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        {status === "loading" && <p className="text-muted-foreground">Загрузка...</p>}

        {status === "valid" && (
          <>
            <h1 className="text-2xl font-serif text-foreground">Отписка от рассылки</h1>
            <p className="text-muted-foreground">Вы уверены, что хотите отписаться от уведомлений?</p>
            <button
              onClick={handleUnsubscribe}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition"
            >
              Подтвердить отписку
            </button>
          </>
        )}

        {status === "already" && (
          <>
            <h1 className="text-2xl font-serif text-foreground">Вы уже отписаны</h1>
            <p className="text-muted-foreground">Этот адрес уже был отписан от уведомлений.</p>
          </>
        )}

        {status === "success" && (
          <>
            <h1 className="text-2xl font-serif text-foreground">Готово!</h1>
            <p className="text-muted-foreground">Вы успешно отписались от уведомлений.</p>
          </>
        )}

        {status === "error" && (
          <>
            <h1 className="text-2xl font-serif text-foreground">Ошибка</h1>
            <p className="text-muted-foreground">Ссылка недействительна или устарела.</p>
          </>
        )}
      </div>
    </div>
  );
};

export default Unsubscribe;
