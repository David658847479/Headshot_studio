import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface HealthResponse {
  ok: boolean;
  missing?: string[];
}

type Status = "checking" | "ok" | "error";

export const ApiStatusBanner = () => {
  const [status, setStatus] = useState<Status>("checking");
  const [missing, setMissing] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const runHealthCheck = async () => {
      try {
        const { data, error: invokeError } = await supabase.functions.invoke<HealthResponse>("process-headshot", {
          body: { healthCheck: true }
        });

        if (invokeError) {
          setStatus("error");
          setError(invokeError.message || "No se pudo comprobar el estado de las APIs");
          return;
        }

        if (!data?.ok) {
          setStatus("error");
          setMissing(Array.isArray(data?.missing) ? data.missing : []);
          setError("Faltan credenciales para completar la configuración");
          return;
        }

        setStatus("ok");
      } catch (err) {
        setStatus("error");
        setError(err instanceof Error ? err.message : "No se pudo comprobar el estado de las APIs");
      }
    };

    runHealthCheck();
  }, []);

  if (status === "checking") {
    return (
      <div className="mb-8 flex items-center gap-3 rounded-xl border border-border bg-secondary/40 px-4 py-3 text-secondary-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <p className="text-sm font-medium">Comprobando el estado de Supabase y Lovable...</p>
      </div>
    );
  }

  if (status === "ok") {
    return (
      <div className="mb-8 flex items-center gap-3 rounded-xl border border-primary/40 bg-primary/10 px-4 py-3 text-primary">
        <CheckCircle2 className="h-5 w-5" />
        <p className="text-sm font-semibold">APIs configuradas correctamente. ¡Ya puedes generar headshots sin problemas!</p>
      </div>
    );
  }

  return (
    <div className="mb-8 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-4 text-destructive">
      <div className="flex items-center gap-3">
        <AlertTriangle className="h-5 w-5" />
        <p className="text-sm font-semibold">No pudimos validar todas las APIs necesarias.</p>
      </div>
      {missing.length > 0 && (
        <ul className="mt-3 list-disc space-y-1 pl-6 text-sm">
          {missing.map((item) => (
            <li key={item}>Configura la variable <span className="font-mono">{item}</span> en Supabase.</li>
          ))}
        </ul>
      )}
      {error && <p className="mt-3 text-sm">{error}</p>}
      <p className="mt-3 text-xs text-foreground/70">
        Ejecuta <code className="rounded bg-background/60 px-1 py-0.5">supabase functions deploy process-headshot</code> y define el secreto
        con <code className="rounded bg-background/60 px-1 py-0.5">supabase secrets set LOVABLE_API_KEY=\"tu_clave\"</code> si aún no lo has hecho.
      </p>
    </div>
  );
};

export default ApiStatusBanner;
