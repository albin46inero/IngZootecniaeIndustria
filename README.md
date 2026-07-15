# Ingeniería Zootecnia – UPEA

Plataforma web institucional desarrollada para la **Carrera de Ingeniería Zootecnia** de la Universidad Pública de El Alto (UPEA). Sitio moderno, responsive y auditado bajo estándares de seguridad, diseñado para difundir información académica, historia institucional, publicaciones, eventos, videos, autoridades, cursos, diplomados, seminarios, convocatorias, malla curricular, plan de estudios, perfil profesional y contacto institucional.

Desarrollado con **Next.js 16** (App Router) + TypeScript, con consumo de API REST institucional, componentes UI modernos (shadcn/ui) y almacenamiento de assets en MinIO.

---

##  Tecnologías Utilizadas

| Categoría | Herramientas |
| :--- | :--- |
| **Framework** | Next.js 16 (App Router) |
| **Lenguaje** | TypeScript 5.7 |
| **Frontend** | React 19 |
| **Componentes UI** | shadcn/ui (Radix UI primitives) |
| **Estilos** | Tailwind CSS + CSS Variables dinámicas |
| **Animaciones** | Framer Motion / CSS Transitions |
| **Iconos** | Lucide React |
| **Gráficos** | Recharts (chart.tsx) |
| **Notificaciones** | Sonner (toast.tsx) |
| **Control** | Git & GitHub |
| **Almacenamiento** | MinIO (`archivosminio.upea.bo`) |
| **Backend/API** | REST API institucional (`apiadministrador.upea.bo`) |
| **Seguridad** | CSP, Headers anti-clickjacking, `rel="noopener noreferrer"`, Validación de URLs, Sanitización XSS |

---

##  Características Principales

###  Diseño Dinámico
- **Colores institucionales** consumidos en tiempo real desde la API (`colorinstitucion`)
- Variables CSS dinámicas (`--color-primario`, `--color-secundario`, `--color-terciario`)
- **Theme Provider** para manejo de temas claros/oscuros
- Componentes UI modernos y accesibles con **shadcn/ui**

###  100% Responsive
- Adaptado para móviles, tablets y escritorio
- Hook personalizado `use-mobile` para detección de dispositivos
- Grid layouts con Tailwind CSS

###  Seguridad Implementada
- **Validación estricta de URLs** con whitelist de dominios
- **Sanitización de atributos HTML** contra XSS
- **Enlaces externos seguros** con `rel="noopener noreferrer"`
- **Headers de seguridad HTTP** (X-Frame-Options, X-Content-Type-Options, X-XSS-Protection)
- **Content-Security-Policy** con `upgrade-insecure-requests`
- **Fetch seguro con timeout** (AbortController)
- **Manejo de errores sin exposición** de información sensible
- **Archivos robots.ts** para SEO y control de indexación

###  Multimedia Integrada
- **Slider de portadas** con auto-rotación (carousel.tsx)
- **Reproductores de video** YouTube embebidos con políticas CSP seguras
- **Mapas interactivos** de Google Maps con coordenadas GPS
- **Imágenes optimizadas** con Next.js Image (lazy loading, priority, sizes)
- **Gráficos interactivos** con Recharts (chart.tsx)

###  Navegación Avanzada
- **Routing con Next.js App Router** (navegación sin recargar página)
- **Rutas especializadas**: autoridades, contacto, convocatorias, cursos, diplomados, enlaces, eventos, gaceta, historia, malla-curricular, mision-vision, ofertas, perfil-profesional, plan-estudios, publicaciones, seminarios, servicios, videos
- **Scroll suave** a secciones con anclas
- **Breadcrumb** para navegación jerárquica
- **Pagination** para listados extensos

###  Componentes UI Avanzados (shadcn/ui)
- **Formularios**: form.tsx, input.tsx, textarea.tsx, select.tsx, checkbox.tsx, radio-group.tsx
- **Navegación**: menubar.tsx, navigation-menu.tsx, dropdown-menu.tsx, tabs.tsx
- **Feedback**: alert.tsx, alert-dialog.tsx, toast.tsx, toaster.tsx, sonner.tsx, spinner.tsx
- **Layout**: accordion.tsx, collapsible.tsx, drawer.tsx, dialog.tsx, sheet.tsx, sidebar.tsx
- **Datos**: table.tsx, card.tsx, badge.tsx, avatar.tsx, progress.tsx
- **Interacción**: button.tsx, switch.tsx, toggle.tsx, tooltip.tsx, popover.tsx, context-menu.tsx
- **Visualización**: carousel.tsx, chart.tsx, skeleton.tsx, slider.tsx, resizable.tsx

###  Rendimiento Optimizado
- **Code-splitting** automático de Next.js
- **Lazy loading** de imágenes y componentes
- **Priority loading** en imágenes del hero (LCP)
- **Cache configuration** con revalidación
- **Optimización de imágenes** con formatos AVIF y WebP
- **Error boundaries**: error.tsx y global-error.tsx para manejo robusto de errores

---

##  Lo que hace el Proyecto

- Renderiza interfaz con **Next.js 16 App Router** y React 19
- Consume **4 endpoints REST** de la API administrativa UPEA
- Aplica **temas dinámicos** con colores desde `colorinstitucion` API
- Implementa **routing por páginas** (`/autoridades`, `/contacto`, `/convocatorias`, `/cursos`, `/diplomados`, `/enlaces`, `/eventos`, `/gaceta`, `/historia`, `/malla-curricular`, `/mision-vision`, `/ofertas`, `/perfil-profesional`, `/plan-estudios`, `/publicaciones`, `/seminarios`, `/servicios`, `/videos`)
- Visualiza **PDFs** mediante enlaces con `target="_blank"` y `rel="noopener noreferrer"`
- Integra **iframes de YouTube** y **Google Maps** con políticas CSP seguras
- Procesa **imágenes desde MinIO** (`archivosminio.upea.bo`)
- Valida y sanitiza URLs con helpers en `src/lib/utils.ts`
- Gestiona estados con **React Hooks** (`useState`, `useEffect`, `useRef`) y hooks personalizados (`use-mobile`, `use-toast`)
- Aplica **animaciones con Framer Motion** y CSS transitions
- Genera **build optimizado** con `npm run build`
- Despliega en producción con **headers de seguridad**
- Implementa **SEO** con robots.ts y metadata dinámica

---

##  Estructura del Proyecto

```text
public/                 # Assets estáticos (imágenes, logos, favicon)
 src/
 app/                # Next.js App Router (18 páginas especializadas)
 autoridades/    # Página de autoridades
 contacto/       # Página de contacto
 convocatorias/  # Página de convocatorias
 cursos/         # Página de cursos
 diplomados/     # Página de diplomados
 enlaces/        # Página de enlaces de interés
 eventos/        # Página de eventos
 gaceta/         # Página de gaceta universitaria
 historia/       # Página de historia institucional
 malla-curricular/ # Página de malla curricular
 mision-vision/  # Página de misión y visión
 ofertas/        # Página de ofertas académicas
 perfil-profesional/ # Página de perfil profesional
 plan-estudios/  # Página de plan de estudios
 publicaciones/  # Página de publicaciones
 seminarios/     # Página de seminarios
 servicios/      # Página de servicios
 videos/         # Página de videos
 error.tsx       # Error boundary para errores de cliente
 global-error.tsx # Error boundary para errores de servidor
 layout.tsx      # Layout raíz
 page.tsx        # Página principal (Home)
 robots.ts       # Configuración de robots.txt para SEO
 globals.css     # Estilos globales
 components/         # Componentes reutilizables
 ui/             # 40+ componentes shadcn/ui (Radix UI)
 hooks/          # Hooks personalizados (use-mobile, use-toast)
 lib/            # Servicios (api.ts) y utilidades (utils.ts)
 favicon.tsx     # Componente de favicon dinámico
 FloatingParticles.tsx # Efecto visual de partículas
 Footer.tsx      # Footer institucional
 Header.tsx      # Header con navegación
 theme-provider.tsx # Provider de temas (claro/oscuro)
 styles/             # Estilos adicionales
 globals.css
  .env                # Variables de entorno
  .envcopy            # Template de variables de entorno
  .gitignore
 components.json     # Configuración de shadcn/ui
 next.config.js      # Configuración de Next.js
 package.json
 tsconfig.json       # Configuración de TypeScript
 README.md

```
 ## Variables de entorno
```
```
NEXT_PUBLIC_SERVICIO_ADMIN_URL
```
NEXT_PUBLIC_API_TOKEN
NEXT_PUBLIC_API_BASE
NEXT_PUBLIC_INSTITUCION_ID
NEXT_PUBLIC_API_STORAGE
```
## Endpoints Principales

GET /institucionesPrincipal/{49}
GET /institucion/{49}/recursos
GET /institucion/{49}/contenido
GET /institucion/{49}/gacetaEventos

## Probar Endpoints Principales

# 1. Institución Principal
curl -X GET "https://apiadministrador.upea.bo/api/v2/institucionesPrincipal/{49}" \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json"

# 2. Recursos Institucionales
curl -X GET "https://apiadministrador.upea.bo/api/v2/institucion/{49}/recursos" \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json"

# 3. Contenido Dinámico
curl -X GET "https://apiadministrador.upea.bo/api/v2/institucion/{49}/contenido" \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json"

# 4. Gacetas y Eventos
curl -X GET "https://apiadministrador.upea.bo/api/v2/institucion/{49}/gacetaEventos" \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json"

## Instalacion y Ejecucion

# 1. Clonar el repositorio
git clone https://github.com/tu-usuario/2026-IngenieriaZootecnia.git
cd 2026-IngenieriaZootecnia

# 2. Instalar dependencias
npm install

# 3. Crear archivo .env
# Copiar las variables de entorno descritas arriba
# Reemplazar NEXT_PUBLIC_INSTITUCION_ID con el ID real

# 4. Ejecutar en modo desarrollo
npm run dev

# 5. Abrir en el navegador
# http://localhost:3000

# Build optimizado para producción
npm run build

# Ejecutar build de producción
npm start

##  Notas Operativas

### Solución de Problemas Comunes

- **"Error al cargar datos"**: Verificar conexión con la API o que el token no haya expirado
- **Imágenes no se visualizan**: Verificar que `NEXT_PUBLIC_MINIO_BASE_URL` apunte correctamente a MinIO
- **PDFs no abren**: Revisar que el CSP incluya `frame-src` y `object-src` para MinIO
- **Navegación no funciona entre páginas**: Verificar que las páginas existan en `src/app/`
- **Colores no cambian**: Limpiar caché del navegador o modificar en panel administrativo
- **Puerto 3000 ocupado**: Usar `npm run dev -- -p 3001` para otro puerto
- **Variables de entorno no cargan**: Reiniciar el servidor después de crear `.env`
- **Error de hidratación**: Agregar `suppressHydrationWarning` en `<html>` si es necesario
- **Warning de imágenes con `fill`**: Agregar `relative` al padre de la imagen y configurar `sizes`
- **Error en componentes shadcn/ui**: Verificar que `components.json` esté configurado correctamente y que todas las dependencias de Radix UI estén instaladas
- **Toast/Notificaciones no funcionan**: Verificar que `Toaster` esté importado en el layout raíz
- **Theme provider no aplica**: Verificar que `ThemeProvider` envuelva la aplicación en `layout.tsx`
- **Datos incorrectos de la carrera**: Verificar que `NEXT_PUBLIC_INSTITUCION_ID` corresponda al ID real de Ingeniería Zootecnia en la API

### Buenas Prácticas

- Usar `npm run build` solo cuando el sistema esté estable y todas las pruebas pasen
- Para cambios de colores, modificar directamente en el panel administrativo de la API (no en el frontend)
- Las variables de entorno `.env` **NO** se suben a Git; cada desarrollador debe crear su propio archivo
- Mantener dependencias actualizadas con `npm audit` periódicamente
- Rotar credenciales de API cada 6 meses
- Usar `rel="noopener noreferrer"` a todos los enlaces externos con `target="_blank"`
- Mantener la estructura de carpetas organizada por dominio (autoridades, contacto, convocatorias, etc.)
- Usar tipos TypeScript estrictos en `src/lib/` para mantener la consistencia del código
- Centralizar el consumo de API en `src/lib/api.ts`
- Usar hooks personalizados (`use-mobile`, `use-toast`) para lógica reutilizable
- Aprovechar los 40+ componentes de shadcn/ui para mantener consistencia visual y accesibilidad
- Implementar error boundaries (`error.tsx`, `global-error.tsx`) para manejo robusto de errores
- Configurar `robots.ts` para optimizar SEO y control de indexación
- Usar `FloatingParticles.tsx` para efectos visuales modernos en el hero

---

##  Recomendación Final

Se recomienda mantener este repositorio con las siguientes responsabilidades:

- Frontend **Next.js 16 + TypeScript** para visualización de datos institucionales
- **Componentes UI modernos** con shadcn/ui para accesibilidad y consistencia visual
- Nada de lógica de negocio compleja en el cliente
- Nada de almacenamiento local sensible (solo caché de imágenes)
- Nada de conexión directa a base de datos
- Todo el consumo vía **API REST** con token de autenticación
- Seguridad implementada en frontend (validación, sanitización, headers)
- Mantener la estructura de carpetas modular y escalable
- Usar componentes reutilizables en `src/components/ui/` y `src/components/`
- Implementar rutas especializadas para cada sección académica
- Mantener los tipos TypeScript actualizados en `src/lib/`
- Usar Framer Motion para animaciones suaves y profesionales
- Optimizar imágenes con el componente `next/image` para mejorar el LCP
- Implementar **SEO** con metadata dinámica y robots.ts
- Usar **theme-provider** para soporte de modo claro/oscuro
- Aprovechar hooks personalizados (`use-mobile`, `use-toast`) para mejorar la experiencia de usuario
- Mantener actualizados los assets en `public/` (logos, imágenes institucionales, etc.)
- **Verificar el ID de institución** correcto antes de hacer deploy a producción