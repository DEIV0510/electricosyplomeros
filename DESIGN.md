# ELÉCTRICOS Y PLOMEROS — Guía de diseño y construcción

Documento maestro. Todo agente que construya una parte del sitio lo lee completo antes de escribir código.

## 0. Reglas que no se negocian

1. **No inventar información.** Todo texto de negocio sale de `lib/content.ts` (servicios, ciudades, teléfono, Facebook) o del brief. Prohibido: años de experiencia, número de clientes, testimonios, reseñas, certificaciones, garantías, precios, promociones, horarios ("24/7", "atención inmediata", "respuesta en minutos"), direcciones, barrios, trabajadores, alianzas, estadísticas, "técnicos certificados", "los mejores", "líderes". Los rótulos técnicos de interfaz ("SISTEMA LISTO", "PASO 2/5") sí se permiten porque son interfaz, no afirmaciones comerciales. Nunca escribir cifras inventadas en readouts (nada de "voltaje 220V", "presión 40 psi", "99%").
2. **Logo oficial intocable.** Usar `components/ui/Logo.tsx` (el archivo real, solo escalado). Nunca recolorear, recortar, rotar, deformar ni redibujar. Tiene texto negro: va siempre sobre superficie clara (`paper` o blanco). Nunca sobre `night`.
3. **Sin fotos.** El cliente solo entregó el logo. No usar stock, ni imágenes generadas por IA, ni placeholders de fotos. Todo lo visual es SVG/CSS.
4. **Sin emojis como íconos.** Íconos de `components/ui/Icons.tsx` o SVG propio con el mismo lenguaje (trazo 1.75, extremos redondeados).
5. **Un dueño por archivo.** Cada agente edita SOLO sus archivos (ver §9). Archivos compartidos (`app/*`, `lib/*`, `components/ui/*`, `app/globals.css`, `DESIGN.md`) no se tocan; si necesitas un cambio ahí, descríbelo en tu informe final.
6. **Español de Colombia, tuteo.** Corto, directo, humano. Nada de "Somos líderes en soluciones integrales". Sí: "¿Se dañó algo? Cuéntanos.", "¿Tienes una fuga?", "Estamos para ayudarte."
7. **La animación nunca supera al contenido.** Todo el contenido es legible sin animaciones, sin JS y con `prefers-reduced-motion`.

## 1. Concepto

**DETECTAR → ENTENDER → SOLUCIONAR.** La web no es un folleto: es un tablero técnico del hogar. El usuario llega con un problema, la web le ayuda a nombrarlo (diagnóstico) y lo lleva a WhatsApp con el mensaje ya escrito.

Narrativa por secciones:

| # | Sección (componente) | id | Paso | Superficie |
|---|---|---|---|---|
| 1 | Hero (`Hero` + `HomeSystem`) | `#inicio` | 01 · DETECTAR | paper + cuadrícula |
| 2 | Diagnóstico (`Diagnostic`) | `#diagnostico` | 02 · ENTENDER | paper; la consola es `night` |
| 3 | Un hogar. Cuatro sistemas (`Systems`) | `#servicios` | — | paper-2 / stage `night` |
| 4 | No solo arreglamos (`NotOnlyFix`) | `#solucionamos` | 03 · SOLUCIONAR | night |
| 5 | Cobertura (`Coverage`) | `#cobertura` | — | paper |
| 6 | Contacto / CTA final (`Contact`) | `#contacto` | — | night dentro de paper (revelado en rombo) |
| 7 | Footer (`Footer`) | — | — | paper-2 (claro: lleva el logo) |

Navegación: Inicio `#inicio` · Servicios `#servicios` · Soluciones `#diagnostico` · Cobertura `#cobertura` · Contacto `#contacto`.

## 2. Identidad (derivada del logo)

El logo tiene tres piezas que guían todo el lenguaje visual:

- **Rombo de franjas horizontales moradas** → techo/casa hecho de líneas. Se traduce en: casas dibujadas con líneas horizontales, "barrido" de escaneo por franjas, el rombo (cuadrado a 45°) como forma de nodo y de máscara.
- **E morada de trazo redondeado** → trazos gruesos con extremos redondeados.
- **Anillo verde tipo botón de encendido** → estado "ENCENDIDO / LISTO / SOLUCIONADO". El verde significa *acción* y *resuelto*.

### Paleta (tokens Tailwind en `app/globals.css`)

| Token | Hex | Uso |
|---|---|---|
| `paper` | #f6f5f9 | fondo principal |
| `paper-2` / `paper-3` | #edeaf3 / #e2ddec | superficies alternas, bordes suaves |
| `ink` / `ink-2` / `ink-3` | #14101f / #3f3a4d / #655e78 | texto (todos ≥4.5:1 sobre paper) |
| `violet` | #3a0080 | morado del logo: títulos acentuados, nodos, líneas de marca |
| `violet-2` | #5520a8 | hover morado |
| `electric` | #4b2ef5 | azul eléctrico: sistema ENERGÍA, foco de teclado |
| `water` | #0b86c4 | sistema AGUA (solo trazos) |
| `gas` | #e0691f | sistema GAS (solo trazos finos, sutil) |
| `green` / `green-2` | #00c000 / #00ad00 | verde del logo: CTAs (texto `ink` encima), WhatsApp, estado LISTO |
| `green-ink` | #006e14 | verde para TEXTO sobre fondo claro |
| `night` / `night-2` / `night-3` | #0d0918 / #151026 / #211a38 | superficies oscuras (tablero) |
| `mist` / `mist-2` / `mist-3` | #f3f1f8 / #b9b2cf / #8a83a3 | texto sobre night (todos ≥4.5:1) |
| `electric-glow` / `water-glow` / `gas-glow` | #9d8cff / #4cc3f5 / #ff9a57 | trazos de sistemas sobre night |

Reglas de color:
- **El verde es exclusivo de acciones (CTA/WhatsApp) y del estado LISTO/RESUELTO** (anillo de encendido, SOLUCIONAMOS., HABLEMOS.). No es el color de ningún sistema: SOPORTE usa violet sobre claro y mist sobre night.
- **Acentos de titular:** sobre paper, el acento es violet (palabra clave o segunda línea). Sobre night, verde solo para la palabra "resuelta". Nada de naranja/gas en titulares.
- El verde es para acciones y estado "listo". No pintar secciones enteras de verde. Texto blanco sobre verde está PROHIBIDO (contraste 2.5:1): sobre verde siempre `ink`.
- Verde como texto sobre paper: solo `green-ink`. Sobre night, `green` sí sirve como texto (7.9:1).
- Gas es un acento cálido muy sutil (líneas de 1–1.5px, opacidad ~0.8). Nunca fondos naranjas.
- Nada de degradados grandes ni glassmorphism. Como máximo un halo radial suave detrás de un nodo.
- Apagar elementos por **color** (p. ej. `mist-3`), no por `opacity` baja, cuando son texto.

Sistemas → color → ícono:

| id | Sistema | Servicio | Color claro | Color en night | Ícono |
|---|---|---|---|---|---|
| electricidad | 01 ENERGÍA | Electricidad | electric | electric-glow | IconBolt |
| plomeria | 02 AGUA | Plomería | water | water-glow | IconDrop |
| gas | 03 GAS | Gas | gas | gas-glow | IconFlame |
| hogar | 04 SOPORTE | Asistencia para el hogar | violet | mist (blanco) — NUNCA verde | IconHome |

### Tipografía

- **Archivo** variable (pesos 100–900, ancho 62–125%) para todo. Titulares con `.t-display` (800, `font-stretch:118%`, mayúsculas, interlineado 0.94) → eco del wordmark ancho del logo sin caer en lo futurista. Subtítulos con `.t-title`.
- **JetBrains Mono** solo para rótulos técnicos pequeños: `.t-label` (12px, mayúsculas, tracking 0.14em). Nunca para párrafos.
- Texto base 16px (17–20px en leads con `.t-lead`). Mínimo absoluto 12px y solo en rótulos mono.
- Escala de titulares: el **H1 del hero es el pico de la página** (≈ 76–80px a 1440, más en ≥1920). H2 de sección `clamp(2.1rem, 4.2vw, 3.6rem)` (≈ 58px a 1440); el H2 de contacto como máximo 4.5rem; nombres de ciudad como máximo ≈ 4.25rem. H3 `clamp(1.35rem, 2.2vw, 1.75rem)`. En pantallas < 360px los titulares se limitan por `vw` para que nunca desborden (320px debe verse sin scroll lateral). En móviles horizontales (`(orientation: landscape) and (max-height: 520px)`) los titulares se limitan también por `svh`.
- Espaciado vertical de secciones: `var(--section-y)` (definido en globals).
- Rótulos mono cortos con `whitespace-nowrap` para que no partan línea con la fuente de respaldo (evita CLS).

### Forma

- **Esquinas rectas** (radio 0–2px). El cliente asocia lo redondeado con poca seriedad. Excepciones: círculos de nodos, punto de estado, botón flotante de WhatsApp (círculo), controles tipo radio.
- Paneles con **marcas de esquina** de plano técnico (`.ticks`, usa `currentColor`) y bordes de 1px.
- El **rombo** (cuadrado rotado 45°) es la forma de nodo de la marca. Úsalo con intención (nodos, viñetas, máscara del CTA final), no como relleno decorativo.
- Hexágonos: el cliente los menciona, pero NO están en el material entregado. No usarlos.
- Sombras: casi nunca. Profundidad por superposición de capas, contraste paper/night y líneas.

### Movimiento

- **Bucles con costo de hilo principal** (`stroke-dashoffset`): nunca `infinite`. Corren un número finito de ciclos y se reactivan al volver a entrar en pantalla o al interactuar (puntero), con pausas de reposo. Bucles baratos (opacity/transform) pueden ser infinitos. Todos llevan `.anim-loop`.
- **Pausa global:** `html.motion-paused` (botón "Pausar animaciones" en el footer, `components/ui/MotionToggle.tsx`). CSS: ya pausa `.anim-loop`. JS (rotaciones, rAF, reinicios periódicos): consultar `useMotionPaused()` de `lib/hooks.ts` y no arrancar nada si es true. Igual con `useIsLite()` y movimiento reducido.
- **Doble clic / doble toque:** ninguna pantalla nueva debe aceptar el segundo clic de un doble clic (ignorar clics < 400 ms después de cambiar de vista).

- Easing de entrada `var(--ease-out)`; microinteracciones 150–300 ms; transiciones de estado ≤ 450 ms; salidas más cortas que entradas.
- Solo `transform` y `opacity` para animar elementos. Excepción permitida: `stroke-dashoffset` en trazos SVG pequeños (flujo de corriente/agua/gas). Toda animación en bucle debe: (a) llevar la clase `anim-loop` (se congela en modo `lite`) y (b) pausarse fuera de pantalla poniendo `data-paused="true"` en su contenedor (usa `useInView` de `lib/hooks.ts`).
- `prefers-reduced-motion`: sin bucles, sin parallax, sin secuencias; mostrar el estado final completo. Además existe la red global en `globals.css`.
- Nada que bloquee la interacción. Nada de scroll-jacking. Nada de cursor personalizado.

## 3. Infraestructura disponible (no reescribir)

- `lib/content.ts` — contenido. `SYSTEMS`, `CITIES`, `CONTACT`, `DIAGNOSTIC`, `NAV`, `BRAND`.
- `lib/whatsapp.ts` — `whatsappUrl(msg)`, `DEFAULT_MESSAGE`, `serviceMessage(id)`, `cityMessage(id)`, `diagnosticMessage(answers)`.
- `lib/hooks.ts` — `useMediaQuery`, `usePrefersReducedMotion`, `useFinePointer`, `useIsLite`, `useInView`.
- `lib/boot.ts` — script del `<head>`. Clases en `<html>`: `js`, `rm` (movimiento reducido), `lite`, `is-booting`, `boot-done`, `boot-end`, `boot-skip`, `reveal-fallback`.
- `components/ui/Logo.tsx`, `components/ui/Icons.tsx`, `components/ui/Cta.tsx` (`WhatsAppLink`, `CallLink`, `cx`), `components/ui/SectionTag.tsx`.
- Clases globales: `.container-x`, `.t-display`, `.t-title`, `.t-label`, `.t-lead`, `.btn` + `.btn-primary | .btn-secondary | .btn-on-dark` + `.btn-lg`, `.btn-arrow`, `.link-arrow`, `.ticks`, `.bg-grid`, `.bg-grid-night`, `.on-dark` (foco claro dentro de superficies oscuras), `.sr-only` (Tailwind).
- Revelado al hacer scroll: añade `data-reveal` a un bloque (y opcional `style={{'--reveal-delay':'120ms'} as React.CSSProperties}`). `RevealController` lo activa. NO usar `data-reveal` en el H1 del hero ni en nada visible al cargar.
- Variables: `--nav-h` (64px móvil / 76px ≥1024), `--gutter`, `--maxw` (1320px).
- Breakpoints Tailwind: `xs` 400, `sm` 640, `md` 768, `lg` 1024, `xl` 1280, `2xl` 1536.

### CSS
Cada agente escribe su CSS en SU hoja (`styles/*.css`), con TODAS las reglas dentro de `@layer components { … }` (las `@keyframes` pueden ir fuera). Prefija las clases con el prefijo de tu componente (ver §9) para no chocar. Para lo demás, usa utilidades de Tailwind 4 en el JSX. Ojo: en Tailwind 4 el CSS sin capa le gana a las utilidades; por eso la capa.

### Next.js 16
- Es Next 16.4 con App Router y `output: 'export'` (sitio estático). Componentes de servidor por defecto; marca `'use client'` solo donde haya estado/efectos, y mantén lo estático en servidor.
- No uses `next/image` (export sin optimizador): usa `<img>`/SVG en línea.
- Nada de `Date.now()`, `Math.random()` o `new Date()` durante el render de servidor.
- Evita desajustes de hidratación: nada que dependa de `window` en el primer render (usa `useEffect` o `useSyncExternalStore` con valor de servidor).
- Docs locales: `node_modules/next/dist/docs/`.

## 4. Accesibilidad (obligatorio)

- Contraste AA: texto normal 4.5:1, grande 3:1, trazos significativos 3:1.
- Todo interactivo es `<a>` o `<button>` real, alcanzable con Tab, con `:focus-visible` visible (global ya definido; en superficies oscuras usa la clase `.on-dark` en el contenedor).
- Objetivos táctiles ≥ 44×44 px (las opciones del diagnóstico ≥ 56 px de alto).
- SVG decorativos con `aria-hidden="true"`. SVG con significado: `role="img"` + `aria-label` o `<title>`.
- Jerarquía: un solo H1 (hero). Cada sección un H2. Subtítulos H3.
- Animaciones con texto que cambia: el contenido completo debe existir para lectores de pantalla (texto `sr-only` o `aria-live` cuando aporta).
- Enlaces externos (WhatsApp, Facebook) con `target="_blank" rel="noopener noreferrer"` y aviso `sr-only` "(se abre …)".

## 5. Rendimiento (obligatorio)

- Sin librerías de animación (ni Framer Motion ni GSAP). CSS + SVG + un poco de JS con `requestAnimationFrame` solo mientras haya movimiento real.
- Listeners de `pointermove`/`scroll` pasivos y agrupados en un rAF. Nunca leer layout y escribir estilos en el mismo bucle repetidamente.
- Animaciones en bucle: pocas, pequeñas, pausadas fuera de pantalla y en `html.lite`.
- Nada de `filter: blur()` animado, ni `box-shadow` animado, ni máscaras animadas a pantalla completa.
- No reservar alturas con `100vh`; usar `svh`/`dvh` si hace falta y nunca pantalla completa exacta en el hero (dejar asomar la siguiente sección).
- Nada de CLS: reserva espacio (aspect-ratio) para SVG y bloques que cambian de contenido.

## 6. Contrato de la pantalla de carga (`LoadingScreen`)

- El script del head decide si se muestra. Marcado servidor: `<div id="boot" aria-hidden="true">`. Visible solo con `html.is-booting` (CSS en `styles/boot.css`). Oculto por defecto (sin JS nunca aparece).
- Debe tener contenido visible desde el primer fotograma (el logo real visible de inmediato, sin fundido desde 0), porque si todo arranca invisible Chrome retiene la pantalla en blanco.
- Duración total ≤ ~1,4 s: la salida empieza con `html.boot-done` (≈0,95 s) y `html.is-booting` se retira 420 ms después. La salida es un desplazamiento/recorte con `transform`, y en `boot-done` el overlay pasa a `pointer-events:none` de inmediato.
- Animaciones del hero que deban empezar tras la carga: ponlas en pausa con `html.is-booting .tu-clase { animation-play-state: paused }` (con `animation-fill-mode: both`), así arrancan solas cuando la clase se retira. Con `boot-skip` arrancan al cargar.

## 7. Especificación por sección

### 7.1 LoadingScreen — "SISTEMA LISTO"
Fondo `paper` con la cuadrícula técnica muy tenue. Centro: logo real (≈ min(420px, 78vw) de ancho, `priority`). Debajo, un **circuito** de una línea (SVG ancho ≈ igual al logo): una línea horizontal con 4 nodos rombo rotulados en mono `ELECTRICIDAD · AGUA · GAS · HOGAR`. Un pulso recorre la línea de izquierda a derecha (≈600 ms); cada nodo se enciende al paso con su color de sistema. Al llegar al final, el trazo cierra en una pequeña figura de rombo (eco del logo). Rótulo inferior: primero `SOLUCIONES EFICIENTES` (visible desde el inicio, `ink-3`) y luego `● SISTEMA LISTO` (punto verde, texto `green-ink`) hacia los 750 ms. Salida: el panel sube (`translateY(-100%)`) con `--ease-in-out` en 420 ms dejando ver el hero; o una cortina que se abre en franjas horizontales (eco del rombo de franjas) — elige la más limpia y barata. Móvil: mismo diseño escalado; rótulos de nodos pueden reducirse a iniciales si no caben (sin cortar texto).

### 7.2 Navbar
- `position: fixed`, `z-index: 50`, alto `--nav-h`. Arriba del todo: transparente, integrada con el hero (sin borde). Tras ~24 px de scroll: fondo `paper` sólido (≥ 96 % opaco), borde inferior 1px `--line-strong`, logo un poco más pequeño (transición 250 ms de `transform`/`background-color`, sin animar `height` de otros elementos).
- Escritorio (≥1024): logo (alto 52px → 44px compacto) · enlaces Inicio, Servicios, Soluciones, Cobertura, Contacto (Archivo 600, 15px, indicador activo: rombo pequeño + subrayado 2px `violet` según la sección visible; `aria-current="true"` en el activo) · CTA `COTIZAR AHORA` (`.btn-primary`, abre WhatsApp con `DEFAULT_MESSAGE`).
- Móvil/tablet (<1024): logo (alto 40px) · botón compacto `Cotizar` (verde, ≥44px) · botón hamburguesa (44×44, `aria-expanded`, `aria-controls`, etiqueta "Abrir menú"/"Cerrar menú").
- Menú móvil: panel a pantalla completa bajo el header, fondo `paper` con cuadrícula, enlaces grandes `.t-display` (≈ 2rem) numerados 01–05 en mono, y abajo: CTA WhatsApp grande, teléfono (`CallLink`), `MEDELLÍN · MONTERÍA`. Se cierra con: tocar un enlace, Escape, botón X. Bloquea el scroll del body mientras está abierto. Foco atrapado dentro y devuelto al botón al cerrar. Cuidado con contextos de apilamiento: el cajón y su velo deben quedar dentro del mismo contexto del header o el velo POR DEBAJO del header; verifica con `document.elementFromPoint` que cada enlace del menú recibe el toque.
- Debe funcionar con teclado completo.

### 7.3 Hero — "¿QUÉ ESTÁ PASANDO?" → "TRANQUILO. TENEMOS LA SOLUCIÓN."
Estructura (orden del DOM = orden visual en móvil):
1. `SectionTag index="01"` → "Detectar".
2. Pregunta inicial `¿QUÉ ESTÁ PASANDO?` (mono grande o `.t-title`, `ink-3`, con caret parpadeante breve; aparece primero).
3. **H1** (único de la página): `TRANQUILO.` / `TENEMOS LA SOLUCIÓN.` — `.t-display`, `SOLUCIÓN.` en `violet` con una barra/indicador verde de "encendido". Visible y legible aunque no corra ninguna animación.
4. Subtexto `.t-lead`: "Electricidad, plomería, gas y asistencia para tu hogar."
5. CTAs: `COTIZAR POR WHATSAPP` (`WhatsAppLink` primary, mensaje por defecto) y `ENCONTRAR UNA SOLUCIÓN` (`.btn-secondary`, `href="#diagnostico"`, con IconArrowDown). En móvil ambos a ancho completo, apilados.
6. Fila de datos: `CallLink` con `313 894 8186` y `MEDELLÍN · MONTERÍA` (mono, con rombos como separadores).
7. **HomeSystem** (ilustración interactiva, columna derecha en ≥1024; debajo de los CTAs en móvil).

Secuencia de entrada (≈1,3 s, arranca al terminar la carga; con `boot-skip` empieza enseguida y más corta): la pregunta aparece (0 ms) → el sistema muestra una **anomalía** (un nodo parpadea en color de alerta *gas-glow/ámbar* y un rótulo `DETECTANDO…`) → un **barrido horizontal de franjas** recorre la casa de arriba abajo (eco del logo) → el H1 entra con un deslizamiento corto (no desde opacidad 0 total: usa `clip-path`/`translate` para no retrasar el LCP más de lo necesario) → el nodo vuelve a verde y el rótulo cambia a `SISTEMA LISTO`. Con `rm`: todo estático en estado final.

Altura: no 100svh exacto. Contenido anclado desde ARRIBA (no `mt-auto`), con `padding-top: calc(var(--nav-h) + …)`. En escritorio ≈ `min(100svh - 40px, 900px)` y que asome el borde de la sección siguiente.

### 7.4 HomeSystem — el sistema del hogar
SVG propio (viewBox sugerido 0 0 600 540), trazado técnico limpio:
- **Techo**: la mitad superior de un rombo hecho de franjas horizontales (como el logo), en `violet` con opacidad moderada; las franjas se pueden "escanear" (encenderse en secuencia).
- **Casa**: muros y entrepiso con trazo 1.5px `ink`, suelo que se extiende a los lados. Particiones mínimas (2–3 líneas) que sugieren cocina, baño y sala.
- **Energía** (`electric`): desde un tablero (pequeño rectángulo en el muro izquierdo) recorrido ortogonal con esquinas suaves hacia 2–3 luminarias (círculos en el techo) y tomas (rectángulos pequeños). Un **pulso** (segmento corto brillante con `stroke-dasharray` + `stroke-dashoffset`) recorre el circuito.
- **Agua** (`water`): tubería desde abajo/derecha (acometida) que sube a baño y cocina; trazo de 3px estilo tubo (línea gruesa clara + línea fina interior). **Flujo**: guiones que avanzan continuamente, más lentos.
- **Gas** (`gas`): línea fina discontinua desde un medidor exterior (cajita en el muro derecho) hasta la estufa (quemador: círculo con 3 llamitas mínimas). Movimiento muy lento, cálido y sutil.
- **Hogar**: el anillo verde de encendido (eco del logo) como nodo principal del sistema; ~10–14 nodos (círculos r≈4) en uniones.
- **Rótulos**: `01 ENERGÍA`, `02 AGUA`, `03 GAS`, `04 HOGAR` en mono con líneas guía. Como HTML posicionado en % sobre el SVG (para que el tamaño de letra no baje de 11–12px). En móvil, reemplazar por una leyenda debajo (4 ítems con muestra de trazo de color).
- Lectura de estado arriba a la derecha: `ESTADO: DETECTANDO…` → `ESTADO: SISTEMA LISTO` (sin cifras inventadas).

Interacción con el puntero (solo `(hover:hover) and (pointer:fine)`, sin `rm` ni `lite`):
- Parallax ligero por capas (cuadrícula −, casa 0, circuitos +, rótulos ++), máximo ±12px, con interpolación suave (lerp) en un rAF que se detiene cuando converge.
- Un halo radial tenue (div con gradiente, movido con `transform`) sigue al cursor.
- Los nodos a menos de ~90px del cursor se iluminan (escala 1.6 + color del sistema). Solo cambia atributos cuando cambia el estado.
- Al pasar sobre un circuito (o su rótulo), ese sistema se resalta y los demás se atenúan (por color/opacidad de trazo, no de texto).
Táctil: animación automática ligera (pulsos y nodos encendiéndose en secuencia, CSS). Todo en pausa fuera de pantalla.
Accesibilidad: el SVG es `role="img"` con `aria-label` descriptivo ("Esquema de una casa con sus sistemas de electricidad, agua, gas y hogar conectados") y los rótulos HTML `aria-hidden`.

### 7.5 Diagnostic — "ALGO NO ESTÁ FUNCIONANDO." (la parte más importante)
Cabecera de sección: `SectionTag index="02"` "Entender" · H2 `ALGO NO ESTÁ FUNCIONANDO.` · texto: "Cuéntanos qué sucede y te ayudamos a encontrar la solución."

**Paso 1 — `¿QUÉ NECESITAS?`** (selector de servicio, NO tarjetas aburridas): 4 opciones grandes (`button`, `data-service="<id>"`), cada una con: índice `01`, ícono animable del sistema, nombre (`ELECTRICIDAD`, `PLOMERÍA`, `GAS`, `ASISTENCIA PARA EL HOGAR`), y la pregunta humana de `SYSTEMS[i].question`. Escritorio: 4 columnas altas (≈ 280px) unidas como un panel (bordes compartidos, no tarjetas separadas con sombra). Móvil: lista de 4 filas anchas (≥ 76px) o grilla 2×2 con tap fácil.
Hover/foco: el fondo pasa de `paper` a `night` con un barrido (transform de un pseudo-elemento), el texto a `mist`, el ícono responde con su microanimación (rayo que chispea, gota con onda, llama que fluye, casa que se dibuja) y aparece el patrón del sistema en el fondo (líneas eléctricas / ondas / flujo / contorno de casa) en el color *glow*. Clic: elige el servicio y la interfaz se transforma en la consola de diagnóstico (paso 2) con ese servicio ya cargado.

**Consola de diagnóstico**: panel `night` con `.ticks`, como un equipo de medición. Partes:
- Barra superior: `DIAGNÓSTICO` · `PASO n/5` · 5 segmentos de progreso que se encienden en verde. Botón `Atrás` (≥44px) y opción `Reiniciar`.
- Columna lateral (escritorio) / bloque superior plegado (móvil) **"Lectura"**: resumen vivo `SERVICIO · PROBLEMA · LUGAR · CIUDAD` (— si falta; ✓ verde si ya está), cada línea es un botón para volver a ese paso. Incluye un mini "osciloscopio" SVG con el patrón del sistema elegido (cambia según el servicio: zigzag eléctrico / onda de agua / flujo de gas / contorno de casa).
- Área de pregunta (cambia con transición horizontal corta, 250 ms, respetando `rm`):
  - Paso 2 `¿QUÉ ESTÁ PASANDO?` — `DIAGNOSTIC.problems` reordenados con `DIAGNOSTIC.problemOrder[servicio]` (todas las opciones siguen visibles).
  - Paso 3 `¿DÓNDE ESTÁ OCURRIENDO?` — `DIAGNOSTIC.places`.
  - Paso 4 `¿EN QUÉ CIUDAD?` — Medellín / Montería (dos opciones grandes).
  - Paso 5 `CUÉNTANOS UN POCO MÁS` — `textarea` obligatoria (etiqueta visible "Describe lo que pasa", ayuda "Por ejemplo: dónde está, desde cuándo pasa o qué ya intentaste.", mínimo 10 caracteres, contador) + campo opcional "¿Cómo te llamas? (opcional)" (`autocomplete="given-name"`). Botón `VER RESUMEN`.
- Las opciones de un solo toque avanzan solas (≈180 ms después de marcar la selección, para que se vea el ✓). Son `button` con `aria-pressed`, o radios reales estilizados dentro de un `fieldset` con `legend` (preferible: `fieldset` + `legend` + inputs radio visualmente ocultos y etiquetas grandes; tecla Enter/Espacio funciona).
- **Resultado**: `TENEMOS UNA IDEA DE LO QUE NECESITAS.` + ficha resumen (Servicio, Problema, Lugar, Ciudad, Detalles, Nombre si lo dio) con botón "Editar" por línea + botón grande `HABLAR CON UN ASESOR` (`.btn-primary .btn-lg`, ícono WhatsApp). Es un `<a href={whatsappUrl(diagnosticMessage(...))} target="_blank">` real, actualizado en vivo.
- **Validación**: no se puede llegar a WhatsApp con Servicio, Problema, Lugar, Ciudad o Descripción vacíos. Si faltan, el clic en el CTA hace `preventDefault`, muestra un resumen de error (`role="alert"`) con enlaces a cada paso pendiente y enfoca el primero. Error de descripción junto al campo (`aria-describedby`, `aria-invalid`). Validar al enviar/avanzar, no a cada tecla; al corregir, el error se limpia en `input` (no en `blur`, para no mover el botón bajo el dedo).
- **Estados**: `idle` → al hacer clic válido: `sending` (texto del botón "Abriendo WhatsApp…" + punto pulsante, sin bloquear la navegación del enlace) → `sent` tras ~700 ms: mensaje de éxito "Listo. Te abrimos WhatsApp con tu mensaje." + "¿No se abrió? Abrir WhatsApp de nuevo" (enlace) + "Copiar mensaje" (portapapeles, con estado copiado / error) + "Empezar otro diagnóstico". `error`: si falla la validación (ver arriba) o si el portapapeles falla ("No pudimos copiar. Mantén presionado el texto para copiarlo."). Región `aria-live="polite"` para anunciar los cambios de estado.
- El estado vive en el componente (sin `localStorage`). Al reiniciar, vuelve al paso 1 y hace scroll suave a la sección.
- Móvil es prioridad: opciones en una columna o 2 columnas con alto ≥ 56px, texto ≥ 16px (evita zoom de iOS), botón Atrás siempre visible, el teclado no tapa el CTA (el botón flotante de WhatsApp se esconde cuando un campo tiene foco: emite `document.documentElement.dataset.inputFocus = '1'`/borra al salir, o simplemente que WhatsAppButton escuche `focusin`/`focusout` de inputs y textareas).
- Con JS deshabilitado: el paso 1 debe mostrar al menos un enlace funcional a WhatsApp (p. ej. el texto "¿Prefieres escribir directo? Hablar por WhatsApp").

### 7.6 Systems — "UN HOGAR. CUATRO SISTEMAS."
H2: `UN HOGAR.` / `CUATRO SISTEMAS.` + texto corto ("Electricidad, agua, gas y soporte. Cuando uno falla, toda la casa lo siente."). Esta sección también es la sección informativa de servicios (no repetirla en otra parte).
- **Stage** (panel `night` ancho, ≈ 260–320px de alto en escritorio, ≈ 180px en móvil): una sola línea SVG (≈ 64 puntos) que se **transforma** entre 4 formas: ENERGÍA = traza eléctrica en escalones/zigzag; AGUA = onda suave con doble línea tipo tubería; GAS = flujo largo y tenue con guiones; SOPORTE = contorno de una casa (techo en pico). Interpolación de puntos con easing en ≈ 700 ms (rAF solo durante el morph) + cambio de color al color *glow* del sistema. Encima del trazo, un pulso/guiones fluyen (CSS, pausado fuera de pantalla). Rótulo grande del índice y sistema activo: `01 / ENERGÍA`.
- **Columnas** (≥768: 4 columnas en fila, unidas como panel; <768: bloques apilados): cada sistema con índice `01`, sistema (`ENERGÍA`), nombre del servicio como H3 (`Electricidad`), línea (`SYSTEMS[i].line`), lista de servicios (`SYSTEMS[i].services`, viñetas en rombo) y un enlace `.link-arrow` "Solicitar servicio" que abre WhatsApp con `serviceMessage(id)` (con sr-only "de electricidad" para que cada enlace sea único).
- Selección: en escritorio hover/foco sobre una columna → el stage se transforma a ese sistema; además rotación automática cada ~3,5 s mientras la sección está en pantalla y nadie interactúa (se detiene al primer hover/foco/clic, y con `rm`). En móvil: el stage es `position: sticky` (top = `--nav-h`) dentro de la sección y el bloque que cruza el centro de la pantalla define el sistema activo (scroll), así la línea se transforma al bajar. Ojo: `sticky` falla si un ancestro tiene `overflow:hidden`; usa `overflow-x: clip` si necesitas recortar.
- La columna activa se marca (borde superior 3px del color del sistema + fondo `paper`).
- Transiciones entre sistemas: la transformación de la línea ES la transición (eléctrica → tubería → gas → contorno de casa).

### 7.7 NotOnlyFix — "NO SOLO ARREGLAMOS."
Sección `night` a ancho completo (con `.on-dark`), `id="solucionamos"`, `SectionTag index="03" tone="dark"` "Solucionar".
- H2 `NO SOLO ARREGLAMOS.` (mist).
- Pila vertical de palabras gigantes `.t-display`: `ARREGLAMOS` · `AYUDAMOS` · `RESOLVEMOS` · `SOLUCIONAMOS.` conectadas por un cable vertical a la izquierda con un nodo rombo por palabra. Al entrar en pantalla (una vez), un pulso baja por el cable y va encendiendo cada palabra (de `mist-3` a `mist`), dejando las anteriores en `mist-3`; termina en `SOLUCIONAMOS.` que queda en `green` con el anillo de encendido iluminado (≈ 1,8 s en total). Con `rm`/sin JS: estado final visible (las tres primeras en `mist-3`, la última en `green`).
- Para lectores de pantalla: la pila es `aria-hidden` y hay un texto `sr-only`: "No solo arreglamos: ayudamos, resolvemos y solucionamos."
- Subtexto: "Soluciones eficientes para las necesidades de tu hogar." + CTA `NECESITO AYUDA` (`WhatsAppLink` primary, mensaje por defecto).
- Escritorio: H2 + subtexto + CTA a la izquierda, pila a la derecha. Móvil: H2, pila, subtexto, CTA. Palabras sin desbordar a 360px (ajusta con clamp; `SOLUCIONAMOS.` es la más larga).

### 7.8 Coverage — "ESTAMOS DONDE NOS NECESITAS."
Fondo `paper`. H2 `ESTAMOS DONDE` / `NOS NECESITAS.` + texto: "Atendemos en Medellín y Montería." Composición: dos nodos-ciudad conectados por un enlace (línea con un pulso que viaja en ambos sentidos). Montería arriba-izquierda, Medellín abajo-derecha (orientación geográfica real, sin mapa). Cada ciudad: nombre enorme `.t-display`, departamento (`CITIES[i].region`), coordenadas en mono (`CITIES[i].coords`), nodo rombo con anillo, y un botón secundario "Cotizar en Medellín" / "Cotizar en Montería" (WhatsApp con `cityMessage(id)`). Sin mapas, sin barrios, sin direcciones, sin "y alrededores". Móvil: apilado vertical con el enlace como línea vertical entre ambas.

### 7.9 Contact — "¿TIENES UN PROBLEMA? HABLEMOS."
CTA final con transición visual fuerte: el contenedor `paper` deja ver un panel `night` que se **revela en forma de rombo** desde el centro hasta cubrir todo al entrar en pantalla (CSS scroll-driven: `animation-timeline: view()` + `clip-path: polygon(...)`, dentro de `@supports (animation-timeline: view())` y fuera de `rm`; sin soporte → panel completo visible). Dentro (`.on-dark`): H2 `¿TIENES UN PROBLEMA?` / `HABLEMOS.` (`HABLEMOS.` en `green`), texto "Cuéntanos qué necesitas y encontraremos la mejor manera de ayudarte.", botón enorme `HABLAR POR WHATSAPP` (`.btn-primary .btn-lg`, a ancho completo en móvil), debajo `313 894 8186` como `CallLink` grande, y Facebook (enlace con ícono, "Síguenos en Facebook", sr-only "(se abre Facebook)"). Enlace secundario pequeño: "¿Prefieres que te guiemos? Haz el diagnóstico" → `#diagnostico`. El anillo de encendido verde como motivo grande de fondo (trazo fino, decorativo).

### 7.10 WhatsAppButton (flotante)
- Círculo verde 56px (60px en móvil) con el glifo de WhatsApp en `ink`, abajo a la derecha con `env(safe-area-inset-bottom)` y `right: max(16px, env(safe-area-inset-right))`. En escritorio, al hover se despliega una etiqueta "Cotizar por WhatsApp" a la izquierda (no tapa contenido; `aria-label` siempre presente).
- Aparece (fade+scale) cuando el hero ya no está en pantalla (para no duplicar el CTA del hero) y se oculta cuando la sección `#contacto` o el footer están visibles (allí hay CTAs grandes), cuando el menú móvil está abierto y cuando un `input`/`textarea` tiene foco en móvil.
- `z-index` 40 (debajo del navbar 50 y del menú). Debe dejar libre el contenido: el footer tiene padding inferior suficiente.

### 7.11 Footer
Claro (`paper-2`), compacto. Logo real (alto ≈ 72px), `ELÉCTRICOS Y PLOMEROS` / `SOLUCIONES EFICIENTES` en `.t-label`. Columnas: Servicios (Electricidad, Plomería, Gas, Asistencia para el hogar — enlazan a `#servicios`), Ciudades (Medellín, Montería — a `#cobertura`), Contacto (`CallLink`, WhatsApp, Facebook). Línea final: `© 2026 Eléctricos y Plomeros · Soluciones Eficientes` (año fijo 2026: nada de `new Date()` en servidor) + "Volver arriba" (`#inicio`). Padding inferior para que el botón flotante no tape nada.

### 7.12 CircuitRail (solo ≥ 1440px)
Riel vertical fijo en el margen izquierdo (fuera del contenedor de 1320px): línea de 1px `--line-strong` del 20 % al 80 % de la altura de la ventana, con 3 nodos rombo rotulados en mono vertical: `01 DETECTAR`, `02 ENTENDER`, `03 SOLUCIONAR`. Un relleno `violet` crece con el progreso del scroll (CSS `animation-timeline: scroll(root)`, `transform: scaleY`). Cada nodo se enciende cuando su sección (`#inicio`, `#diagnostico`, `#solucionamos`) está en pantalla (puede ser con `view-timeline-name` + `timeline-scope` en CSS, o un IntersectionObserver ligero). `aria-hidden="true"`. Debajo de 1440px no existe (`display:none`). Sin soporte de scroll-driven: riel estático.

## 8. Verificación visual (cada agente, sobre su sección)

Hay un servidor de desarrollo en `http://localhost:5470/` (no lo arranques, no hagas `next build`, no borres `.next`). Captura con:

```
node scripts/qa/shot.mjs --w 1440 --h 900 --selector "#diagnostico" --out C:/Users/Lenovo/AppData/Local/Temp/claude/ep-shots/<agente>-desk.png
node scripts/qa/shot.mjs --w 390 --h 844 --mobile --selector "#diagnostico" --out .../<agente>-mob.png
node scripts/qa/shot.mjs --w 768 --h 1024 --mobile --selector "#diagnostico" --out .../<agente>-tab.png
node scripts/qa/shot.mjs ... --click "[data-service=plomeria]" --wait 800   (interacciones)
node scripts/qa/shot.mjs ... --reduced     (movimiento reducido)
node scripts/qa/shot.mjs ... --hover 1000,420   (puntero)
node scripts/qa/shot.mjs ... --boot --boot-shots 50,300,700,1100,1500 (pantalla de carga)
```

Ejecuta los comandos desde la carpeta del proyecto. Lee las capturas con la herramienta Read y critica como director de arte: jerarquía, alineación a la retícula, aire, contraste, que nada se corte, que nada desborde (el JSON imprime `overflow.offenders`), consola sin errores. Itera hasta que se vea de agencia premium. Verifica también 360px de ancho.

Chequeos de código: `npx tsc --noEmit` y `npx eslint <tus archivos>` deben pasar sin errores.

## 9. Propietarios de archivos

| Agente | Archivos (solo estos) | Prefijo CSS |
|---|---|---|
| boot-nav | `components/LoadingScreen.tsx`, `components/Navbar.tsx`, `components/WhatsAppButton.tsx`, `components/Footer.tsx`, `components/CircuitRail.tsx`, `styles/boot.css`, `styles/nav.css` | `boot-`, `nav-`, `wa-`, `ft-`, `rail-` |
| hero | `components/Hero.tsx`, `components/HomeSystem.tsx`, `styles/hero.css` (+ archivos nuevos `components/hero/*`) | `hero-`, `hs-` |
| diagnostic | `components/Diagnostic.tsx`, `components/diagnostic/*` (nuevos), `styles/diagnostic.css` | `dx-` |
| systems | `components/Systems.tsx`, `components/systems/*`, `lib/systemShapes.ts` (nuevos), `styles/systems.css` | `sys-` |
| sections | `components/NotOnlyFix.tsx`, `components/Coverage.tsx`, `components/Contact.tsx`, `components/sections/*` (nuevos), `styles/sections.css` | `nf-`, `cov-`, `ct-` |
