/* ==========================================================
   Vista #departments
   ========================================================== */

window.Views = window.Views || {};

// iconos decorativos, se asignan por posición (no representan nada oficial)
const DEPT_ICONS = ["🏺", "🗿", "⚔️", "🖼️", "🕌", "🎭", "🪔", "🧵", "🗡️", "🪑", "📜", "🎨", "🏛️", "🪆", "🕯️", "🖋️", "🔱", "🧿", "🪞"];

window.Views.departments = async function (container) {
  const wrap = document.createElement("div");
  wrap.className = "container section";

  const title = document.createElement("div");
  title.className = "section-title";
  const h2 = document.createElement("h2");
  h2.textContent = "Departamentos";
  title.appendChild(h2);
  wrap.appendChild(title);

  const body = document.createElement("div");
  wrap.appendChild(body);
  container.appendChild(wrap);

  await load();

  async function load() {
    body.innerHTML = "";
    const loading = document.createElement("met-loading-state");
    loading.setAttribute("message", "Cargando departamentos...");
    body.appendChild(loading);

    try {
      const departments = await MetAPI.getDepartments();
      body.innerHTML = "";

      const grid = document.createElement("div");
      grid.className = "dept-grid";

      departments.forEach((d, i) => {
        const card = document.createElement("div");
        card.className = "dept-card";

        const icon = document.createElement("span");
        icon.className = "dept-icon";
        icon.textContent = DEPT_ICONS[i % DEPT_ICONS.length];

        const h4 = document.createElement("h4");
        h4.textContent = d.displayName;

        card.appendChild(icon);
        card.appendChild(h4);

        card.addEventListener("click", () => {
          window.location.hash = `#explore?departmentId=${d.departmentId}`;
        });

        grid.appendChild(card);
      });

      body.appendChild(grid);
    } catch (err) {
      body.innerHTML = "";
      const errBox = document.createElement("met-error-state");
      errBox.setAttribute("message", "No se pudieron cargar los departamentos.");
      errBox.onRetry = load;
      body.appendChild(errBox);
    }
  }
};
