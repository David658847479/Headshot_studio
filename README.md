# Headshot Studio

Generador de fotos de perfil para Linkedin.

## Requisitos previos

- [Node.js](https://nodejs.org/) 18 o superior (se recomienda la versión LTS más reciente).
- Un gestor de paquetes compatible con Node.js (npm viene instalado por defecto con Node).

## Instalación

1. Clona el repositorio y entra en la carpeta del proyecto:
   ```bash
   git clone <url-del-repo>
   cd Headshot_studio
   ```
2. Instala las dependencias del proyecto:
   ```bash
   npm install
   ```

## Variables de entorno

La aplicación necesita credenciales de Supabase y la clave de Lovable AI utilizada por la función edge `process-headshot`:

```bash
VITE_SUPABASE_URL="https://TU-PROYECTO.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="tu_clave_publica"
```

Además debes definir el secreto `LOVABLE_API_KEY`, que se consume desde la función edge que procesa las imágenes:

```bash
LOVABLE_API_KEY="tu_clave_de_lovable"
```

Guarda las variables `VITE_*` en el archivo `.env` de la raíz del proyecto (se carga en el build del front-end) y configura `LOVABLE_API_KEY` como un secreto de Supabase (`supabase secrets set LOVABLE_API_KEY="..."`). Para pruebas locales con la función edge puedes copiar `supabase/functions/process-headshot/.env.example` a `.env` en la misma carpeta y rellenar el valor.

## Ejecutar en modo desarrollo

Inicia el servidor de desarrollo con Vite:

```bash
npm run dev
```

Por defecto la aplicación quedará disponible en [http://localhost:5173](http://localhost:5173).

## Generar build de producción

Para generar los archivos optimizados para producción ejecuta:

```bash
npm run build
```

Puedes verificar el resultado con:

```bash
npm run preview
```

Esto levantará un servidor que servirá la versión construida para verificar que todo funcione correctamente en local.

## ¿Cómo previsualizar y comprobar que funciona?

1. Asegúrate de que el archivo `.env` contenga las credenciales válidas de Supabase y de que la consola donde ejecutes los comandos muestre `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY` sin errores.
2. Ejecuta `npm run dev` y abre [http://localhost:5173](http://localhost:5173) para comprobar la versión en modo desarrollo con recarga en caliente.
3. Para validar la build de producción usa `npm run build` seguido de `npm run preview` y visita [http://localhost:4173](http://localhost:4173).
4. Desde el navegador, prueba subir una imagen y revisa la consola de desarrollador (DevTools) para confirmar que no aparezcan errores de red con Supabase.
5. Si solo quieres una muestra rápida del resultado, en la página de inicio pulsa **Ver demo** para abrir la vista previa interactiva antes/después.

Si alguno de los pasos falla, revisa que las variables de entorno sean correctas y que tu proyecto de Supabase permita las operaciones necesarias.

## Configurar y probar la función de Supabase

La función edge `process-headshot` vive en `supabase/functions/process-headshot`. Es la encargada de llamar a la API de Lovable y devolver la imagen procesada. Para evitar errores al ejecutar la app:

1. Instala el [CLI de Supabase](https://supabase.com/docs/guides/cli) y asegúrate de haber iniciado sesión (`supabase login`).
2. Crea un archivo `supabase/functions/process-headshot/.env` copiando el ejemplo: `cp supabase/functions/process-headshot/.env.example supabase/functions/process-headshot/.env` y actualiza `LOVABLE_API_KEY`.
3. Lanza la función en local con: `supabase functions serve process-headshot --env-file supabase/functions/process-headshot/.env`.
4. Desde otra terminal ejecuta `npm run dev` para levantar el front-end. Al subir una imagen, la aplicación llamará a la función local.
5. Para producción, sube el código con `supabase functions deploy process-headshot` y define el secreto en tu proyecto: `supabase secrets set LOVABLE_API_KEY="tu_clave"`.

Sin la función desplegada y con el secreto configurado, las llamadas a `supabase.functions.invoke('process-headshot')` fallarán con errores de credenciales o de función inexistente.

## Comandos adicionales

- `npm run lint`: ejecuta ESLint para revisar el código.

Con estos pasos deberías poder ejecutar el proyecto en tu entorno local sin inconvenientes.
