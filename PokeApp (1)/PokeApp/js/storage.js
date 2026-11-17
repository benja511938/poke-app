import { pokemonsIniciales, usuariosIniciales } from "./data.js";

const K = { pokemons: "pokeapp2_pokemons", users: "pokeapp2_users", session: "pokeapp2_session" };

function cargar(clave, inicial) {
  try {
    const txt = localStorage.getItem(clave);
    if (txt) return JSON.parse(txt);
  } catch (e) { console.warn("Datos corruptos, se restauran los iniciales", e); }
  localStorage.setItem(clave, JSON.stringify(inicial));
  return structuredClone(inicial);
}

export const getPokemons = () => cargar(K.pokemons, pokemonsIniciales);
export const savePokemons = (lista) => localStorage.setItem(K.pokemons, JSON.stringify(lista));
export const getUsers = () => cargar(K.users, usuariosIniciales);
export const saveUsers = (lista) => localStorage.setItem(K.users, JSON.stringify(lista));

export const setSession = (id) => id === null ? localStorage.removeItem(K.session) : localStorage.setItem(K.session, JSON.stringify(id));
export function getSessionUser() {
  const id = JSON.parse(localStorage.getItem(K.session) || "null");
  return getUsers().find((u) => u.id === id) || null;
}
