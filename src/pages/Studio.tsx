import { useState } from "react";
import { Upload, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { useImageProcessor } from "@/hooks/useImageProcessor";
import ApiStatusBanner from "@/components/api-status-banner";

const Studio = () => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [backgroundPreset, setBackgroundPreset] = useState("neutral");
  const [relightIntensity, setRelightIntensity] = useState([50]);
  const [skinSmoothing, setSkinSmoothing] = useState([10]);
  const [exportFormat, setExportFormat] = useState<"4:5" | "1:1">("4:5");
  const [facialExpression, setFacialExpression] = useState<"serious" | "smiling">("serious");
  const [suitColor, setSuitColor] = useState("");
  const [tieColor, setTieColor] = useState("");
  const [faceIndex, setFaceIndex] = useState(0);
  
  const { processImage, isProcessing, progress } = useImageProcessor();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Por favor, sube una imagen válida");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadedImage(event.target?.result as string);
      toast.success("Imagen cargada correctamente");
    };
    reader.readAsDataURL(file);
  };

  const handleProcess = async () => {
    if (!uploadedImage) {
      toast.error("Por favor, sube una imagen primero");
      return;
    }

    try {
      const result = await processImage(uploadedImage, {
        backgroundPreset,
        relightIntensity: relightIntensity[0],
        skinSmoothing: skinSmoothing[0],
        exportFormat,
        facialExpression,
        suitColor: suitColor.trim() || undefined,
        tieColor: tieColor.trim() || undefined,
        faceIndex
      });
      setProcessedImage(result);
      toast.success("✨ Headshot profesional creado con IA de última generación");
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = error instanceof Error ? error.message : "Error al procesar la imagen";
      
      if (errorMessage.includes("CREDITS_EXHAUSTED")) {
        toast.error("Se han agotado los créditos de IA. Por favor, agrega créditos en Settings → Workspace → Usage para continuar.", {
          duration: 8000,
        });
      } else if (errorMessage.includes("RATE_LIMITED")) {
        toast.error("Has alcanzado el límite de solicitudes. Por favor, espera unos minutos antes de intentar nuevamente.", {
          duration: 6000,
        });
      } else {
        toast.error(errorMessage);
      }
    }
  };

  const handleDownload = () => {
    if (!processedImage) return;
    
    const link = document.createElement("a");
    link.href = processedImage;
    link.download = `headshot-pro-${exportFormat}.jpg`;
    link.click();
    toast.success("Descarga iniciada");
  };

  return (
    <div className="min-h-screen bg-[var(--gradient-hero)]">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-foreground mb-3">
            Headshot Studio
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Transforma tu foto en un headshot profesional con IA en segundos
          </p>
        </div>

        <ApiStatusBanner />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr,380px] gap-8 max-w-7xl mx-auto">
          <div className="space-y-6">
            {!uploadedImage ? (
              <Card className="p-12 bg-card backdrop-blur-sm border-2 border-dashed border-border hover:border-primary transition-all duration-300 shadow">
                <label className="cursor-pointer block">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <div className="flex flex-col items-center justify-center py-16">
                    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                      <Upload className="w-10 h-10 text-primary" />
                    </div>
                    <h3 className="text-2xl font-semibold mb-3 text-foreground">
                      Sube tu foto
                    </h3>
                    <p className="text-muted-foreground mb-2 text-center">
                      Arrastra tu imagen aquí o haz click para seleccionar
                    </p>
                    <p className="text-sm text-muted-foreground/70">
                      JPG, PNG o WEBP • Mínimo 512px
                    </p>
                  </div>
                </label>
              </Card>
            ) : (
              <>
                <Card className="p-6 bg-card backdrop-blur-sm shadow">
                  <div className="flex items-center gap-4 mb-4 pb-4 border-b border-border">
                    <img
                      src={uploadedImage}
                      alt="Original"
                      className="w-20 h-20 rounded-lg shadow-sm border border-border object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-foreground mb-1">
                        Foto original
                      </h3>
                      <Button
                        onClick={() => {
                          setUploadedImage(null);
                          setProcessedImage(null);
                        }}
                        variant="ghost"
                        size="sm"
                        className="h-8 px-3 text-xs"
                      >
                        Cambiar imagen
                      </Button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                      Resultado Profesional
                    </h3>
                    {processedImage ? (
                      <img
                        src={processedImage}
                        alt="Processed"
                        className="w-full rounded-xl shadow border border-border"
                      />
                    ) : (
                      <div className="w-full aspect-[4/5] bg-muted rounded-xl flex items-center justify-center border border-dashed border-border">
                        <div className="text-center">
                          <p className="text-muted-foreground text-sm mb-2">
                            Tu headshot aparecerá aquí
                          </p>
                          <p className="text-muted-foreground/70 text-xs">
                            Ajusta las opciones y presiona "Crear Headshot"
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>

                {isProcessing && (
                  <Card className="p-6 bg-accent/50 backdrop-blur-sm shadow">
                    <div className="space-y-3">
                      <Progress value={progress} className="h-2" />
                      <p className="text-sm text-accent-foreground text-center font-semibold">
                        {progress}% completado
                      </p>
                    </div>
                  </Card>
                )}

                {processedImage && (
                  <Button
                    onClick={handleDownload}
                    variant="outline"
                    size="lg"
                    className="w-full h-12 font-semibold border-2"
                  >
                    <Download className="mr-2" />
                    Descargar Resultado
                  </Button>
                )}
              </>
            )}
          </div>

          <div className="space-y-6">
            <Card className="p-6 bg-card backdrop-blur-sm shadow sticky top-6">
              <h3 className="text-xl font-bold mb-6 text-foreground">Personalización</h3>

              <div className="mb-8">
                <Label className="text-sm font-semibold mb-3 block text-foreground">
                  Expresión facial
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setFacialExpression("serious")}
                    className={`px-4 py-4 rounded-xl font-semibold transition-all ${facialExpression === "serious"
                      ? "bg-primary text-primary-foreground shadow"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                      }`}
                  >
                    😐 Serio
                  </button>
                  <button
                    onClick={() => setFacialExpression("smiling")}
                    className={`px-4 py-4 rounded-xl font-semibold transition-all ${facialExpression === "smiling"
                      ? "bg-primary text-primary-foreground shadow"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                      }`}
                  >
                    😊 Sonriente
                  </button>
                </div>
              </div>

              <div className="mb-8">
                <Label className="text-sm font-semibold mb-3 block text-foreground">
                  Fondo profesional
                </Label>
                <div className="space-y-3">
                  {[
                    { value: "neutral", label: "Neutral Gray", emoji: "⚪" },
                    { value: "corporate", label: "Corporate Blue", emoji: "🔵" },
                    { value: "office", label: "Oficina", emoji: "🏢" },
                  ].map((preset) => (
                    <button
                      key={preset.value}
                      onClick={() => setBackgroundPreset(preset.value)}
                      className={`w-full px-4 py-4 rounded-xl text-left font-semibold transition-all flex items-center gap-3 ${backgroundPreset === preset.value
                        ? "bg-primary text-primary-foreground shadow"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                        }`}
                    >
                      <span className="text-xl">{preset.emoji}</span>
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-8 space-y-4">
                <div>
                  <Label className="text-sm font-semibold mb-2 block text-foreground">
                    Color del traje (opcional)
                  </Label>
                  <input
                    type="text"
                    value={suitColor}
                    onChange={(event) => setSuitColor(event.target.value)}
                    placeholder="Ej. navy, charcoal gray"
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <Label className="text-sm font-semibold mb-2 block text-foreground">
                    Color de la corbata (opcional)
                  </Label>
                  <input
                    type="text"
                    value={tieColor}
                    onChange={(event) => setTieColor(event.target.value)}
                    placeholder="Ej. burgundy, striped blue"
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <Label className="text-sm font-semibold mb-2 block text-foreground">
                    Índice de rostro (para fotos grupales)
                  </Label>
                  <input
                    type="number"
                    min={0}
                    max={5}
                    value={faceIndex}
                    onChange={(event) => {
                      const value = Number(event.target.value);
                      if (Number.isNaN(value)) {
                        setFaceIndex(0);
                        return;
                      }
                      setFaceIndex(Math.max(0, Math.min(5, Math.floor(value))));
                    }}
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <p className="mt-2 text-xs text-muted-foreground">
                    Si la foto tiene varias personas, indica qué rostro debe priorizar la IA (0 es el primero).
                  </p>
                </div>
              </div>

              <div className="mb-8">
                <Label className="text-sm font-semibold mb-3 block text-foreground">
                  Intensidad de iluminación
                  <span className="ml-2 text-primary font-bold">{relightIntensity[0]}%</span>
                </Label>
                <Slider
                  value={relightIntensity}
                  onValueChange={setRelightIntensity}
                  max={100}
                  step={5}
                  className="w-full"
                />
              </div>

              <div className="mb-8">
                <Label className="text-sm font-semibold mb-3 block text-foreground">
                  Suavizado de piel
                  <span className="ml-2 text-primary font-bold">{skinSmoothing[0]}</span>
                </Label>
                <Slider
                  value={skinSmoothing}
                  onValueChange={setSkinSmoothing}
                  max={20}
                  step={1}
                  className="w-full"
                />
              </div>

              <div className="mb-8">
                <Label className="text-sm font-semibold mb-3 block text-foreground">
                  Formato de exportación
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setExportFormat("4:5")}
                    className={`px-4 py-4 rounded-xl font-semibold transition-all ${exportFormat === "4:5"
                      ? "bg-primary text-primary-foreground shadow"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                      }`}
                  >
                    4:5
                  </button>
                  <button
                    onClick={() => setExportFormat("1:1")}
                    className={`px-4 py-4 rounded-xl font-semibold transition-all ${exportFormat === "1:1"
                      ? "bg-primary text-primary-foreground shadow"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                      }`}
                  >
                    1:1
                  </button>
                </div>
              </div>

              <div>
                <Button
                  onClick={handleProcess}
                  disabled={!uploadedImage || isProcessing}
                  className="w-full h-14 text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow transition-all"
                  size="lg"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="animate-spin mr-2" />
                      Procesando con IA...
                    </>
                  ) : (
                    "✨ Crear Headshot"
                  )}
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Studio;
