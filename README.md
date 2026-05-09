# MascotaSegura

La identidad digital inteligente para tu mejor amigo. 

MascotaSegura es una aplicación web progresiva (PWA) diseñada para ofrecer protección inmediata a mascotas en caso de extravío. Permite a los dueños crear un perfil detallado con información médica y de contacto, y generar una placa con código QR. Si la mascota se pierde, cualquier persona puede escanear la placa desde su teléfono celular para acceder al perfil público y enviar su ubicación GPS exacta al dueño.

## Características principales

- **Perfil Inteligente:** Gestión de la información básica, médica y datos de contacto del propietario.
- **Generación de Placas QR:** Creación automática de códigos QR únicos vinculados al perfil público de cada mascota.
- **Escáner Integrado:** Lector de QR en tiempo real directo desde la aplicación para identificar mascotas rápidamente.
- **Geolocalización en Tiempo Real:** Al escanear una placa, el sistema permite enviar la ubicación GPS exacta de la mascota al dueño.
- **Notificaciones Push:** Alertas enviadas directamente al dispositivo del propietario cuando alguien escanea la placa de su mascota.
- **Progressive Web App (PWA):** Instalable en dispositivos móviles y de escritorio, optimizada para funcionar como una aplicación nativa.
- **Seguridad y Autenticación:** Protección de datos gestionada de manera segura para garantizar la privacidad de dueños y mascotas.

## Tecnologías y Arquitectura

El proyecto está construido bajo un enfoque sin servidor (serverless) utilizando tecnologías estándar y modernas del lado del cliente y backend como servicio (BaaS).

- **Frontend:** HTML5, Vanilla JavaScript, CSS (Tailwind CSS vía CDN).
- **Iconografía:** Phosphor Icons.
- **Lector QR:** Librería `html5-qrcode`.
- **Backend y Base de Datos:** Supabase (PostgreSQL).
- **Autenticación:** Supabase Auth (Email & Password).
- **Funciones Edge:** Deno (Supabase Edge Functions para el envío de Notificaciones Push vía Web Push API).
- **Service Workers:** Gestión de caché y recepción de notificaciones Push.

## Estructura del Proyecto

```text
/
├── assets/
│   ├── js/                 # Lógica de la aplicación (script.js)
│   └── icons/              # SVG y recursos gráficos
├── supabase/
│   ├── migrations/         # Esquemas SQL y tablas de base de datos
│   └── functions/          # Deno Edge Functions (ej. send-push)
├── index.html              # Landing page principal
├── entrar.html             # Pantalla de inicio de sesión
├── registro.html           # Pantalla de creación de cuenta
├── recuperar.html          # Pantalla de recuperación de contraseña
├── crear-placa.html        # Creación y edición de perfiles de mascotas
├── mis-mascotas.html       # Panel de control de mascotas registradas
├── mi-cuenta.html          # Gestión de la cuenta del usuario
├── notificaciones.html     # Historial de alertas de escaneo
├── perfil.html             # Vista pública de la mascota (accesible vía QR)
├── manifest.json           # Manifiesto de la PWA
└── sw.js                   # Service Worker para caché y Push Notifications
```

## Instalación y Despliegue Local

Al ser un proyecto estático que consume APIs de Supabase, no requiere un proceso de compilación complejo para ejecutarse localmente.

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/MascotaSegura/MascotaSegura.git
   cd MascotaSegura
   ```

2. **Servir localmente:**
   Levanta un servidor HTTP simple en la raíz del proyecto. Por ejemplo, usando Python:
   ```bash
   python -m http.server 8000
   ```
   *Nota: Para probar las Notificaciones Push o el escáner QR en un dispositivo móvil, es necesario que el entorno local se sirva sobre `https` (o usando un túnel como ngrok).*

3. **Configuración de Supabase:**
   - La base de datos requiere la ejecución de los esquemas ubicados en `supabase/migrations/`.
   - El envío de notificaciones depende de la Edge Function en `supabase/functions/send-push/`.
   - Las variables de entorno para el cliente en `script.js` deben configurarse con tu propia URL y Clave Anónima de Supabase si deseas utilizar un entorno propio.

## Privacidad y Seguridad

Toda la información médica y de contacto se expone en la vista pública (`perfil.html`) únicamente con el propósito de devolver a la mascota sana y salva a su hogar. La modificación de los datos está restringida al usuario autenticado propietario de la placa.
