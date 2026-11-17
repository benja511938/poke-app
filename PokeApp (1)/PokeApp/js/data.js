// Datos iniciales (se usan solo la primera vez; luego manda localStorage)
const SPR = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/";
const CRY = "https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/";

function crear(id, nombre, tipo, descripcion, altura, peso, generacion, hp, ataque, velocidad, defensa, habilidad, evolucion, nivelEvolucion, rareza) {
  return {
    id, nombre, tipo, descripcion, altura, peso, generacion, hp, ataque, velocidad, defensa, habilidad,
    tieneEvolucion: evolucion !== "", evolucion, nivelEvolucion, rareza,
    imagen: `${SPR}${id}.png`, sonido: `${CRY}${id}.ogg`,
    shiny: true, imagenShiny: `${SPR}shiny/${id}.png`
  };
}

export const pokemonsIniciales = [
  crear(73, "Tentacruel", ["Agua", "Veneno"], "Tentacruel flota en el mar con sus tentáculos extendidos y los usa para atrapar presas y paralizarlas con veneno.", 1.6, 55, 1, 80, 70, 100, 65, "Cuerpo Puro", "", 0, "Poco común"),
  crear(94, "Gengar", ["Fantasma", "Veneno"], "Gengar se esconde en las sombras y dicen que baja la temperatura del ambiente cuando acecha a su víctima.", 1.5, 40.5, 1, 60, 65, 110, 60, "Levitación", "", 0, "Raro"),
  crear(149, "Dragonite", ["Dragón", "Volador"], "Dragonite es un Pokémon bondadoso que, según cuentan, rescata a los marineros perdidos en tormentas en alta mar.", 2.2, 210, 1, 91, 134, 80, 95, "Foco Interno", "", 0, "Raro"),
  crear(9, "Blastoise", ["Agua"], "Blastoise dispara chorros de agua a presión desde los cañones de su caparazón, capaces de perforar acero.", 1.6, 85.5, 1, 79, 83, 78, 100, "Torrente", "", 0, "Poco común"),
  crear(815, "Cinderace", ["Fuego"], "Cinderace es un delantero estrella: patea una piedra en llamas con tanta fuerza que se vuelve un proyectil de fuego.", 1.4, 33, 8, 80, 116, 119, 75, "Mar Llamas", "", 0, "Raro"),
  crear(196, "Espeon", ["Psíquico"], "Espeon usa el pelaje sensible de su cuerpo para detectar las corrientes de aire y predecir los movimientos del rival.", 0.9, 26.5, 2, 65, 65, 110, 60, "Sincronía", "", 0, "Raro")
];

export const usuariosIniciales = [
  { id: 1, nombre: "Administrador", email: "admin@pokeapp.com", username: "admin", password: "admin123", avatar: `${SPR}25.png`, admin: true }
];
