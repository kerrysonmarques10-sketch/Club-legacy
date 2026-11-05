
// CLUB LEGACY - SELEÇÃO DE CLUBE

const $ = id => document.getElementById(id);

const continentButton = $("continent-button");
const continentButtonLabel = $("continent-button-label");
const continentOptions = $("continent-options");
const clubsList = $("clubs-list");
const divisionFilter = $("division-filter");

const advanceButton = $("advance-button");
const cancelButton = $("cancel-button");

let selectedContinent = null;
let selectedCountry = null;
let selectedClub = null;

let logosPorClube = {};
let assetsPorId = {};

let clubesCache = null;
let midiasCarregadas = false;


// CRIAR MENU

const continentsList = document.createElement("div");
continentsList.className = "continents-list";

const countriesPanel = document.createElement("div");
countriesPanel.className = "countries-panel";
countriesPanel.hidden = true;

continentOptions.append(continentsList, countriesPanel);


// CARREGAR ARQUIVOS JSON

async function carregarJSON(caminho) {
    const response = await fetch(caminho);

    if (!response.ok) {
        throw new Error(`Erro ao carregar: ${caminho}`);
    }

    return response.json();
}


// CARREGAR ESCUDOS

async function carregarMidias() {
    if (midiasCarregadas) return;

    const [logosData, assetsData] = await Promise.all([
        carregarJSON("../database/media/club-logos.json"),
        carregarJSON("../database/media/media-assets.json")
    ]);

    logosData.club_logos.forEach(logo => {
        if (logo.is_primary) {
            logosPorClube[logo.club_id] = logo.asset_id;
        }
    });

    assetsData.media_assets.forEach(asset => {
        assetsPorId[asset.id] = asset;
    });

    midiasCarregadas = true;
}


// CARREGAR CLUBES

async function carregarDatabaseClubes() {
    if (!clubesCache) {
        const data = await carregarJSON("../database/clubs/clubs.json");
        clubesCache = data.clubs || [];
    }

    return clubesCache;
}


// MENU DE CONTINENTES

continentButton.addEventListener("click", () => {
    continentOptions.hidden = !continentOptions.hidden;
});

document.addEventListener("click", event => {
    if (!event.target.closest(".custom-dropdown")) {
        continentOptions.hidden = true;
    }
});


// LIMPAR CLUBE SELECIONADO

function limparSelecaoClube() {
    selectedClub = null;

    document.querySelectorAll(".club-card").forEach(card => {
        card.classList.remove("selected");
    });
}


// CARREGAR CONTINENTES E PAÍSES

async function carregarLocalizacao() {
    try {
        const [continentsData, nationsData] = await Promise.all([
            carregarJSON("../database/world/continents.json"),
            carregarJSON("../database/world/nations.json")
        ]);

        continentsList.innerHTML = "";

        (continentsData.continents || []).forEach(continent => {
            const button = document.createElement("button");
            const arrow = document.createElement("span");

            button.type = "button";
            button.className = "continent-header";
            arrow.textContent = "▶";

            button.append(arrow, document.createTextNode(continent.name));

            button.addEventListener("click", () => {
                selecionarContinente(continent, button, arrow, nationsData.nations || []);
            });

            continentsList.appendChild(button);
        });

    } catch (error) {
        console.error("Erro ao carregar localização:", error);
        alert("Erro ao carregar continentes e países.");
    }
}


// SELECIONAR CONTINENTE

function selecionarContinente(continent, button, arrow, nations) {
    if (selectedContinent?.id === continent.id) {
        selectedContinent = null;
        selectedCountry = null;

        countriesPanel.hidden = true;
        clubsList.innerHTML = "";
        continentButtonLabel.textContent = "Continentes";

        document.querySelectorAll(".continent-header").forEach(item => {
            item.classList.remove("active");
            item.querySelector("span").textContent = "▶";
        });

        limparSelecaoClube();
        return;
    }

    selectedContinent = continent;
    selectedCountry = null;

    clubsList.innerHTML = "";
    limparSelecaoClube();

    continentButtonLabel.textContent = "Continentes";

    document.querySelectorAll(".continent-header").forEach(item => {
        item.classList.remove("active");
        item.querySelector("span").textContent = "▶";
    });

    button.classList.add("active");
    arrow.textContent = "▼";

    const countries = nations.filter(nation =>
        String(nation.continent_id) === String(continent.id)
    );

    mostrarPaises(countries);
}


// MOSTRAR PAÍSES

function mostrarPaises(countries) {
    countriesPanel.innerHTML = "";

    const title = document.createElement("div");
    title.className = "countries-title";
    title.textContent = selectedContinent.name;

    countriesPanel.appendChild(title);
    countriesPanel.hidden = false;

    if (!countries.length) {
        const message = document.createElement("p");
        message.className = "empty-countries";
        message.textContent = "Nenhum país cadastrado.";

        countriesPanel.appendChild(message);
        return;
    }

    countries.forEach(country => {
        const button = document.createElement("button");

        button.type = "button";
        button.className = "country-option";
        button.textContent = country.name;

        button.addEventListener("click", () => {
            selectedCountry = country;
            continentButtonLabel.textContent = country.name;
            continentOptions.hidden = true;

            limparSelecaoClube();
            carregarClubes(country.id);
        });

        countriesPanel.appendChild(button);
    });
}


// CRIAR ESCUDO

function criarEscudo(clube) {
    const crest = document.createElement("div");
    crest.className = "club-crest";

    const assetId = logosPorClube[clube.id];
    const asset = assetsPorId[assetId];

    if (!asset) {
        crest.textContent = "⚽";
        return crest;
    }

    const image = document.createElement("img");

    image.src = "../database/media/" + asset.path;
    image.alt = asset.alt || `Escudo de ${clube.name}`;

    image.onerror = () => {
        image.remove();
        crest.textContent = "⚽";
    };

    crest.appendChild(image);

    return crest;
}


// CARREGAR CLUBES DO PAÍS

async function carregarClubes(countryId) {
    clubsList.innerHTML = "Carregando clubes...";

    try {
        const [clubes] = await Promise.all([
            carregarDatabaseClubes(),
            carregarMidias()
        ]);

        const clubesDoPais = clubes.filter(clube =>
            String(clube.country_id) === String(countryId)
        );

        clubsList.innerHTML = "";

        if (!clubesDoPais.length) {
            clubsList.textContent = "Nenhum clube cadastrado neste país.";
            return;
        }

        clubesDoPais.forEach(clube => {
            const card = document.createElement("button");
            const name = document.createElement("span");

            card.type = "button";
            card.className = "club-card";

            name.className = "club-card-name";
            name.textContent = clube.name;

            card.append(criarEscudo(clube), name);

            card.addEventListener("click", () => {
                document.querySelectorAll(".club-card").forEach(item => {
                    item.classList.remove("selected");
                });

                card.classList.add("selected");
                selectedClub = clube;

                console.log("Clube selecionado:", clube);
            });

            clubsList.appendChild(card);
        });

    } catch (error) {
        console.error("Erro ao carregar clubes:", error);
        clubsList.textContent = "Erro ao carregar clubes.";
    }
}


// FILTRO DE DIVISÃO

divisionFilter.addEventListener("change", () => {
    console.log("Divisão selecionada:", divisionFilter.value);
});


// AVANÇAR

advanceButton.addEventListener("click", () => {
    if (!selectedClub) {
        alert("Selecione um clube antes de continuar.");
        return;
    }

    localStorage.setItem(
        "clubLegacy_selectedClub",
        JSON.stringify(selectedClub)
    );

    window.location.href = "carregando.html";
});


// CANCELAR

cancelButton.addEventListener("click", () => {
    window.location.href = "../index.html";
});


// INICIAR

carregarLocalizacao();
