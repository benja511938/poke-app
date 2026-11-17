import { render } from "./views.js";
import { getSessionUser, setSession } from "./storage.js";

const nav = document.getElementById("nav");

export function go(vista, param) {
  render(vista, param, go);
  renderNav();
  window.scrollTo(0, 0);
}

function renderNav() {
  const u = getSessionUser();
  const items = [["inicio", "Inicio"], ["pokedex", "Pokédex"], ["batalla", "Batalla"]];
  if (u?.admin) items.push(["carga", "Cargar Pokémon"]);
  if (!u) items.push(["login", "Iniciar sesión"], ["registro", "Registrarse"]);
  nav.innerHTML = items.map(([v, t]) => `<button data-go="${v}">${t}</button>`).join("") +
    (u ? `<span class="user">Hola, ${u.nombre}${u.admin ? " (admin)" : ""}</span><button id="salir">Salir</button>` : "");
  nav.querySelectorAll("[data-go]").forEach((b) => b.addEventListener("click", () => go(b.dataset.go)));
  document.getElementById("salir")?.addEventListener("click", () => { setSession(null); go("inicio"); });
}

document.getElementById("logo").addEventListener("click", () => go("inicio"));
go("inicio");
