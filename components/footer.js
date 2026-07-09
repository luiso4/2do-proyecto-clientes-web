/* ==========================================================
   met-footer
   ========================================================== */

class MetFooter extends HTMLElement {
  connectedCallback() {
    const footer = document.createElement("footer");
    footer.className = "footer";

    const credits = document.createElement("p");
    credits.textContent = "MetHub — Proyecto 2 en pareja · [Nombre Estudiante A] & [Nombre Estudiante B] · 2026";

    const disclaimer = document.createElement("p");
    disclaimer.textContent =
      "Datos provistos por la Open Access API del Metropolitan Museum of Art. Esta aplicación no está afiliada al museo. Las imágenes pueden tener restricciones de uso comercial; este proyecto es solo con fines educativos.";

    footer.appendChild(credits);
    footer.appendChild(disclaimer);

    this.innerHTML = "";
    this.appendChild(footer);
  }
}

customElements.define("met-footer", MetFooter);
