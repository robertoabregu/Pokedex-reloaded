const listaPokemon = document.querySelector("#listaPokemon");
const botonesGeneracion = document.querySelectorAll(".btn-generacion");
const botonesTipo = document.querySelectorAll(".btn-tipo");
const URL_BASE = "https://pokeapi.co/api/v2/pokemon/";
const URL_BASE_MORE_INFO = "https://pokeapi.co/api/v2/pokemon-species/";

let generacionSeleccionada = null;
let tipoSeleccionado = null;
const pokemonArrayLegendary = [];

function obtenerPokemon (generacion, tipo = null) {
    listaPokemon.innerHTML = "";

    let startId, endId;

    // Determina el rango de IDs de la generación seleccionada
    switch (generacion) {
        case "1gen":
            startId = 1;
            endId = 152;
            break;
        case "2gen":
            startId = 152;
            endId = 252;
            break;
        case "3gen":
            startId = 252;
            endId = 387;
            break;
        case "4gen":
            startId = 387;
            endId = 494;
            break;
        case "5gen":
            startId = 494;
            endId = 650;
            break;
        case "6gen":
            startId = 650;
            endId = 722;
            break;
        case "7gen":
            startId = 722;
            endId = 810;
            break;
        case "8gen":
            startId = 810;
            endId = 899;
            break;
        case "9gen":
            startId = 899;
            endId = 1017;
            break;
        default:
            startId = 1;
            endId = 152;
            break;
    }

    botonesGeneracion.forEach(boton => boton.classList.remove("active"));

    botonesGeneracion.forEach(boton => {
        if (boton.id === generacion) {
            boton.classList.add("active");
        }
    });


    const pokemonArray = [];

    let loadedCount = 0;

    function verificarFin () {
        loadedCount++;
        // Verifica si se han cargado todos los Pokémon
        if (loadedCount === endId - startId + 1) {
            // Ordenar el array por ID de menor a mayor
            pokemonArray.sort((a, b) => a.id - b.id);
            // Mostrar los Pokémon ordenados
            console.log(pokemonArrayLegendary)
            pokemonArray.forEach(poke => mostrarPokemon(poke,));
        }
    }

    // Busca y almacena los pokemon legendarios
    for (let i = startId; i <= endId; i++) {
        fetch(URL_BASE_MORE_INFO + i)
            .then((response) => response.json())
            .then(data2 => {
                if (data2.is_legendary == true) {
                    pokemonArrayLegendary.push(i);
                }
            });
    }

    for (let i = startId; i <= endId; i++) {
        fetch(URL_BASE + i)
            .then((response) => response.json())
            .then(data => {
                // Verificar si el Pokémon cumple con el filtro de tipo
                if (!tipo || data.types.some(t => t.type.name === tipo)) {
                    pokemonArray.push(data);
                }
                // Verificar si se han obtenido todos los Pokémon
                verificarFin();
            });
    }
    // Verificar si se han obtenido todos los Pokémon
    verificarFin();
}

function mostrarPokemon (poke) {

    let tipos = poke.types.map((type) =>
        `<p class="${type.type.name} tipo">${type.type.name}</p>`
    );
    tipos = tipos.join('');

    let pokeId = poke.id.toString();
    if (pokeId.length === 1) {
        pokeId = "00" + pokeId;
    } else if (pokeId.length === 2) {
        pokeId = "0" + pokeId;
    }

    const div = document.createElement("div");
    div.classList.add("pokemon");
    div.setAttribute("data-aos", "zoom-in");
    div.setAttribute("data-id", poke.id);

    // Verificar si el Pokémon es legendario y aplicar un estilo diferente al marco
    if (pokemonArrayLegendary.includes(poke.id)) {
        div.classList.add("legendary");
    }

    div.innerHTML = `
    <p class="pokemon-id-back">#${pokeId}</p>
    <div class="pokemon-imagen">
        <img src="${poke.sprites.other["official-artwork"].front_default}" alt="${poke.name}">
    </div>
    <div class="pokemon-info">
        <div class="nombre-contenedor">
            <p class="pokemon-id">#${pokeId}</p>
            <h2 class="pokemon-nombre">${poke.name}</h2>
        </div>
        <div class="pokemon-tipos">
            ${tipos}
        </div>
            <div class="pokemon-stats">
            <p class="stat">${poke.height}0 cm</p>
            <p class="stat">${poke.weight / 10} kg</p>
        </div>
    </div>
    `;
    listaPokemon.append(div);
}

listaPokemon.addEventListener("click", (event) => {
    const tarjetaPokemon = event.target.closest(".pokemon"); // Obtiene la tarjeta de Pokémon clickeada
    if (tarjetaPokemon) {
        const pokemonId = tarjetaPokemon.getAttribute("data-id");
        console.log(pokemonId); // Llama a una función para mostrar el popup con el ID del Pokémon
    }
});

botonesGeneracion.forEach(boton => boton.addEventListener("click", (event) => {
    const generacion = event.currentTarget.id;
    generacionSeleccionada = generacion;
    obtenerPokemon(generacion, null); // Obtiene Pokémon de la generación seleccionada
}));

botonesTipo.forEach(boton => boton.addEventListener("click", (event) => {
    const tipo = event.currentTarget.id;
    tipoSeleccionado = tipo;
    obtenerPokemon(generacionSeleccionada, tipo); // Filtra Pokémon por tipo
}));

obtenerPokemon("1gen", null);