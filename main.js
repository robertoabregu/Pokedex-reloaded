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

    const imageUrl = poke.sprites.other["official-artwork"].front_default
        ? poke.sprites.other["official-artwork"].front_default
        : 'img/no-pokemon.image.png'; // Ruta de tu imagen local

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
        <img src="${imageUrl}" alt="${poke.name}">
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

const pokemonModal = document.getElementById("pokemonModal");
const closeModalButton = document.getElementById("closeModal");
const modalPokemonInfo = document.getElementById("modalPokemonInfo");

listaPokemon.addEventListener("click", (event) => {
    const tarjetaPokemon = event.target.closest(".pokemon");
    if (tarjetaPokemon) {
        const pokemonId = tarjetaPokemon.getAttribute("data-id");
        mostrarModalPokemon(pokemonId);
    }
});

function mostrarModalPokemon (pokemonId) {
    const URL_POKEMON = `${URL_BASE}${pokemonId}`;
    const URL_POKEMON_INFO = `${URL_BASE_MORE_INFO}${pokemonId}`;

    fetch(URL_POKEMON)
        .then((response) => response.json())
        .then((pokemonData) => {
            fetch(URL_POKEMON_INFO)
                .then((response) => response.json())
                .then((pokemonInfoData) => {
                    // Ahora, realiza una tercera solicitud para obtener la información de evolution_chain.url
                    fetch(pokemonInfoData.evolution_chain.url)
                        .then((response) => response.json())
                        .then((evolutionData) => {
                            // Combina la información de los tres endpoints en un solo objeto
                            const combinedPokemonData = {
                                ...pokemonData,
                                pokemonInfo: {
                                    ...pokemonInfoData,
                                    evolution_chain: evolutionData
                                }
                            };

                            let tipos = combinedPokemonData.types.map((type) =>
                                `<p class="${type.type.name} tipo">${type.type.name}</p>`
                            );
                            tipos = tipos.join('');

                            let flavorText = "Todavía no hay descripción disponible";
                            if (pokemonInfoData && pokemonInfoData.flavor_text_entries && pokemonInfoData.flavor_text_entries.length > 6) {
                                flavorText = pokemonInfoData.flavor_text_entries[6].flavor_text.replace(/\f/g, '');
                                if (!flavorText) {
                                    flavorText = "Todavía no hay descripción disponible";
                                }
                            }

                            const imageUrl = combinedPokemonData.sprites.other["official-artwork"].front_default
                                ? combinedPokemonData.sprites.other["official-artwork"].front_default
                                : 'img/no-pokemon.image.png'; // Ruta de tu imagen local

                            const modalContent = `
                            <div class="modal-pokemon-info">
                                <div class="upper-data">
                                    <div class="row row-cols-auto">
                                        <div class="col col-md-6">
                                            <img src="${imageUrl}" alt="${combinedPokemonData.name}">
                                        </div>
                                        <div class="col-md-6 col-data">
                                            <h3 class="modal-pokemon-nombre">${combinedPokemonData.name}</h3>
                                            <div class="modal-tipos">
                                            ${tipos}
                                            </div>
                                            <div class="h-w">
                                            <p class="stat">${combinedPokemonData.height}0 cm</p>
                                            <p class="stat">${combinedPokemonData.weight / 10} kg</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="row">
                                        <div class="col-md-12 modal-pokemon-text">
                                            <p>${flavorText}</p>
                                        </div>
                                    </div>
                                </div>                              
                                <div class="pokemon-stats-frame">
                                    <h3>STATS</h3>
                                    <div class="pokemon-stats-bar">
                                        <div class="stats">
                                            <p>HP</p>
                                            <p>ATK</p>
                                            <p>DEF</p>
                                            <p>SPD</p>
                                            <p>SPA</p>
                                            <p>SPD</p>
                                        </div>
                                        <div class="bars ">
                                            <div class="stat-bar slide-in-left" id="hp-bar"></div>
                                            <div class="stat-bar slide-in-left" id="atk-bar"></div>
                                            <div class="stat-bar slide-in-left" id="def-bar"></div>
                                            <div class="stat-bar slide-in-left" id="spd-bar"></div>
                                            <div class="stat-bar slide-in-left" id="spa-bar"></div>
                                            <div class="stat-bar slide-in-left" id="speed-bar"></div>
                                        </div>
                                        <div class="stats-values">
                                            <p id="hp-value">${combinedPokemonData.stats[0].base_stat}</p>
                                            <p id="atk-value">${combinedPokemonData.stats[1].base_stat}</p>
                                            <p id="def-value">${combinedPokemonData.stats[2].base_stat}</p>
                                            <p id="spd-value">${combinedPokemonData.stats[5].base_stat}</p>
                                            <p id="spa-value">${combinedPokemonData.stats[4].base_stat}</p>
                                            <p id="speed-value">${combinedPokemonData.stats[3].base_stat}</p>
                                        </div>
                                    </div>
                                </div>
                                <div class="evolution">
                                    <h3>Evolutions</h3>
                                    <ul id="evolutionList"></ul>
                                </div>
                            </div>                                
                            `;

                            modalPokemonInfo.innerHTML = modalContent;

                            // Muestra el modal
                            pokemonModal.style.display = "flex";
                            closeModalButton.style.display = "flex";

                            // Actualiza el ancho de las barras de estadísticas
                            actualizarBarrasDeEstadisticas(combinedPokemonData);

                            // Obtiene las imágenes de las evoluciones y las agrega a la lista
                            const evolutionList = document.getElementById("evolutionList");
                            obtenerImagenesEvoluciones(combinedPokemonData.pokemonInfo.evolution_chain.chain, evolutionList);
                        })
                        .catch((error) => console.error("Error al cargar la cadena de evolución", error));
                })
                .catch((error) => console.error("Error al cargar el Pokémon Info", error));
        })
        .catch((error) => console.error("Error al cargar el Pokémon", error));
}

function obtenerImagenesEvoluciones (chain, evolutionList) {
    if (chain && chain.species) { // Verificar si 'chain' y 'chain.species' están definidos
        const pokemonId = obtenerPokemonIdDesdeUrl(chain.species.url);

        fetch(`${URL_BASE}${pokemonId}`)
            .then((response) => response.json())
            .then((pokemonData) => {
                const imageUrl = pokemonData.sprites.other["official-artwork"].front_default
                    ? pokemonData.sprites.other["official-artwork"].front_default
                    : 'img/no-pokemon.image.png'; // Ruta de tu imagen local
                const listItem = document.createElement("li");
                listItem.innerHTML = `<img src="${imageUrl}" alt="${pokemonData.name}"> ${pokemonData.name}`;
                evolutionList.appendChild(listItem);

                // Llama recursivamente para la siguiente evolución
                obtenerImagenesEvoluciones(chain.evolves_to[0], evolutionList);
            })
            .catch((error) => console.error("Error al cargar la imagen de la evolución", error));
    }
}

function obtenerPokemonIdDesdeUrl (url) {
    const partesUrl = url.split("/");
    return partesUrl[partesUrl.length - 2];
}

function cerrarModalPokemon () {
    // Cierra el modal
    pokemonModal.style.display = "none";
    closeModalButton.style.display = "none";
}

closeModalButton.addEventListener("click", () => {
    cerrarModalPokemon();
});

// Cerrar modal haciendo click en cualquier lado
document.addEventListener("click", (event) => {
    if (event.target === pokemonModal) {
        cerrarModalPokemon();
    }
});

function actualizarBarrasDeEstadisticas (pokemonData) {
    // Obtén los valores de los stats del Pokémon
    const hp = pokemonData.stats[0].base_stat;
    const atk = pokemonData.stats[1].base_stat;
    const def = pokemonData.stats[2].base_stat;
    const spd = pokemonData.stats[3].base_stat;
    const spa = pokemonData.stats[4].base_stat;
    const speed = pokemonData.stats[5].base_stat;

    // Actualiza el ancho de las barras de stats
    document.getElementById("hp-bar").style.width = `${hp}%`;
    document.getElementById("atk-bar").style.width = `${atk}%`;
    document.getElementById("def-bar").style.width = `${def}%`;
    document.getElementById("spd-bar").style.width = `${spd}%`;
    document.getElementById("spa-bar").style.width = `${spa}%`;
    document.getElementById("speed-bar").style.width = `${speed}%`;
}

obtenerPokemon("1gen", null);