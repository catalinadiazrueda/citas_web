# citas-web

Cliente React + TypeScript del portal de citas, importado del prototipo aprobado y conectado directamente a `citas-api`.

## Desarrollo local

1. Copia `.env.example` a `.env.local` si la API no está en `http://localhost:8081` (la URL configurable sigue siendo `VITE_API_URL`).
2. Ejecuta `npm install`.
3. Ejecuta `npm run dev` y abre `http://localhost:5173`.

El access JWT vive solo en memoria. El refresh JWT se recibe como cookie `HttpOnly` y se rota al restaurar la sesión. Las peticiones de login, refresh y logout incluyen credenciales y `X-Requested-With: XMLHttpRequest` conforme al contrato de seguridad.

## Verificación

```bash
npm run lint
npm test
npm run build
```

La interfaz cubre autenticación, catálogo de reserva, disponibilidad y superficies iniciales de administración/profesional. Las pantallas de perfil, mis citas, cancelación, reprogramación, agenda profesional, auditoría y automatizaciones requieren sus incrementos funcionales correspondientes antes de la entrega final.
