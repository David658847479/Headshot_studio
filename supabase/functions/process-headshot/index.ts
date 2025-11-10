import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }

  try {
    const payload = await req.json().catch(() => null);
    if (!payload || typeof payload !== 'object') {
      return new Response(JSON.stringify({ error: "Invalid JSON payload" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const { healthCheck = false } = payload as { healthCheck?: boolean };
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (healthCheck) {
      const missing: string[] = [];
      if (!LOVABLE_API_KEY) missing.push("LOVABLE_API_KEY");

      return new Response(
        JSON.stringify({ ok: missing.length === 0, missing }),
        {
          status: missing.length === 0 ? 200 : 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    const {
      imageBase64,
      backgroundPreset = "neutral",
      relightIntensity = 60,
      skinSmoothing = 10,
      facialExpression = 'serious',
      suitColor,
      tieColor,
      faceIndex = 0
    } = payload as Record<string, unknown>;

    if (!imageBase64 || typeof imageBase64 !== "string") {
      return new Response(JSON.stringify({ error: "imageBase64 is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const base64Data = imageBase64.startsWith('data:') ? imageBase64.split(',')[1] : imageBase64;
    const sanitizedRelight = Math.min(100, Math.max(0, Number(relightIntensity) || 0));
    const sanitizedSkin = Math.min(20, Math.max(0, Number(skinSmoothing) || 0));
    const backgroundOption = typeof backgroundPreset === "string" ? backgroundPreset : "neutral";
    const expression = facialExpression === "smiling" ? "smiling" : "serious";
    const sanitizedSuit = typeof suitColor === "string" && suitColor.trim().length > 0 ? suitColor.trim() : null;
    const sanitizedTie = typeof tieColor === "string" && tieColor.trim().length > 0 ? tieColor.trim() : null;

    const removeBackgroundPrompt = `Transform this photo into a professional LinkedIn headshot portrait.
ABSOLUTE CRITICAL RULE - USE THE ORIGINAL FACE EXACTLY:
- Preserve EXACT face from the original
- Do NOT generate a new face
${expression === 'smiling' ? 'Create a natural professional smile' : 'Keep a serious professional expression'}
Subtle retouch (${sanitizedSkin}/20) and studio lighting.`;

    const removeBackgroundResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": \`Bearer \${LOVABLE_API_KEY}\`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image-preview",
        messages: [{ role: "user", content: [{ type: "text", text: removeBackgroundPrompt }, { type: "image_url", image_url: { url: \`data:image/jpeg;base64,\${base64Data}\` } }] }],
        modalities: ["image", "text"]
      })
    });
    if (!removeBackgroundResponse.ok) {
      if (removeBackgroundResponse.status === 402) throw new Error("CREDITS_EXHAUSTED");
      if (removeBackgroundResponse.status === 429) throw new Error("RATE_LIMITED");
      throw new Error(\`Lovable AI error: \${removeBackgroundResponse.status}\`);
    }
    const removeBackgroundData = await removeBackgroundResponse.json();
    const processedImageUrl = removeBackgroundData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    if (!processedImageUrl) throw new Error("No image returned from background removal step");

    const processedImageData = processedImageUrl.startsWith('data:') ? processedImageUrl.split(',')[1] : processedImageUrl;

    let backgroundPrompt = "";
    switch (backgroundOption) {
      case "neutral": backgroundPrompt = "Add a clean neutral gray gradient background."; break;
      case "corporate": backgroundPrompt = "Add a professional corporate blue gradient background."; break;
      case "office": backgroundPrompt = "Add a softly blurred modern office background."; break;
      default: backgroundPrompt = "Add a clean neutral gray gradient background.";
    }
    backgroundPrompt += \` Do not change the person's appearance. Studio lighting intensity \${sanitizedRelight}%.\`;
    if (sanitizedSuit) {
      backgroundPrompt += \` Ensure the suit appears in \${sanitizedSuit} tones.\`;
    }
    if (sanitizedTie) {
      backgroundPrompt += \` Style the tie in \${sanitizedTie} tones.\`;
    }
    if (typeof faceIndex === "number" && faceIndex > 0) {
      backgroundPrompt += \` Focus on face index \${faceIndex} if multiple faces are detected.\`;
    }

    const addBackgroundResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": \`Bearer \${LOVABLE_API_KEY}\`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image-preview",
        messages: [{ role: "user", content: [{ type: "text", text: backgroundPrompt }, { type: "image_url", image_url: { url: \`data:image/jpeg;base64,\${processedImageData}\` } }] }],
        modalities: ["image", "text"]
      })
    });
    if (!addBackgroundResponse.ok) {
      if (addBackgroundResponse.status === 402) throw new Error("CREDITS_EXHAUSTED");
      if (addBackgroundResponse.status === 429) throw new Error("RATE_LIMITED");
      throw new Error(\`Lovable AI error: \${addBackgroundResponse.status}\`);
    }
    const finalData = await addBackgroundResponse.json();
    const finalImageUrl = finalData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    if (!finalImageUrl) throw new Error("No image returned from background application step");

    return new Response(JSON.stringify({ processedImage: finalImageUrl }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    const status = msg === "LOVABLE_API_KEY is not configured" ? 500 : 502;
    return new Response(JSON.stringify({ error: msg }), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
