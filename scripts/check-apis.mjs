import fs from 'node:fs';
import path from 'node:path';

const envPath = path.resolve(process.cwd(), '.env');

if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf-8');
  for (const line of content.split(/\r?\n/)) {
    if (!line || line.trim().startsWith('#') || !line.includes('=')) continue;
    const [rawKey, ...rawValue] = line.split('=');
    const key = rawKey.trim();
    const value = rawValue.join('=').trim().replace(/^"|"$/g, '');

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

const requiredEnv = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_PUBLISHABLE_KEY'
];

const missingEnv = requiredEnv.filter((key) => !process.env[key] || process.env[key]?.trim() === '');

if (missingEnv.length > 0) {
  console.error('❌ Variables de entorno faltantes en tu .env:', missingEnv.join(', '));
  process.exit(1);
}

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const anonKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

try {
  const response = await fetch(`${supabaseUrl}/functions/v1/process-headshot`, {
    method: 'POST',
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ healthCheck: true })
  });

  if (!response.ok) {
    console.error(`❌ La función process-headshot respondió ${response.status}. ¿Está desplegada en Supabase?`);
    process.exit(1);
  }

  const data = await response.json().catch(() => null);

  if (!data) {
    console.error('❌ No se pudo parsear la respuesta de la función process-headshot.');
    process.exit(1);
  }

  if (!data.ok) {
    const missingSecrets = Array.isArray(data.missing) ? data.missing.join(', ') : 'desconocido';
    console.error(`❌ Falta configurar los secretos: ${missingSecrets}`);
    process.exit(1);
  }

  console.log('✅ Supabase y Lovable están configurados correctamente.');
  process.exit(0);
} catch (error) {
  console.error('❌ Error al consultar la función process-headshot:', error instanceof Error ? error.message : error);
  process.exit(1);
}
