/* ==========================================================
   met-work-card
   Uso:
     const card = document.createElement("met-work-card");
     card.work = objetoDeLaObraDevueltoPorLaApi;
     contenedor.appendChild(card);
   ========================================================== */

class MetWorkCard extends HTMLElement {
  set work(data) {
    this._work = data;
    this.render();
  }

  get work() {
    return this._work;
  }

  render() {
    if (!this._work) return;
    const w = this._work;

    const card = document.createElement("div");
    card.className = "work-card";

    // --- imagen ---
    const imgWrap = document.createElement("div");
    imgWrap.className = "work-card__img-wrap";

    const imgUrl = w.primaryImageSmall || w.primaryImage;
    if (imgUrl) {
      const img = document.createElement("img");
      img.src = imgUrl;
      img.alt = w.title || "Obra sin título";
      img.loading = "lazy";
      imgWrap.appendChild(img);
    } else {
      const noImg = document.createElement("div");
      noImg.className = "no-image";
      noImg.textContent = "Sin imagen disponible";
      imgWrap.appendChild(noImg);
    }

    // --- cuerpo ---
    const body = document.createElement("div");
    body.className = "work-card__body";

    const title = document.createElement("div");
    title.className = "work-card__title";
    title.textContent = w.title && w.title.trim() ? w.title : "Sin título";

    const artist = document.createElement("div");
    artist.className = "work-card__artist";
    artist.textContent = w.artistDisplayName && w.artistDisplayName.trim()
      ? w.artistDisplayName
      : "Artista desconocido";

    const meta = document.createElement("div");
    meta.className = "work-card__meta";
    const fecha = w.objectDate && w.objectDate.trim() ? w.objectDate : "Fecha desconocida";
    const depto = w.department && w.department.trim() ? w.department : "—";
    meta.textContent = `${fecha} · ${depto}`;

    body.appendChild(title);
    body.appendChild(artist);
    body.appendChild(meta);

    card.appendChild(imgWrap);
    card.appendChild(body);

    card.addEventListener("click", () => {
      window.location.hash = `#detail/${w.objectID}`;
    });

    this.innerHTML = "";
    this.appendChild(card);
  }
}

customElements.define("met-work-card", MetWorkCard);
