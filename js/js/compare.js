/* ==========================================================
   Vista #compare
   Dos paneles con buscador interno cada uno. Cuando ambos
   tienen una obra seleccionada, se muestra la tabla comparativa.
   ========================================================== */

window.Views = window.Views || {};

window.Views.compare = async function (container, { query } = {}) {
  const state = {
    a: { work: null },
    b: { work: null },
  };

  const wrap = document.createElement("div");
  wrap.className = "container section";

  const title = document.createElement("div");
  title.className = "section-title";
  const h2 = document.createElement("h2");
  h2.textContent = "Comparador de obras";
  title.appendChild(h2);
  wrap.appendChild(title);

  const layout = document.createElement("div");
  layout.className = "compare-layout";

  const panelA = document.createElement("div");
  panelA.className = "compare-panel";
  const panelB = document.createElement("div");
  panelB.className = "compare-panel";

  layout.appendChild(panelA);
  layout.appendChild(panelB);
  wrap.appendChild(layout);

  const tableWrap = document.createElement("div");
  wrap.appendChild(tableWrap);

  container.appendChild(wrap);

  renderPanel(panelA, "A", "Obra A");
  renderPanel(panelB, "B", "Obra B");

  // preselección desde #detail (?from=objectID)
  if (query && query.from) {
    try {
      const obj = await MetAPI.getObject(query.from);
      if (obj && obj.objectID) {
        state.a.work = obj;
        renderPanel(panelA, "A", "Obra A");
        updateTable();
      }
    } catch (err) {
      console.error("No se pudo precargar la obra de origen", err);
    }
  }

  // -------------------------------------------------------
  function renderPanel(panelEl, key, label) {
    panelEl.innerHTML = "";
    const s = state[key.toLowerCase()];

    const h3 = document.createElement("h3");
    h3.textContent = label;
    panelEl.appendChild(h3);

    if (s.work) {
      renderSelected(panelEl, key, s.work);
    } else {
      renderSearcher(panelEl, key);
    }
  }

  function renderSelected(panelEl, key, work) {
    const box = document.createElement("div");
    box.className = "compare-selected";

    const imgUrl = work.primaryImageSmall || work.primaryImage;
    if (imgUrl) {
      const img = document.createElement("img");
      img.src = imgUrl;
      img.alt = work.title || "Obra sin título";
      box.appendChild(img);
    } else {
      const noImg = document.createElement("p");
      noImg.className = "small-note";
      noImg.textContent = "Sin imagen disponible";
      box.appendChild(noImg);
    }

    const h4 = document.createElement("h4");
    h4.textContent = work.title && work.title.trim() ? work.title : "Sin título";
    box.appendChild(h4);

    const artist = document.createElement("p");
    artist.className = "small-note";
    artist.textContent = work.artistDisplayName && work.artistDisplayName.trim()
      ? work.artistDisplayName
      : "Artista desconocido";
    box.appendChild(artist);

    const changeBtn = document.createElement("button");
    changeBtn.className = "btn-change";
    changeBtn.textContent = "Cambiar";
    changeBtn.addEventListener("click", () => {
      state[key.toLowerCase()].work = null;
      renderPanel(panelEl, key, key === "A" ? "Obra A" : "Obra B");
      updateTable();
    });
    box.appendChild(changeBtn);

    panelEl.appendChild(box);
  }

  function renderSearcher(panelEl, key) {
    const searchBox = document.createElement("div");
    searchBox.className = "compare-search";

    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = "Busca una obra por nombre, artista, tema...";
    searchBox.appendChild(input);
    panelEl.appendChild(searchBox);

    const resultsBox = document.createElement("div");
    resultsBox.className = "compare-results";
    const hint = document.createElement("p");
    hint.className = "small-note";
    hint.textContent = "Busca y elige una obra para comparar.";
    resultsBox.appendChild(hint);
    panelEl.appendChild(resultsBox);

    let debounceTimer;
    input.addEventListener("input", () => {
      clearTimeout(debounceTimer);
      const term = input.value.trim();
      if (!term) {
        resultsBox.innerHTML = "";
        resultsBox.appendChild(hint);
        return;
      }
      debounceTimer = setTimeout(() => doSearch(term, resultsBox, key), 400);
    });
  }

  async function doSearch(term, resultsBox, key) {
    resultsBox.innerHTML = "";
    const loading = document.createElement("met-loading-state");
    loading.setAttribute("message", "Buscando...");
    resultsBox.appendChild(loading);

    try {
      const result = await MetAPI.search({ q: term, hasImages: true });
      const idsToLoad = result.objectIDs.slice(0, 6);

      if (idsToLoad.length === 0) {
        resultsBox.innerHTML = "";
        const empty = document.createElement("p");
        empty.className = "small-note";
        empty.textContent = "No se encontraron obras con ese término.";
        resultsBox.appendChild(empty);
        return;
      }

      const { objects } = await MetAPI.resolveObjects(idsToLoad);
      resultsBox.innerHTML = "";

      if (objects.length === 0) {
        const empty = document.createElement("p");
        empty.className = "small-note";
        empty.textContent = "No se encontraron obras con ese término.";
        resultsBox.appendChild(empty);
        return;
      }

      const otherKey = key === "A" ? "b" : "a";
      const otherId = state[otherKey].work ? state[otherKey].work.objectID : null;

      objects.forEach((w) => {
        const mini = document.createElement("div");
        mini.className = "mini-card";

        const isTaken = otherId != null && otherId === w.objectID;
        if (isTaken) {
          mini.classList.add("disabled");
          mini.title = "Ya está seleccionada en el otro panel";
        }

        const imgUrl = w.primaryImageSmall || w.primaryImage;
        if (imgUrl) {
          const img = document.createElement("img");
          img.src = imgUrl;
          img.alt = w.title || "Obra";
          mini.appendChild(img);
        }

        const info = document.createElement("div");
        info.className = "mini-info";
        const strong = document.createElement("strong");
        strong.textContent = w.title && w.title.trim() ? w.title : "Sin título";
        const span = document.createElement("span");
        span.textContent = w.artistDisplayName && w.artistDisplayName.trim()
          ? w.artistDisplayName
          : "Artista desconocido";
        info.appendChild(strong);
        info.appendChild(span);
        mini.appendChild(info);

        if (!isTaken) {
          mini.addEventListener("click", () => {
            state[key.toLowerCase()].work = w;
            const panelEl = key === "A" ? panelA : panelB;
            renderPanel(panelEl, key, key === "A" ? "Obra A" : "Obra B");
            updateTable();
          });
        }

        resultsBox.appendChild(mini);
      });
    } catch (err) {
      resultsBox.innerHTML = "";
      const errBox = document.createElement("met-error-state");
      errBox.setAttribute("message", "No se pudo realizar la búsqueda.");
      errBox.onRetry = () => doSearch(term, resultsBox, key);
      resultsBox.appendChild(errBox);
    }
  }

  function updateTable() {
    tableWrap.innerHTML = "";
    const workA = state.a.work;
    const workB = state.b.work;

    if (!workA || !workB) return;

    const table = document.createElement("table");
    table.className = "compare-table";

    const thead = document.createElement("tr");
    ["Atributo", "Obra A", "Obra B"].forEach((h) => {
      const th = document.createElement("th");
      th.textContent = h;
      thead.appendChild(th);
    });
    table.appendChild(thead);

    const yearOf = (w) => w.objectEndDate ?? w.objectBeginDate ?? null;

    const rows = [
      ["Artista", workA.artistDisplayName || "Artista desconocido", workB.artistDisplayName || "Artista desconocido"],
      ["Año", yearOf(workA) != null ? String(yearOf(workA)) : "—", yearOf(workB) != null ? String(yearOf(workB)) : "—"],
      ["Departamento", workA.department || "—", workB.department || "—"],
      ["Técnica", workA.medium || "—", workB.medium || "—"],
      ["Clasificación", workA.classification || "—", workB.classification || "—"],
      ["Cultura", workA.culture || "—", workB.culture || "—"],
      ["¿Destacada?", workA.isHighlight ? "Sí" : "No", workB.isHighlight ? "Sí" : "No"],
      ["¿Dominio público?", workA.isPublicDomain ? "Sí" : "No", workB.isPublicDomain ? "Sí" : "No"],
    ];

    rows.forEach(([label, valA, valB]) => {
      const tr = document.createElement("tr");
      if (valA !== valB) tr.classList.add("diff");

      const tdLabel = document.createElement("td");
      tdLabel.textContent = label;
      const tdA = document.createElement("td");
      tdA.textContent = valA;
      const tdB = document.createElement("td");
      tdB.textContent = valB;

      tr.appendChild(tdLabel);
      tr.appendChild(tdA);
      tr.appendChild(tdB);
      table.appendChild(tr);
    });

    tableWrap.appendChild(table);

    const yA = yearOf(workA);
    const yB = yearOf(workB);
    if (yA != null && yB != null) {
      const diff = document.createElement("p");
      diff.className = "compare-diff-years";
      diff.textContent = `Diferencia de ${Math.abs(yA - yB)} año(s) entre ambas obras.`;
      tableWrap.appendChild(diff);
    }
  }
};
