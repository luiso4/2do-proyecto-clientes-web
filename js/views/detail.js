/* ==========================================================
   Vista #detail/:id
   ========================================================== */

window.Views = window.Views || {};

window.Views.detail = async function (container, { id }) {
  const wrap = document.createElement("div");
  wrap.className = "container";
  container.appendChild(wrap);

  await load();

  async function load() {
    wrap.innerHTML = "";

    const back = document.createElement("a");
    back.href = "#";
    back.className = "back-link";
    back.textContent = "← Volver";
    back.addEventListener("click", (e) => {
      e.preventDefault();
      window.history.back();
    });
    wrap.appendChild(back);

    const loading = document.createElement("met-loading-state");
    loading.setAttribute("message", "Cargando obra...");
    wrap.appendChild(loading);

    try {
      const obj = await MetAPI.getObject(id);

      if (!obj || !obj.objectID) {
        wrap.removeChild(loading);
        const msg = document.createElement("p");
        msg.className = "empty-msg";
        msg.textContent = "La obra solicitada no existe.";
        wrap.appendChild(msg);
        return;
      }

      wrap.removeChild(loading);
      renderDetail(obj);
    } catch (err) {
      wrap.removeChild(loading);
      const errBox = document.createElement("met-error-state");
      errBox.setAttribute("message", "No se pudo cargar la obra.");
      errBox.onRetry = load;
      wrap.appendChild(errBox);
    }
  }

  function renderDetail(w) {
    const layout = document.createElement("div");
    layout.className = "detail-layout";

    // ---------- columna izquierda: imágenes ----------
    const left = document.createElement("div");

    const mainImgBox = document.createElement("div");
    mainImgBox.className = "detail-img-main";
    const mainUrl = w.primaryImage || w.primaryImageSmall;
    if (mainUrl) {
      const img = document.createElement("img");
      img.src = mainUrl;
      img.alt = w.title || "Obra sin título";
      mainImgBox.appendChild(img);
    } else {
      const placeholder = document.createElement("div");
      placeholder.className = "no-image";
      placeholder.textContent = "Sin imagen disponible";
      mainImgBox.appendChild(placeholder);
    }
    left.appendChild(mainImgBox);

    if (Array.isArray(w.additionalImages) && w.additionalImages.length > 0) {
      const extraGrid = document.createElement("div");
      extraGrid.className = "detail-extra-imgs";
      w.additionalImages.slice(0, 8).forEach((url) => {
        const img = document.createElement("img");
        img.src = url;
        img.alt = "Imagen adicional de la obra";
        extraGrid.appendChild(img);
      });
      left.appendChild(extraGrid);
    }

    // ---------- columna derecha: ficha técnica ----------
    const right = document.createElement("div");

    const h1 = document.createElement("h1");
    h1.textContent = w.title && w.title.trim() ? w.title : "Sin título";
    right.appendChild(h1);

    const artistLine = document.createElement("div");
    artistLine.className = "detail-artist";
    if (w.artistDisplayName && w.artistDisplayName.trim()) {
      const artistLink = document.createElement("a");
      artistLink.href = `#artist/${encodeURIComponent(w.artistDisplayName)}`;
      artistLink.textContent = w.artistDisplayName;
      artistLine.appendChild(artistLink);
    } else {
      artistLine.textContent = "Artista desconocido";
    }
    right.appendChild(artistLine);

    if (w.artistDisplayBio && w.artistDisplayBio.trim()) {
      const bio = document.createElement("p");
      bio.className = "detail-bio";
      bio.textContent = w.artistDisplayBio;
      right.appendChild(bio);
    }

    const table = document.createElement("table");
    table.className = "detail-table";

    const rows = [
      ["Fecha", w.objectDate],
      ["Técnica", w.medium],
      ["Dimensiones", w.dimensions],
      ["Departamento", w.department],
      ["Cultura", w.culture],
      ["Periodo", w.period],
      ["Clasificación", w.classification],
      ["Adquisición", w.creditLine],
    ];

    rows.forEach(([label, value]) => {
      const tr = document.createElement("tr");
      const tdLabel = document.createElement("td");
      tdLabel.textContent = label;
      const tdValue = document.createElement("td");
      tdValue.textContent = value && String(value).trim() ? value : "—";
      tr.appendChild(tdLabel);
      tr.appendChild(tdValue);
      table.appendChild(tr);
    });

    right.appendChild(table);

    // tags
    if (Array.isArray(w.tags) && w.tags.length > 0) {
      const tagTitle = document.createElement("h4");
      tagTitle.textContent = "Tags";
      tagTitle.style.marginTop = "20px";
      right.appendChild(tagTitle);

      const tagList = document.createElement("div");
      tagList.className = "tag-list";
      w.tags.slice(0, 12).forEach((t) => {
        const tag = document.createElement("span");
        tag.className = "tag";
        tag.textContent = t.term || "—";
        tagList.appendChild(tag);
      });
      right.appendChild(tagList);
    }

    // acciones
    const actions = document.createElement("div");
    actions.className = "detail-actions";

    if (w.objectURL) {
      const externalLink = document.createElement("a");
      externalLink.href = w.objectURL;
      externalLink.target = "_blank";
      externalLink.rel = "noopener noreferrer";
      externalLink.className = "btn-secondary";
      externalLink.textContent = "Ver en el sitio del museo";
      actions.appendChild(externalLink);
    }

    if (w.artistDisplayName && w.artistDisplayName.trim()) {
      const artistBtn = document.createElement("a");
      artistBtn.href = `#artist/${encodeURIComponent(w.artistDisplayName)}`;
      artistBtn.className = "btn-secondary";
      artistBtn.textContent = "Ver más obras del artista";
      actions.appendChild(artistBtn);
    }

    const compareBtn = document.createElement("a");
    compareBtn.href = `#compare?from=${w.objectID}`;
    compareBtn.className = "btn-primary";
    compareBtn.textContent = "Comparar";
    actions.appendChild(compareBtn);

    right.appendChild(actions);

    layout.appendChild(left);
    layout.appendChild(right);
    wrap.appendChild(layout);
  }
};
