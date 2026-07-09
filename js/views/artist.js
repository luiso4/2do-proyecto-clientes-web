/* ==========================================================
   Vista #artist/:name
   ========================================================== */

window.Views = window.Views || {};

window.Views.artist = async function (container, { name }) {
  const state = { objectIDs: [], total: 0, page: 1 };
  const PAGE_SIZE = 12;

  const wrap = document.createElement("div");
  wrap.className = "container";
  container.appendChild(wrap);

  const back = document.createElement("a");
  back.href = "#";
  back.className = "back-link";
  back.textContent = "← Volver";
  back.addEventListener("click", (e) => {
    e.preventDefault();
    window.history.back();
  });
  wrap.appendChild(back);

  const header = document.createElement("div");
  header.className = "artist-header";
  const h1 = document.createElement("h1");
  h1.textContent = name;
  const countEl = document.createElement("p");
  countEl.className = "artist-count";
  countEl.textContent = "Buscando obras...";
  const bioEl = document.createElement("p");
  bioEl.className = "detail-bio";
  header.appendChild(h1);
  header.appendChild(countEl);
  header.appendChild(bioEl);
  wrap.appendChild(header);

  const gallerySection = document.createElement("section");
  gallerySection.className = "section";
  const galleryWrap = document.createElement("div");
  const paginationWrap = document.createElement("div");
  gallerySection.appendChild(galleryWrap);
  gallerySection.appendChild(paginationWrap);
  wrap.appendChild(gallerySection);

  await runSearch();

  async function runSearch() {
    galleryWrap.innerHTML = "";
    const loading = document.createElement("met-loading-state");
    loading.setAttribute("message", "Buscando obras del artista...");
    galleryWrap.appendChild(loading);

    try {
      const result = await MetAPI.search({ q: name, artistOrCulture: true });
      state.objectIDs = result.objectIDs;
      state.total = result.total;
      countEl.textContent = `${state.total} obra(s) encontradas en la colección`;
      await loadPage();
    } catch (err) {
      galleryWrap.innerHTML = "";
      countEl.textContent = "";
      const errBox = document.createElement("met-error-state");
      errBox.setAttribute("message", "No se pudo buscar obras de este artista.");
      errBox.onRetry = runSearch;
      galleryWrap.appendChild(errBox);
    }
  }

  async function loadPage() {
    galleryWrap.innerHTML = "";
    paginationWrap.innerHTML = "";

    if (state.objectIDs.length === 0) {
      const empty = document.createElement("p");
      empty.className = "empty-msg";
      empty.textContent = "No se encontraron obras asociadas a este artista.";
      galleryWrap.appendChild(empty);
      return;
    }

    const loading = document.createElement("met-loading-state");
    loading.setAttribute("message", "Cargando obras...");
    galleryWrap.appendChild(loading);

    const start = (state.page - 1) * PAGE_SIZE;
    const pageIds = state.objectIDs.slice(start, start + PAGE_SIZE);

    try {
      const { objects, failed } = await MetAPI.resolveObjects(pageIds);
      galleryWrap.innerHTML = "";

      // si todavía no mostramos bio, buscamos una en esta página
      if (!bioEl.textContent) {
        const withBio = objects.find((o) => o.artistDisplayBio && o.artistDisplayBio.trim());
        if (withBio) bioEl.textContent = withBio.artistDisplayBio;
      }

      const gallery = document.createElement("div");
      gallery.className = "gallery";
      objects.forEach((w) => {
        const card = document.createElement("met-work-card");
        card.work = w;
        gallery.appendChild(card);
      });
      galleryWrap.appendChild(gallery);

      if (failed > 0) {
        const note = document.createElement("p");
        note.className = "gallery-note";
        note.textContent = `${failed} obra(s) de esta página no se pudieron cargar y fueron omitidas.`;
        galleryWrap.appendChild(note);
      }

      renderPagination();
    } catch (err) {
      galleryWrap.innerHTML = "";
      const errBox = document.createElement("met-error-state");
      errBox.setAttribute("message", "No se pudo cargar esta página.");
      errBox.onRetry = loadPage;
      galleryWrap.appendChild(errBox);
    }
  }

  function renderPagination() {
    paginationWrap.innerHTML = "";
    const totalPages = Math.max(1, Math.ceil(state.objectIDs.length / PAGE_SIZE));

    const nav = document.createElement("div");
    nav.className = "pagination";

    const prevBtn = document.createElement("button");
    prevBtn.textContent = "Anterior";
    prevBtn.disabled = state.page <= 1;
    prevBtn.addEventListener("click", () => {
      state.page -= 1;
      loadPage();
    });

    const indicator = document.createElement("span");
    indicator.textContent = `Página ${state.page} de ${totalPages}`;

    const nextBtn = document.createElement("button");
    nextBtn.textContent = "Siguiente";
    nextBtn.disabled = state.page >= totalPages;
    nextBtn.addEventListener("click", () => {
      state.page += 1;
      loadPage();
    });

    nav.appendChild(prevBtn);
    nav.appendChild(indicator);
    nav.appendChild(nextBtn);
    paginationWrap.appendChild(nav);
  }
};
