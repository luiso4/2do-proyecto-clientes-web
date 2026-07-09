/* ==========================================================
   met-navbar
   Barra de navegación fija, presente en todas las vistas.
   Resalta el link de la vista activa según el hash actual.
   ========================================================== */

class MetNavbar extends HTMLElement {
  constructor() {
    super();
    this.render();
    this.updateActiveLink = this.updateActiveLink.bind(this);
  }

  connectedCallback() {
    window.addEventListener("hashchange", this.updateActiveLink);
    this.updateActiveLink();
  }

  disconnectedCallback() {
    window.removeEventListener("hashchange", this.updateActiveLink);
  }

  render() {
    const nav = document.createElement("nav");
    nav.className = "navbar";

    const logo = document.createElement("a");
    logo.href = "#home";
    logo.className = "navbar__logo";
    logo.textContent = "Met";
    const span = document.createElement("span");
    span.textContent = "Hub";
    logo.appendChild(span);

    const ul = document.createElement("ul");
    ul.className = "navbar__links";

    const links = [
      { href: "#explore", label: "Explorar" },
      { href: "#departments", label: "Departamentos" },
      { href: "#compare", label: "Comparador" },
    ];

    links.forEach((l) => {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = l.href;
      a.textContent = l.label;
      a.dataset.route = l.href;
      li.appendChild(a);
      ul.appendChild(li);
    });

    nav.appendChild(logo);
    nav.appendChild(ul);

    this.innerHTML = "";
    this.appendChild(nav);
  }

  updateActiveLink() {
    const hash = window.location.hash || "#home";
    // toma la parte base del hash, ej: "#detail/123" -> "#detail"
    const base = "#" + hash.slice(1).split("/")[0];

    this.querySelectorAll(".navbar__links a").forEach((a) => {
      a.classList.toggle("active", a.dataset.route === base);
    });
  }
}

customElements.define("met-navbar", MetNavbar);
