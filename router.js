/* ==========================================================
   router.js
   Router simple basado en hash. No usamos módulos ES, así que
   cada vista se registra a sí misma en window.Views (ver
   js/views/*.js) y este router solo decide cuál invocar.
   ========================================================== */

const Router = (() => {
  const appEl = document.getElementById("app");

  // separa "#explore?departmentId=5" en { path: "explore", query: {...} }
  function parseHash() {
    let hash = window.location.hash || "#home";
    hash = hash.slice(1); // saca el "#"

    const [pathPart, queryPart] = hash.split("?");
    const segments = pathPart.split("/").filter(Boolean);
    const routeName = segments[0] || "home";
    const routeParam = segments[1] ? decodeURIComponent(segments[1]) : null;

    const query = {};
    if (queryPart) {
      new URLSearchParams(queryPart).forEach((value, key) => {
        query[key] = value;
      });
    }

    return { routeName, routeParam, query };
  }

  async function render() {
    const { routeName, routeParam, query } = parseHash();

    // limpiamos la vista anterior
    appEl.innerHTML = "";
    window.scrollTo(0, 0);

    try {
      switch (routeName) {
        case "home":
          await window.Views.home(appEl);
          break;

        case "explore":
          await window.Views.explore(appEl, { query });
          break;

        case "detail":
          if (!routeParam) return renderNotFound();
          await window.Views.detail(appEl, { id: routeParam });
          break;

        case "departments":
          await window.Views.departments(appEl);
          break;

        case "artist":
          if (!routeParam) return renderNotFound();
          await window.Views.artist(appEl, { name: routeParam });
          break;

        case "compare":
          await window.Views.compare(appEl, { query });
          break;

        default:
          renderNotFound();
      }
    } catch (err) {
      console.error("Error renderizando la vista:", err);
      appEl.innerHTML = "";
      const errBox = document.createElement("met-error-state");
      errBox.setAttribute("message", "Algo salió mal cargando esta vista.");
      appEl.appendChild(errBox);
    }
  }

  function renderNotFound() {
    appEl.innerHTML = "";
    const div = document.createElement("div");
    div.className = "container empty-msg";
    div.textContent = "Vista no encontrada.";
    appEl.appendChild(div);
  }

  function init() {
    window.addEventListener("hashchange", render);
    window.addEventListener("DOMContentLoaded", () => {
      if (!window.location.hash) {
        window.location.hash = "#home";
      } else {
        render();
      }
    });
  }

  return { init };
})();
