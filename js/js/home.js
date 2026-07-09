/* ==========================================================
   Vista #home
   ========================================================== */

window.Views = window.Views || {};

window.Views.home = async function (container) {
  // ---- Hero (no depende de la API) ----
  const hero = document.createElement("section");
  hero.className = "hero";

  const h1 = document.createElement("h1");
  h1.textContent = "Explora la colección del Met";

  const p = document.createElement("p");
  p.textContent =
    "Casi 470,000 obras de arte del Metropolitan Museum of Art, de todas las épocas y culturas, a un clic de distancia.";

  hero.appendChild(h1);
  hero.appendChild(p);
  container.appendChild(hero);

  // ---- Contenedor de estadísticas ----
  const statsWrap = document.createElement("div");
  statsWrap.className = "container";
  container.appendChild(statsWrap);
  loadStats(statsWrap);

  // ---- Contenedor de galería destacada ----
  const gallerySection = document.createElement("section");
  gallerySection.className = "container section";

  const title = document.createElement("div");
  title.className = "section-title";
  const h2 = document.createElement("h2");
  h2.textContent = "Obras destacadas";
  title.appendChild(h2);
  gallerySection.appendChild(title);

  const galleryBody = document.createElement("div");
  gallerySection.appendChild(galleryBody);
  container.appendChild(gallerySection);

  loadHighlightGallery(galleryBody);
};

async function loadStats(wrap) {
  wrap.innerHTML = "";
  const loading = document.createElement("met-loading-state");
  loading.setAttribute("message", "Calculando estadísticas...");
  wrap.appendChild(loading);

  try {
    const [departments, highlightWithImages, highlightAll] = await Promise.all([
      MetAPI.getDepartments(),
      MetAPI.search({ isHighlight: true, hasImages: true }),
      MetAPI.search({ isHighlight: true }),
    ]);

    wrap.innerHTML = "";
    const statsGrid = document.createElement("div");
    statsGrid.className = "stats";

    statsGrid.appendChild(
      statCard(departments.length, "Departamentos curatoriales")
    );
    statsGrid.appendChild(
      statCard(highlightWithImages.total.toLocaleString("es"), "Obras destacadas con imagen")
    );
    statsGrid.appendChild(
      statCard(highlightAll.total.toLocaleString("es"), "Total de obras destacadas")
    );

    wrap.appendChild(statsGrid);
  } catch (err) {
    wrap.innerHTML = "";
    const errBox = document.createElement("met-error-state");
    errBox.setAttribute("message", "No se pudieron cargar las estadísticas.");
    errBox.onRetry = () => loadStats(wrap);
    wrap.appendChild(errBox);
  }
}

function statCard(number, label) {
  const card = document.createElement("div");
  card.className = "stat-card";

  const num = document.createElement("span");
  num.className = "stat-number";
  num.textContent = number;

  const lbl = document.createElement("span");
  lbl.className = "stat-label";
  lbl.textContent = label;

  card.appendChild(num);
  card.appendChild(lbl);
  return card;
}

async function loadHighlightGallery(wrap) {
  wrap.innerHTML = "";
  const loading = document.createElement("met-loading-state");
  loading.setAttribute("message", "Cargando obras destacadas...");
  wrap.appendChild(loading);

  try {
    const { objectIDs } = await MetAPI.search({ isHighlight: true, hasImages: true });
    const idsToLoad = objectIDs.slice(0, 12);

    const { objects, failed } = await MetAPI.resolveObjects(idsToLoad);

    wrap.innerHTML = "";

    if (objects.length === 0) {
      const errBox = document.createElement("met-error-state");
      errBox.setAttribute("message", "No se pudo cargar ninguna obra destacada.");
      errBox.onRetry = () => loadHighlightGallery(wrap);
      wrap.appendChild(errBox);
      return;
    }

    const gallery = document.createElement("div");
    gallery.className = "gallery";
    objects.forEach((w) => {
      const card = document.createElement("met-work-card");
      card.work = w;
      gallery.appendChild(card);
    });
    wrap.appendChild(gallery);

    if (failed > 0) {
      const note = document.createElement("p");
      note.className = "gallery-note";
      note.textContent = `${failed} obra(s) no se pudieron cargar y fueron omitidas.`;
      wrap.appendChild(note);
    }
  } catch (err) {
    wrap.innerHTML = "";
    const errBox = document.createElement("met-error-state");
    errBox.setAttribute("message", "No se pudo conectar con la API del museo.");
    errBox.onRetry = () => loadHighlightGallery(wrap);
    wrap.appendChild(errBox);
  }
}
