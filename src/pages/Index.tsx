import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Sparkles, Zap, Shield, LayoutDashboard, Palette } from "lucide-react";
import { Link } from "react-router-dom";
import heroBeforeImage from "@/assets/hero-before.jpg";
import heroAfterImage from "@/assets/hero-after.jpg";
import { BeforeAfterSlider } from "@/components/before-after-slider";

const Index = () => {
  const features = [
    { icon: Sparkles, title: "Mejora facial con IA", description: "Algoritmos avanzados que realzan tus rasgos naturalmente" },
    { icon: Zap, title: "Procesamiento rápido", description: "Resultados profesionales en menos de 2 minutos" },
    { icon: Shield, title: "100% privado", description: "Tus fotos se procesan de forma segura y se eliminan después" },
  ];

  const demoHighlights = [
    {
      icon: LayoutDashboard,
      title: "Controles intuitivos",
      description: "Prueba los ajustes clave como iluminación y suavizado antes de subir tu foto real."
    },
    {
      icon: Palette,
      title: "Fondos profesionales",
      description: "Visualiza cómo cambia el resultado con distintos presets corporativos."
    },
    {
      icon: Sparkles,
      title: "Resultado instantáneo",
      description: "Comprueba el acabado final con un ejemplo generado por la IA."
    }
  ];

  const [showDemo, setShowDemo] = useState(false);

  return (
    <div className="min-h-screen">
      <section className="bg-[var(--gradient-hero)] py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
                Headshot Pro para
                <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent"> LinkedIn</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Transforma cualquier foto en un headshot profesional en minutos.
                IA avanzada que elimina fondos, mejora el rostro y aplica
                iluminación de estudio.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/studio">
                  <Button variant="hero" size="lg">
                    Comenzar gratis
                    <ArrowRight />
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setShowDemo((prev) => !prev)}
                  aria-pressed={showDemo}
                >
                  {showDemo ? "Ocultar demo" : "Ver demo"}
                </Button>
              </div>
            </div>
            <Card className="p-4 bg-card/80 backdrop-blur-sm shadow border-2 border-border">
              {showDemo ? (
                <div className="space-y-6">
                  <div>
                    <p className="text-xs font-semibold text-primary mb-3 uppercase tracking-wide text-center">
                      Demo interactiva
                    </p>
                    <BeforeAfterSlider
                      before={heroBeforeImage}
                      after={heroAfterImage}
                      beforeLabel="Antes"
                      afterLabel="Después"
                    />
                  </div>
                  <div className="grid gap-4 md:grid-cols-3">
                    {demoHighlights.map((item) => (
                      <div key={item.title} className="rounded-lg bg-secondary/50 p-4 text-secondary-foreground">
                        <item.icon className="mb-3 h-6 w-6 text-primary" />
                        <h4 className="font-semibold text-sm mb-1">{item.title}</h4>
                        <p className="text-xs text-muted-foreground">{item.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Antes</p>
                    <img src={heroBeforeImage} alt="Before" className="w-full rounded-lg shadow-md" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-primary mb-2 uppercase tracking-wide">Después</p>
                    <img src={heroAfterImage} alt="After" className="w-full rounded-lg shadow-md ring-2 ring-primary/20" />
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
