# Orbit Chat

Una interfaz de chat estilo Discord hecha con Vite, Supabase y Auth0, pensada para desarrollarse desde el navegador con GitHub Actions.

## Qué incluye
- UI responsiva oscura para escritorio y móvil.
- Canales de ejemplo y mensajes de demostración.
- Preparación del cliente Auth0 SPA para Universal Login.
- Cliente Supabase y migración SQL inicial.
- GitHub Actions para pruebas, compilación y artefacto `dist/`.

## Estado actual
La interfaz funciona en modo demostración; los mensajes de ejemplo no se sincronizan entre usuarios. Auth0 y Supabase requieren configuración propia. El código no envía mensajes a Supabase hasta implementar y verificar el puente de identidad Auth0 → JWT aceptado por Supabase.

## Desarrollo desde GitHub Codespaces
No necesitas Linux local en ChromeOS.
1. Abre este repositorio en GitHub.
2. Pulsa **Code → Codespaces → Create codespace on main** (si Codespaces está habilitado en tu cuenta).
3. En el terminal integrado de Codespaces ejecuta `npm install` y `npm run dev -- --host 0.0.0.0`.
4. Abre el enlace del puerto 5173 en el navegador.

También puedes editar archivos directamente desde el editor web de GitHub. Al subir archivos a `main`, el workflow CI se ejecuta automáticamente.

## Auth0
Crea una aplicación Auth0 de tipo **Single Page Application**. Configura Callback URLs, Logout URLs y Web Origins con el origen HTTPS donde desplegues la app. Define estas variables en el entorno del proveedor de build:
- `VITE_AUTH0_DOMAIN` (solo el dominio, sin `https://`)
- `VITE_AUTH0_CLIENT_ID`

Nunca añadas un client secret al frontend.

## Supabase
Crea/activa el proyecto y ejecuta `supabase/migrations/001_orbit_chat.sql` en el SQL Editor. Las políticas RLS están habilitadas y son deliberadamente restrictivas, sin permisos abiertos. Para activar persistencia hay que implementar primero una integración de confianza que valide los tokens Auth0 antes de otorgar acceso a las tablas. La clave `service_role` nunca debe ir al navegador.

Variables opcionales:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY` (clave publicable/anon, nunca `service_role`)

## Publicar la web
GitHub Actions ejecuta `npm test` y `npm run build`, y sube `dist/` como artefacto. Esto genera una web estática, no un paquete IWA firmado.

## Sobre .swbn / Isolated Web Apps
Un archivo con extensión `.swbn` no se puede fabricar renombrando un ZIP. Una IWA real requiere empaquetado firmado con las herramientas/formato de Isolated Web Apps y un método compatible de instalación. Este proyecto aún no genera un `.swbn` firmado ni es instalable como IWA.
