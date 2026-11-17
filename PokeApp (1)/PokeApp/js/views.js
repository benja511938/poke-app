import { getPokemons, savePokemons, getUsers, saveUsers, setSession, getSessionUser } from "./storage.js";

const app = document.getElementById("app");
const esc = (t) => String(t).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const msg = (txt, ok = false) => `<p class="msg ${ok ? "ok" : ""}">${esc(txt)}</p>`;

export function render(vista, param, go) {
  const vistas = { inicio, pokedex, detalle, login, registro, carga, batalla };
  (vistas[vista] || inicio)(param, go);
}

function enlazar(go) {
  app.querySelectorAll("[data-go]").forEach((b) => b.addEventListener("click", () => go(b.dataset.go, b.dataset.id ? Number(b.dataset.id) : undefined)));
}

// ---------- 1. Inicio ----------
function inicio(_, go) {
  app.innerHTML = `<section class="hero"><h2>¡Bienvenido a PokeApp!</h2>
    <p>Consultá la Pokédex, sumate a la comunidad y probá una batalla.</p>
    <button data-go="pokedex">Ver Pokédex</button><button data-go="batalla">Batallar</button></section>`;
  enlazar(go);
}

// ---------- 2. Pokédex ----------
function tarjeta(p) {
  return `<article class="card"><span class="num">#${String(p.id).padStart(3, "0")}</span>
    <img src="${esc(p.imagen)}" alt="${esc(p.nombre)}"><h3>${esc(p.nombre)}</h3>
    <div>${p.tipo.map((t) => `<span class="tag">${esc(t)}</span>`).join("")}</div>
    <p class="rar">${esc(p.rareza)}</p><button data-go="detalle" data-id="${p.id}">Ver detalle</button></article>`;
}

function pokedex(_, go) {
  const lista = getPokemons();
  app.innerHTML = `<h2>Pokédex</h2><label>Buscar por nombre<input id="q" placeholder="Ej: Pika"></label><br>
    <div class="grid" id="grid"></div>`;
  const grid = document.getElementById("grid");
  const pintar = (texto = "") => {
    const f = lista.filter((p) => p.nombre.toLowerCase().includes(texto.toLowerCase()));
    grid.innerHTML = f.length ? f.map(tarjeta).join("") : msg("No hay Pokémon que coincidan.");
    enlazar(go);
  };
  document.getElementById("q").addEventListener("input", (e) => pintar(e.target.value));
  pintar();
}

// ---------- 3. Detalle ----------
function detalle(id, go) {
  const p = getPokemons().find((x) => x.id === id);
  if (!p) return pokedex(null, go);
  const stats = [["HP", p.hp], ["Ataque", p.ataque], ["Defensa", p.defensa], ["Velocidad", p.velocidad]];
  app.innerHTML = `<button data-go="pokedex">← Volver</button>
    <div class="panel detail"><div><img id="img" src="${esc(p.imagen)}" alt="${esc(p.nombre)}">
      <p><button id="snd">🔊 Sonido</button> ${p.shiny ? `<button id="shiny">✨ Shiny</button>` : ""}</p></div>
    <div><h2>#${p.id} ${esc(p.nombre)}</h2>
      <p>${p.tipo.map((t) => `<span class="tag">${esc(t)}</span>`).join("")} <b>${esc(p.rareza)}</b></p>
      <p>${esc(p.descripcion)}</p>
      <p>Altura: ${p.altura} m · Peso: ${p.peso} kg · Generación ${p.generacion}</p>
      <p>Habilidad: ${esc(p.habilidad)}</p>
      <p>Evolución: ${p.tieneEvolucion ? `${esc(p.evolucion)} (nivel ${p.nivelEvolucion})` : "No evoluciona"}</p>
      ${stats.map(([n, v]) => `<div class="stat"><b>${n}</b><div class="bar" style="width:${Math.min(v, 150)}px"></div>${v}</div>`).join("")}
    </div></div>`;
  enlazar(go);
  let esShiny = false;
  document.getElementById("snd").addEventListener("click", () => new Audio(p.sonido).play().catch(() => alert("Este Pokémon no tiene sonido disponible.")));
  document.getElementById("shiny")?.addEventListener("click", () => {
    esShiny = !esShiny;
    document.getElementById("img").src = esShiny ? p.imagenShiny : p.imagen;
  });
}

// ---------- 4/5. Login y registro ----------
function login(_, go) {
  app.innerHTML = `<h2>Iniciar sesión</h2><form id="f"><div id="err"></div>
    <label>Usuario<input name="username" required></label>
    <label>Contraseña<input name="password" type="password" required></label>
    <button>Ingresar</button></form>`;
  document.getElementById("f").addEventListener("submit", (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(e.target));
    const u = getUsers().find((x) => x.username === d.username && x.password === d.password);
    if (!u) return (document.getElementById("err").innerHTML = msg("Usuario o contraseña incorrectos."));
    setSession(u.id);
    go(u.admin ? "carga" : "pokedex");
  });
}

function registro(_, go) {
  app.innerHTML = `<h2>Registrarse</h2><form id="f"><div id="err"></div>
    <label>Nombre<input name="nombre" required></label>
    <label>Email<input name="email" type="email" required></label>
    <label>Usuario<input name="username" required minlength="3"></label>
    <label>Contraseña<input name="password" type="password" required minlength="4"></label>
    <button>Crear cuenta</button></form>`;
  document.getElementById("f").addEventListener("submit", (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(e.target));
    const users = getUsers();
    if (users.some((u) => u.username === d.username)) return (document.getElementById("err").innerHTML = msg("Ese usuario ya existe."));
    const nuevo = { id: Math.max(0, ...users.map((u) => u.id)) + 1, ...d, avatar: "./assets/avatar/1.png", admin: false };
    users.push(nuevo);
    saveUsers(users);
    setSession(nuevo.id);
    go("pokedex");
  });
}

// ---------- 6. Carga de Pokémon (solo admin) ----------
const CAMPOS = [
  ["nombre", "Nombre", "text"], ["tipo", "Tipos (separados por coma)", "text"], ["descripcion", "Descripción", "textarea"],
  ["altura", "Altura (m)", "number"], ["peso", "Peso (kg)", "number"], ["generacion", "Generación", "number"],
  ["hp", "HP", "number"], ["ataque", "Ataque", "number"], ["velocidad", "Velocidad", "number"], ["defensa", "Defensa", "number"],
  ["habilidad", "Habilidad", "text"], ["evolucion", "Evolución (nombre, opcional)", "text"], ["nivelEvolucion", "Nivel de evolución", "number"],
  ["rareza", "Rareza", "select"], ["imagen", "Imagen (ruta o URL)", "text"], ["sonido", "Sonido (ruta o URL)", "text"],
  ["imagenShiny", "Imagen shiny (opcional)", "text"]
];
const RAREZAS = ["Común", "Poco común", "Raro", "Legendario"];

function campoHTML([n, l, t]) {
  const req = ["evolucion", "imagenShiny", "nivelEvolucion"].includes(n) ? "" : "required";
  if (t === "textarea") return `<label>${l}<textarea name="${n}" rows="3" ${req}></textarea></label>`;
  if (t === "select") return `<label>${l}<select name="${n}">${RAREZAS.map((r) => `<option>${r}</option>`).join("")}</select></label>`;
  return `<label>${l}<input name="${n}" type="${t}" ${t === "number" ? 'step="any" min="0"' : ""} ${req}></label>`;
}

function carga(_, go) {
  const u = getSessionUser();
  if (!u?.admin) { app.innerHTML = `<h2>Carga de Pokémon</h2>${msg("Solo los administradores pueden acceder a esta sección.")}`; return; }
  app.innerHTML = `<h2>Cargar nuevo Pokémon</h2><form id="f"><div id="err"></div>
    ${CAMPOS.map(campoHTML).join("")}
    <label class="chk"><input type="checkbox" name="shiny"> Tiene versión shiny</label>
    <button>Guardar Pokémon</button></form>`;
  document.getElementById("f").addEventListener("submit", (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(e.target));
    const lista = getPokemons();
    if (lista.some((p) => p.nombre.toLowerCase() === d.nombre.trim().toLowerCase()))
      return (document.getElementById("err").innerHTML = msg("Ya existe un Pokémon con ese nombre."));
    const nuevo = {
      id: Math.max(0, ...lista.map((p) => p.id)) + 1,
      nombre: d.nombre.trim(),
      tipo: d.tipo.split(",").map((t) => t.trim()).filter(Boolean),
      descripcion: d.descripcion.trim(),
      altura: Number(d.altura), peso: Number(d.peso), generacion: Number(d.generacion),
      hp: Number(d.hp), ataque: Number(d.ataque), velocidad: Number(d.velocidad), defensa: Number(d.defensa),
      habilidad: d.habilidad.trim(),
      tieneEvolucion: d.evolucion.trim() !== "", evolucion: d.evolucion.trim(), nivelEvolucion: Number(d.nivelEvolucion) || 0,
      rareza: d.rareza, imagen: d.imagen.trim(), sonido: d.sonido.trim(),
      shiny: Boolean(d.shiny), imagenShiny: d.imagenShiny.trim()
    };
    lista.push(nuevo);
    savePokemons(lista);
    e.target.reset();
    document.getElementById("err").innerHTML = msg(`¡${nuevo.nombre} se guardó! Ya está en la Pokédex.`, true);
  });
}

// ---------- 7. Batalla guionada ----------
function batalla(_, go) {
  const lista = getPokemons();
  const yo = lista[Math.floor(Math.random() * lista.length)];
  const rival = lista[Math.floor(Math.random() * lista.length)];
  const s = { hpYo: 100, hpRival: 100, pociones: 2, turno: 1 };

  function escena(texto, opciones = [["Atacar", atacar], ["Usar poción", pocion], ["Huir", huir]]) {
    app.innerHTML = `<section class="battle"><h2>Batalla</h2>
      <div class="vs"><div><img src="${esc(yo.imagen)}" alt=""><p>${esc(yo.nombre)}</p><div class="hpbar"><div style="width:${s.hpYo}%"></div></div></div>
      <b>VS</b><div><img src="${esc(rival.imagen)}" alt=""><p>${esc(rival.nombre)}</p><div class="hpbar"><div style="width:${s.hpRival}%"></div></div></div></div>
      <div class="text">${esc(texto)}</div><div class="opts">${opciones.map(([t], i) => `<button data-i="${i}">${t}</button>`).join("")}</div></section>`;
    app.querySelectorAll("[data-i]").forEach((b) => b.addEventListener("click", () => opciones[b.dataset.i][1]()));
  }
  const final = (texto) => escena(texto, [["Jugar de nuevo", () => batalla(null, go)], ["Ir a la Pokédex", () => go("pokedex")]]);
  const contraataque = (previo) => {
    s.hpYo = Math.max(0, s.hpYo - (10 + Math.floor(Math.random() * 20)));
    if (s.hpYo === 0) return final(`${previo} ${rival.nombre} contraatacó y ${yo.nombre} se debilitó... Perdiste.`);
    s.turno++;
    escena(`${previo} ${rival.nombre} contraatacó. Turno ${s.turno}: ¿Qué querés hacer?`);
  };
  function atacar() {
    s.hpRival = Math.max(0, s.hpRival - (15 + Math.floor(yo.ataque / 10) + Math.floor(Math.random() * 15)));
    if (s.hpRival === 0) return final(`¡${rival.nombre} se debilitó! ¡Ganaste la batalla!`);
    contraataque(`${yo.nombre} atacó.`);
  }
  function pocion() {
    if (s.pociones === 0) return escena("¡No te quedan pociones! Elegí otra acción.");
    s.pociones--; s.hpYo = Math.min(100, s.hpYo + 30);
    contraataque(`${yo.nombre} recuperó energía (${s.pociones} pociones restantes).`);
  }
  function huir() { final("Escapaste de la batalla sin problemas."); }

  escena(`Un ${rival.nombre} salvaje apareció. ¡Adelante, ${yo.nombre}! Turno 1: ¿Qué querés hacer?`);
}
