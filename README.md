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

## Generar un .swbn firmado

El workflow puede producir `orbit-chat.swbn` si configuras una clave de firma cifrada en **Settings → Secrets and variables → Actions** del repositorio. Añade dos secrets:

- `IWA_SIGNING_KEY_PEM`: contenido completo de `encrypted_key.pem` (clave privada cifrada en formato PEM).
- `IWA_SIGNING_PASSPHRASE`: la frase de contraseña de esa clave.

Para generar la clave sin Linux local puedes abrir un **Codespace** desde el botón **Code → Codespaces** del repositorio y ejecutar en su terminal web:

```bash
openssl genpkey -algorithm Ed25519 -out private_key.pem
openssl pkcs8 -in private_key.pem -topk8 -out encrypted_key.pem
```

OpenSSL pedirá una contraseña para cifrar la clave. Copia el contenido de `encrypted_key.pem` al secret `IWA_SIGNING_KEY_PEM` y usa esa contraseña para `IWA_SIGNING_PASSPHRASE`. Después elimina los archivos de clave del Codespace:

```bash
rm -f private_key.pem encrypted_key.pem
```

Nunca subas la clave privada al repositorio. La identidad de la IWA deriva de la clave; conserva los dos secrets para poder firmar futuras actualizaciones con la misma identidad. Cuando estén configurados, ve a **Actions → Orbit Chat CI → Run workflow**. El artefacto firmado aparecerá como `orbit-chat-iwa-swbn`. Si los secrets faltan, CI compilará y probará la web, pero omitirá el .swbn.

La carpeta `public/.well-known/manifest.webmanifest` contiene el manifiesto requerido por IWA. El bundle se genera con herramientas compatibles con el flujo oficial de Web Bundles de Chrome.

**Disponibilidad:** que el archivo esté firmado no garantiza que ChromeOS permita instalarlo en todos los dispositivos. El soporte de IWA puede depender de la versión, las políticas del dispositivo y la disponibilidad de la función en ChromeOS.
