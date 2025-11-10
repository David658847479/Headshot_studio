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

La aplicación necesita credenciales de Supabase para poder funcionar. Crea un archivo `.env` en la raíz del proyecto con el siguiente contenido:

```bash
VITE_SUPABASE_URL="https://TU-PROYECTO.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="tu_clave_publica"
```

> Asegúrate de reemplazar los valores de ejemplo por los que corresponden a tu proyecto en Supabase.

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

Si alguno de los pasos falla, revisa que las variables de entorno sean correctas y que tu proyecto de Supabase permita las operaciones necesarias.

## Comandos adicionales

- `npm run lint`: ejecuta ESLint para revisar el código.

Con estos pasos deberías poder ejecutar el proyecto en tu entorno local sin inconvenientes.
