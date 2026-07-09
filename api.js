/* ==========================================================
   api.js
   Capa de acceso a la API del Met Museum.
   Todo lo que pega a la red vive acá, así el resto de la app
   no tiene que saber de fetch/URLs.
   ========================================================== */

const MetAPI = (() => {
  const BASE_URL = "https://collectionapi.metmuseum.org/public/collection/v1";
  const TIMEOUT_MS = 10000; // 10s, dentro del rango recomendado (8-12s)

  // fetch con timeout usando AbortController, para que una petición
  // colgada no deje la UI esperando para siempre
  async function fetchWithTimeout(url) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      return await res.json();
    } catch (err) {
      clearTimeout(timeoutId);
      if (err.name === "AbortError") {
        throw new Error("La petición tardó demasiado (timeout).");
      }
      throw err;
    }
  }

  // GET /departments
  async function getDepartments() {
    const data = await fetchWithTimeout(`${BASE_URL}/departments`);
    return data.departments || [];
  }

  // GET /objects/:id
  async function getObject(id) {
    return await fetchWithTimeout(`${BASE_URL}/objects/${id}`);
  }

  // GET /search con query params armados a partir de un objeto de filtros
  // filtros soportados: q, departmentId, isHighlight, hasImages,
  // dateBegin, dateEnd, artistOrCulture
  async function search(filtros = {}) {
    const params = new URLSearchParams();
    params.set("q", filtros.q && filtros.q.trim() ? filtros.q.trim() : "*");

    if (filtros.departmentId) params.set("departmentId", filtros.departmentId);
    if (filtros.isHighlight) params.set("isHighlight", "true");
    if (filtros.hasImages) params.set("hasImages", "true");
    if (filtros.artistOrCulture) params.set("artistOrCulture", "true");
    if (filtros.dateBegin != null && filtros.dateEnd != null) {
      params.set("dateBegin", filtros.dateBegin);
      params.set("dateEnd", filtros.dateEnd);
    }

    const data = await fetchWithTimeout(`${BASE_URL}/search?${params.toString()}`);
    return {
      total: data.total || 0,
      objectIDs: data.objectIDs || [],
    };
  }

  // Toma un arreglo de IDs y los resuelve todos en paralelo con
  // Promise.allSettled. Devuelve solo los objetos que sí cargaron,
  // más un contador de cuántos fallaron.
  async function resolveObjects(ids) {
    const settled = await Promise.allSettled(ids.map((id) => getObject(id)));

    const objects = [];
    let failed = 0;

    settled.forEach((result) => {
      if (result.status === "fulfilled" && result.value) {
        objects.push(result.value);
      } else {
        failed += 1;
      }
    });

    return { objects, failed };
  }

  return {
    getDepartments,
    getObject,
    search,
    resolveObjects,
  };
})();
