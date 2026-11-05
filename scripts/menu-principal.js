/* ==============================
   MENU PRINCIPAL - CLUB LEGACY
============================== */

const gameContent = document.getElementById("game-content");


// CARREGAR ESCUDO DO CLUBE

async function carregarEscudoClube() {
    const imagem = document.getElementById("sidebar-club-logo");

    if (!imagem) return;

    try {
        // Recuperar clube escolhido
        const clubeSalvo = localStorage.getItem("clubLegacy_selectedClub");

        if (!clubeSalvo) {
            console.warn("Nenhum clube foi selecionado.");
            imagem.style.display = "none";
            return;
        }

        const clubeSelecionado = JSON.parse(clubeSalvo);

        // Carregar arquivos de mídia
        const [logosResponse, assetsResponse] = await Promise.all([
            fetch("../database/media/club-logos.json"),
            fetch("../database/media/media-assets.json")
        ]);

        if (!logosResponse.ok || !assetsResponse.ok) {
            throw new Error("Não foi possível carregar os arquivos de escudos.");
        }

        const logosData = await logosResponse.json();
        const assetsData = await assetsResponse.json();

        // Encontrar escudo principal do clube
        const logo = logosData.club_logos.find(item =>
            item.club_id === clubeSelecionado.id &&
            item.is_primary === true
        );

        if (!logo) {
            throw new Error("Escudo do clube não encontrado.");
        }

        // Encontrar arquivo da imagem
        const asset = assetsData.media_assets.find(item =>
            item.id === logo.asset_id
        );

        if (!asset) {
            throw new Error("Arquivo da imagem não encontrado.");
        }

        // Exibir escudo
        imagem.src = "../database/media/" + asset.path;
        imagem.alt = asset.alt || "Escudo do clube";

        imagem.onerror = () => {
            imagem.style.display = "none";
            console.error("Não foi possível carregar a imagem do escudo.");
        };

    } catch (error) {
        console.error("Erro ao carregar escudo:", error);
        imagem.style.display = "none";
    }
}


// NAVEGAÇÃO ENTRE SEÇÕES

document.addEventListener("clublegacy:navigate", event => {

    const section = event.detail.section;

    const sectionNames = {
        "inicio": "Início",
        "correio": "Caixa de correio",
        "elenco": "Elenco",
        "tatica": "Tática",
        "relatorio": "Relatório da equipe",
        "treino": "Treino",
        "agenda": "Agenda",
        "observacao": "Observação",
        "transferencia": "Transferência",
        "informacao-clube": "Informação do clube",
        "equipe-tecnica": "Equipe técnica",
        "visao-clube": "Visão do clube",
        "financas": "Finanças",
        "base": "Base"
    };

    const title = sectionNames[section] || "Club Legacy";

    gameContent.innerHTML = `
        <h2>${title}</h2>
        <p>Esta seção será desenvolvida em breve.</p>
    `;
});


// AVANÇAR DIA

document.addEventListener("clublegacy:advance-day", () => {
    alert("O sistema de calendário será desenvolvido em breve!");
});


// INICIAR

carregarEscudoClube();