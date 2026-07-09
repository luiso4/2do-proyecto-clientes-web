/* ==========================================================
   met-error-state
   Uso:
     const err = document.createElement("met-error-state");
     err.setAttribute("message", "No se pudo cargar la obra.");
     err.onRetry = () => cargarDeNuevo();
     contenedor.appendChild(err);
   ========================================================== */

class MetErrorState extends HTMLElement {
  connectedCallback() {
    this.render();
  }

  render() {
    const msg = this.getAttribute("message") || "Ocurrió un error al cargar los datos.";

    const box = document.createElement("div");
    box.className = "state-box state-box--error";

    const icon = document.createElement("div");
    icon.className = "icon";
    icon.textContent = "⚠";

    const p = document.createElement("p");
    p.textContent = msg;

    box.appendChild(icon);
    box.appendChild(p);

    if (typeof this.onRetry === "function") {
      const btn = document.createElement("button");
      btn.className = "btn-retry";
      btn.textContent = "Reintentar";
      btn.addEventListener("click", () => this.onRetry());
      box.appendChild(btn);
    }

    this.innerHTML = "";
    this.appendChild(box);
  }
}

customElements.define("met-error-state", MetErrorState);
