/* ==========================================================
   met-loading-state
   Uso: <met-loading-state message="Cargando obras..."></met-loading-state>
   ========================================================== */

class MetLoadingState extends HTMLElement {
  connectedCallback() {
    this.render();
  }

  render() {
    const msg = this.getAttribute("message") || "Cargando...";

    const box = document.createElement("div");
    box.className = "state-box";

    const spinner = document.createElement("div");
    spinner.className = "spinner";

    const p = document.createElement("p");
    p.textContent = msg;

    box.appendChild(spinner);
    box.appendChild(p);

    this.innerHTML = "";
    this.appendChild(box);
  }
}

customElements.define("met-loading-state", MetLoadingState);
