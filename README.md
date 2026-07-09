# MetHub — Explorador de la Colección del Met Museum

Proyecto en pareja para la materia de Ingeniería en Computación (7mo trimestre).
SPA hecha en HTML, CSS y JavaScript vanilla que consume la API pública del
Metropolitan Museum of Art.

## Integrantes y división del trabajo

- **Estudiante A:** [Nombre completo] — vistas `#explore` (filtros + agregados) y `#detail/:id`.
- **Estudiante B:** [Nombre completo] — vistas `#departments` y `#artist/:name`.
- **En pareja:** vista `#home`, router de hash, componentes base (`met-navbar`,
  `met-loading-state`, `met-error-state`), capa de fetch (`api.js`), estilos globales
  y vista `#compare`.

> Reemplazar los nombres antes de entregar. El reparto real de commits debe reflejar
> esta división en el historial de Git.

## Cómo correr el proyecto

No requiere servidor ni instalación de dependencias.

1. Descargar/clonar la carpeta del proyecto.
2. Abrir el archivo `index.html` directamente en el navegador (doble clic o
   arrastrarlo a una pestaña).
3. Listo. La app consume la API del Met en vivo, así que se necesita conexión a
   internet para ver los datos.

Si el navegador bloquea algo por CORS o por abrir el archivo con `file://`, probar
con otro navegador (Chrome y Firefox no deberían tener problema con esta API en
particular, ya que permite peticiones desde cualquier origen).

## Estructura del proyecto

```
index.html
css/
  styles.css
js/
  api.js                  → capa de acceso a la API (fetch, timeout, search, resolución en paralelo)
  router.js                → router basado en hash (#home, #explore, #detail/:id, etc.)
  app.js                    → arranque de la app
  components/
    navbar.js               → <met-navbar>
    footer.js                → <met-footer>
    loading-state.js         → <met-loading-state>
    error-state.js            → <met-error-state>
    work-card.js               → <met-work-card>
  views/
    home.js         → #home
    explore.js        → #explore
    detail.js           → #detail/:id
    departments.js        → #departments
    artist.js                → #artist/:name
    compare.js                 → #compare
```

## Componentes implementados

- **`met-navbar`**: barra de navegación fija, resalta la vista activa según el hash.
- **`met-footer`**: créditos y aviso de la fuente de datos (Met Museum Open Access API).
- **`met-loading-state`**: spinner + mensaje, se usa en todas las peticiones asíncronas.
- **`met-error-state`**: mensaje de error con botón "Reintentar" configurable vía
  la propiedad `onRetry`.
- **`met-work-card`**: tarjeta de obra reutilizada en `#home`, `#explore` y
  `#artist/:name`; recibe el objeto de la obra a través de la propiedad `work`.

## Decisiones técnicas

- **Router:** hash routing manual (`window.location.hash` + evento `hashchange`),
  sin librerías. Soporta parámetros de ruta (`#detail/123`, `#artist/Nombre`) y
  query string simple para filtros (`#explore?departmentId=5`, `#compare?from=123`).
- **Capa de fetch centralizada (`api.js`):** todas las peticiones pasan por acá.
  Se usa `AbortController` con timeout de 10s para evitar peticiones colgadas, y
  una función `resolveObjects()` que envuelve `Promise.allSettled` para resolver
  varios `objectID` en paralelo sin que un solo error tumbe toda la vista.
- **Agregados de `#explore`:** como el endpoint `/search` solo devuelve IDs, los
  agregados (departamento dominante, siglo más frecuente, cultura más frecuente)
  se calculan sobre las 12 obras cargadas en la página actual, no sobre el total.
  Esto se indica con una nota debajo del panel.
- **Sin innerHTML para datos de la API:** todo el DOM que depende de datos del Met
  se construye con `createElement` / `textContent` / `appendChild`, tal como pide
  el requerimiento RNF-07. `innerHTML = ""` se usa únicamente para limpiar
  contenedores antes de re-renderizar, nunca para insertar datos.
- **Custom Elements sin ciclo de vida completo:** los componentes se registran con
  `customElements.define` pero la construcción del contenido se hace en
  `connectedCallback` o mediante un setter (`work-card.work = objeto`), sin usar
  Shadow DOM, para mantener las cosas simples y que los estilos globales de
  `styles.css` les apliquen directamente.
- **Comparador (`#compare`):** cada panel maneja su propio estado de búsqueda con
  debounce de 400ms. Se guarda el `objectID` seleccionado en cada panel para poder
  bloquear la selección duplicada del lado contrario.

## Cosas que se podrían mejorar a futuro

- Persistir el estado de filtros de `#explore` al navegar a `#detail` y volver
  (por ahora el botón "← Volver" usa `history.back()`, que regresa a la vista
  anterior pero recalcula la búsqueda desde cero).
- Cachear objetos ya resueltos para no volver a pedirlos si el usuario navega
  entre obras ya vistas.
- Agregar retries automáticos con backoff (no era obligatorio según el
  requerimiento RNF).

## Capturas de pantalla

_Pendiente: agregar acá una captura de cada una de las seis vistas
(`#home`, `#explore`, `#detail/:id`, `#departments`, `#artist/:name`, `#compare`)
antes de la entrega final, tal como pide el documento de requerimientos._

## Aviso de datos

Datos provistos por la Open Access API del Metropolitan Museum of Art. Esta
aplicación no está afiliada al museo. Las imágenes pueden tener restricciones de
uso comercial; este proyecto se realizó únicamente con fines educativos.
