import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ProcessingOptions {
  backgroundPreset: string;
  relightIntensity: number;
  skinSmoothing: number;
  exportFormat: '4:5' | '1:1';
  facialExpression: 'serious' | 'smiling';
  suitColor?: string;
  tieColor?: string;
  faceIndex?: number;
}

export const useImageProcessor = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const cropToRatio = (imageDataUrl: string, ratio: '4:5' | '1:1'): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        const targetRatio = ratio === '4:5' ? 4 / 5 : 1;
        const currentRatio = img.width / img.height;
        let sx = 0, sy = 0, sw = img.width, sh = img.height;
        if (currentRatio > targetRatio) {
          sw = img.height * targetRatio;
          sx = (img.width - sw) / 2;
        } else if (currentRatio < targetRatio) {
          sh = img.width / targetRatio;
          sy = (img.height - sh) / 2;
        }
        canvas.width = 1080;
        canvas.height = ratio === '4:5' ? 1350 : 1080;
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.95));
      };
      img.src = imageDataUrl;
    });
  };

  const processImage = async (imageUrl: string, options: ProcessingOptions): Promise<string> => {
    setIsProcessing(true);
    setProgress(10);

    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });

      setProgress(30);

      const { data, error } = await supabase.functions.invoke('process-headshot', {
        body: {
          imageBase64: base64,
          backgroundPreset: options.backgroundPreset,
          relightIntensity: options.relightIntensity,
          skinSmoothing: options.skinSmoothing,
          facialExpression: options.facialExpression,
          suitColor: options.suitColor,
          tieColor: options.tieColor,
          faceIndex: options.faceIndex,
        }
      });

      if (error) {
        if (error.message?.includes('Function not found')) {
          throw new Error('La función edge process-headshot no está desplegada en Supabase. Ejecuta "supabase functions deploy process-headshot".');
        }

        throw new Error(error.message || 'Failed to process image');
      }
      if (data && typeof data === 'object' && 'error' in data && data.error) {
        const message = typeof data.error === 'string' ? data.error : 'Error al procesar la imagen';
        throw new Error(message);
      }

      if (!data?.processedImage) throw new Error('No processed image returned');

      setProgress(80);
      const croppedImage = await cropToRatio(data.processedImage, options.exportFormat);
      setProgress(100);
      return croppedImage;
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  return { processImage, isProcessing, progress };
};
