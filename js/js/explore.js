/* ==========================================================
   Vista #explore
   Búsqueda con filtros + agregados en vivo + paginación.
   ========================================================== */

window.Views = window.Views || {};

const CURRENT_YEAR = new Date().getFullYear();
const PAGE_SIZE = 12;

window.Views.explore = async function (container, { query } = {}) {
  const state = {
    filters: {
      q: "",
      departmentId: query && query.departmentId ? query.departmentId : "",
      isHighlight: false,
      hasImages: false,
      yearMin: -3000,
      yearMax: CURRENT_YEAR,
    },
    objectIDs: [],
    total: 0,
    page: 1,
  };

  const wrap = document.createElement("div");
  wrap.className = "container section explore-layout";

  // -------- sidebar (filtros + agregados) --------
  const sidebar = document.createElement("div");
  sidebar.className = "explore-sidebar";

  const filtersPanel = document.createElement("div");
  filtersPanel.className = "filters-panel";
  sidebar.appendChild(filtersPanel);

  const aggPanel = document.createElement("div");
  aggPanel.className = "aggregates-panel";
  sidebar.appendChild(aggPanel);

  // -------- área principal (galería + paginación) --------
  const main = document.createElement("div");
  const galleryWrap = document.createElement("div");
  const paginationWrap = document.createElement("div");
  main.appendChild(galleryWrap);
  main.appendChild(paginationWrap);

  wrap.appendChild(sidebar);
  wrap.appendChild(main);
  container.appendChild(wrap);

  buildFiltersPanel(filtersPanel);
  buildAggregatesPanel(aggPanel);

  await populateDepartments(filtersPanel, state);

  runSearch();

  // ---------------------------------------------------------
  function buildFiltersPanel(panel) {
    const h3 = document.createElement("h3");
    h3.textContent = "Filtros";
    panel.appendChild(h3);

    // búsqueda por texto
    const qGroup = document.createElement("div");
    qGroup.className = "filter-group";
    const qLabel = document.createElement("label");
    qLabel.textContent = "Buscar por palabra clave";
    const qInput = document.createElement("input");
    qInput.type = "text";
    qInput.placeholder = "ej: vasija, retrato, samurai...";
    qGroup.appendChild(qLabel);
    qGroup.appendChild(qInput);
    panel.appendChild(qGroup);

    let debounceTimer;
    qInput.addEventListener("input", () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        state.filters.q = qInput.value;
        state.page = 1;
        runSearch();
      }, 400);
    });

    // departamento (el select se llena en populateDepartments)
    const deptGroup = document.createElement("div");
    deptGroup.className = "filter-group";
    const deptLabel = document.createElement("label");
    deptLabel.textContent = "Departamento";
    const deptSelect = document.createElement("select");
    deptSelect.id = "explore-dept-select";
    deptGroup.appendChild(deptLabel);
    deptGroup.appendChild(deptSelect);
    panel.appendChild(deptGroup);

    deptSelect.addEventListener("change", () => {
      state.filters.departmentId = deptSelect.value;
      state.page = 1;
      runSearch();
    });

    // rango de años (doble slider)
    const yearGroup = document.createElement("div");
    yearGroup.className = "filter-group";
    const yearLabel = document.createElement("label");
    yearLabel.textContent = "Rango de años";
    yearGroup.appendChild(yearLabel);

    const yearValues = document.createElement("div");
    yearValues.className = "year-range-values";
    const minSpan = document.createElement("span");
    const maxSpan = document.createElement("span");
    yearValues.appendChild(minSpan);
    yearValues.appendChild(maxSpan);
    yearGroup.appendChild(yearValues);

    const rangeBox = document.createElement("div");
    rangeBox.className = "range-double";

    const rangeMin = document.createElement("input");
    rangeMin.type = "range";
    rangeMin.min = "-3000";
    rangeMin.max = String(CURRENT_YEAR);
    rangeMin.value = String(state.filters.yearMin);

    const rangeMax = document.createElement("input");
    rangeMax.type = "range";
    rangeMax.min = "-3000";
    rangeMax.max = String(CURRENT_YEAR);
    rangeMax.value = String(state.filters.yearMax);

    rangeBox.appendChild(rangeMin);
    rangeBox.appendChild(rangeMax);
    yearGroup.appendChild(rangeBox);
    panel.appendChild(yearGroup);

    function formatYear(y) {
      y = Number(y);
      return y < 0 ? `${Math.abs(y)} a.C.` : `${y} d.C.`;
    }

    function refreshYearLabels() {
      minSpan.textContent = formatYear(rangeMin.value);
      maxSpan.textContent = formatYear(rangeMax.value);
    }
    refreshYearLabels();

    rangeMin.addEventListener("input", () => {
      if (Number(rangeMin.value) > Number(rangeMax.value)) {
        rangeMin.value = rangeMax.value;
      }
      refreshYearLabels();
    });
    rangeMax.addEventListener("input", () => {
      if (Number(rangeMax.value) < Number(rangeMin.value)) {
        rangeMax.value = rangeMin.value;
      }
      refreshYearLabels();
    });

    const triggerYearSearch = () => {
      state.filters.yearMin = Number(rangeMin.value);
      state.filters.yearMax = Number(rangeMax.value);
      state.page = 1;
      runSearch();
    };
    rangeMin.addEventListener("change", triggerYearSearch);
    rangeMax.addEventListener("change", triggerYearSearch);

    // checkboxes
    const highlightRow = document.createElement("div");
    highlightRow.className = "checkbox-row";
    const highlightCheck = document.createElement("input");
    highlightCheck.type = "checkbox";
    highlightCheck.id = "explore-highlight";
    const highlightLbl = document.createElement("label");
    highlightLbl.htmlFor = "explore-highlight";
    highlightLbl.textContent = "Solo obras destacadas";
    highlightRow.appendChild(highlightCheck);
    highlightRow.appendChild(highlightLbl);
    panel.appendChild(highlightRow);

    highlightCheck.addEventListener("change", () => {
      state.filters.isHighlight = highlightCheck.checked;
      state.page = 1;
      runSearch();
    });

    const imgRow = document.createElement("div");
    imgRow.className = "checkbox-row";
    const imgCheck = document.createElement("input");
    imgCheck.type = "checkbox";
    imgCheck.id = "explore-hasimg";
    const imgLbl = document.createElement("label");
    imgLbl.htmlFor = "explore-hasimg";
    imgLbl.textContent = "Solo con imagen";
    imgRow.appendChild(imgCheck);
    imgRow.appendChild(imgLbl);
    panel.appendChild(imgRow);

    imgCheck.addEventListener("change", () => {
      state.filters.hasImages = imgCheck.checked;
      state.page = 1;
      runSearch();
    });

    // limpiar filtros
    const clearBtn = document.createElement("button");
    clearBtn.className = "btn-clear";
    clearBtn.textContent = "Limpiar filtros";
    clearBtn.addEventListener("click", () => {
      state.filters = {
        q: "",
        departmentId: "",
        isHighlight: false,
        hasImages: false,
        yearMin: -3000,
        yearMax: CURRENT_YEAR,
      };
      qInput.value = "";
      deptSelect.value = "";
      highlightCheck.checked = false;
      imgCheck.checked = false;
      rangeMin.value = "-3000";
      rangeMax.value = String(CURRENT_YEAR);
      refreshYearLabels();
      state.page = 1;
      runSearch();
    });
    panel.appendChild(clearBtn);
  }

  async function populateDepartments(panel, state) {
    const select = panel.querySelector("#explore-dept-select");
    const optAll = document.createElement("option");
    optAll.value = "";
    optAll.textContent = "Todos los departamentos";
    select.appendChild(optAll);

    try {
      const departments = await MetAPI.getDepartments();
      departments.forEach((d) => {
        const opt = document.createElement("option");
        opt.value = d.departmentId;
        opt.textContent = d.displayName;
        select.appendChild(opt);
      });
      if (state.filters.departmentId) {
        select.value = state.filters.departmentId;
      }
    } catch (err) {
      // si fallan los departamentos, el filtro queda solo con "todos"
      console.error("No se pudieron cargar los departamentos para el filtro", err);
    }
  }

  function buildAggregatesPanel(panel) {
    const h3 = document.createElement("h3");
    h3.textContent = "Agregados en vivo";
    panel.appendChild(h3);
    panel.appendChild(document.createElement("div")).id = "agg-body";
  }

  function renderAggregates(objects, total) {
    const body = aggPanel.querySelector("#agg-body");
    body.innerHTML = "";

    if (!objects || objects.length === 0) {
      ["Total de resultados", "Cargados", "Departamento dominante", "Siglo más frecuente", "Cultura más frecuente"].forEach(
        (label) => body.appendChild(aggRow(label, "—"))
      );
    } else {
      body.appendChild(aggRow("Total de resultados", total.toLocaleString("es")));
      body.appendChild(aggRow("Cargados", objects.length));
      body.appendChild(aggRow("Departamento dominante", mostFrequent(objects.map((o) => o.department))));
      body.appendChild(aggRow("Siglo más frecuente", mostFrequentCentury(objects)));
      body.appendChild(aggRow("Cultura más frecuente", mostFrequent(objects.map((o) => o.culture))));
    }

    const note = document.createElement("p");
    note.className = "agg-note";
    note.textContent = "Agregados calculados sobre los visibles (esta página). El total se refiere al search completo.";
    body.appendChild(note);
  }

  function aggRow(label, value) {
    const row = document.createElement("div");
    row.className = "agg-row";
    const l = document.createElement("span");
    l.textContent = label;
    const v = document.createElement("strong");
    v.textContent = value;
    row.appendChild(l);
    row.appendChild(v);
    return row;
  }

  function mostFrequent(values) {
    const clean = values.filter((v) => v && v.trim());
    if (clean.length === 0) return "—";
    const counts = {};
    clean.forEach((v) => (counts[v] = (counts[v] || 0) + 1));
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
  }

  function mostFrequentCentury(objects) {
    const centuries = objects
      .map((o) => {
        const year = o.objectEndDate ?? o.objectBeginDate;
        if (year == null || isNaN(year)) return null;
        const century = Math.floor((year - 1) / 100) + 1;
        return century;
      })
      .filter((c) => c != null);

    if (centuries.length === 0) return "—";
    const counts = {};
    centuries.forEach((c) => (counts[c] = (counts[c] || 0) + 1));
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
    const n = Number(top);
    return n <= 0 ? `Siglo ${Math.abs(n) + 1} a.C.` : `Siglo ${n} d.C.`;
  }

  async function runSearch() {
    galleryWrap.innerHTML = "";
    paginationWrap.innerHTML = "";
    const loading = document.createElement("met-loading-state");
    loading.setAttribute("message", "Buscando obras...");
    galleryWrap.appendChild(loading);
    renderAggregates(null, 0);

    try {
      const result = await MetAPI.search({
        q: state.filters.q,
        departmentId: state.filters.departmentId || null,
        isHighlight: state.filters.isHighlight,
        hasImages: state.filters.hasImages,
        dateBegin: state.filters.yearMin,
        dateEnd: state.filters.yearMax,
      });
      state.objectIDs = result.objectIDs;
      state.total = result.total;
      state.page = 1;
      await loadPage();
    } catch (err) {
      galleryWrap.innerHTML = "";
      const errBox = document.createElement("met-error-state");
      errBox.setAttribute("message", "No se pudo realizar la búsqueda.");
      errBox.onRetry = () => runSearch();
      galleryWrap.appendChild(errBox);
    }
  }

  async function loadPage() {
    galleryWrap.innerHTML = "";
    paginationWrap.innerHTML = "";

    if (state.total === 0 || state.objectIDs.length === 0) {
      const empty = document.createElement("p");
      empty.className = "empty-msg";
      empty.textContent = "No se encontraron obras con los filtros aplicados.";
      galleryWrap.appendChild(empty);
      renderAggregates([], state.total);
      return;
    }

    const loading = document.createElement("met-loading-state");
    loading.setAttribute("message", "Cargando página...");
    galleryWrap.appendChild(loading);

    const start = (state.page - 1) * PAGE_SIZE;
    const pageIds = state.objectIDs.slice(start, start + PAGE_SIZE);

    try {
      const { objects, failed } = await MetAPI.resolveObjects(pageIds);
      galleryWrap.innerHTML = "";

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

      renderAggregates(objects, state.total);
      renderPagination();
    } catch (err) {
      galleryWrap.innerHTML = "";
      const errBox = document.createElement("met-error-state");
      errBox.setAttribute("message", "No se pudo cargar esta página de resultados.");
      errBox.onRetry = () => loadPage();
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
