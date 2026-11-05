
// CLUB LEGACY - CRIAÇÃO DE TÉCNICO

const $ = id => document.getElementById(id);

const MANAGERS_KEY = "clubLegacy_managers";
const ACTIVE_MANAGER_KEY = "clubLegacy_manager";
const CLUB_KEY = "clubLegacy_selectedClub";

const backButton = $("back-button");
const createButton = $("create-button");
const savedManagerButton = $("saved-manager-button");

const photoInput = $("manager-photo");
const photoPreview = $("manager-photo-preview");
const photoIcon = $("photo-icon");
const birthInput = $("manager-birth");

const modal = $("saved-manager-modal");
const managerList = $("saved-manager-list");

let fotoTecnico = "";
let selectedSavedManagerId = null;


// CLUBE SELECIONADO

function carregarClube() {
    try {
        return JSON.parse(localStorage.getItem(CLUB_KEY));
    } catch (error) {
        console.error("Erro ao carregar clube:", error);
        return null;
    }
}

const clube = carregarClube();

$("selected-club-name").textContent =
    clube?.name || "Nenhum clube selecionado";


// BIBLIOTECA DE TÉCNICOS

function carregarTecnicos() {
    try {
        const dados = JSON.parse(localStorage.getItem(MANAGERS_KEY));
        return Array.isArray(dados) ? dados : [];
    } catch (error) {
        console.error("Erro ao carregar técnicos:", error);
        return [];
    }
}

let tecnicosSalvos = carregarTecnicos();

function salvarBiblioteca() {
    localStorage.setItem(MANAGERS_KEY, JSON.stringify(tecnicosSalvos));
}


// MIGRAR TÉCNICO ANTIGO

try {
    const anterior = JSON.parse(localStorage.getItem(ACTIVE_MANAGER_KEY));

    if (
        anterior?.id &&
        !tecnicosSalvos.some(tecnico => tecnico.id === anterior.id)
    ) {
        const perfil = { ...anterior };
        delete perfil.club_id;

        tecnicosSalvos.push(perfil);
        salvarBiblioteca();
    }
} catch (error) {
    console.error("Erro ao migrar técnico:", error);
}


// MENUS PERSONALIZADOS

function configurarMenu(id, valorInicial) {
    const menu = $(id);
    const botao = menu.querySelector(".custom-select-button");
    const texto = botao.querySelector("span");
    const opcoes = [...menu.querySelectorAll(".custom-select-options button")];

    let valorSelecionado = valorInicial;

    botao.addEventListener("click", () => {
        const estavaAberto = menu.classList.contains("open");

        document.querySelectorAll(".custom-select").forEach(item => {
            item.classList.remove("open");
        });

        if (!estavaAberto) menu.classList.add("open");
    });

    opcoes.forEach(opcao => {
        opcao.addEventListener("click", () => {
            valorSelecionado = opcao.dataset.value;
            texto.textContent = opcao.textContent.trim();
            menu.classList.remove("open");
        });
    });

    return {
        getValue: () => valorSelecionado,

        setValue(valor) {
            const opcao = opcoes.find(item => item.dataset.value === valor);

            if (!opcao) return;

            valorSelecionado = valor;
            texto.textContent = opcao.textContent.trim();
        }
    };
}

const formationMenu = configurarMenu("formation-select", "4-3-3");
const experienceMenu = configurarMenu("experience-select", "nenhuma");
const reputationMenu = configurarMenu("reputation-select", "baixa");

document.addEventListener("click", event => {
    if (!event.target.closest(".custom-select")) {
        document.querySelectorAll(".custom-select").forEach(menu => {
            menu.classList.remove("open");
        });
    }
});


// DATA DE NASCIMENTO

birthInput.addEventListener("input", () => {
    const numeros = birthInput.value.replace(/\D/g, "").slice(0, 8);

    let data = numeros.slice(0, 2);

    if (numeros.length >= 2) {
        data += "/" + numeros.slice(2, 4);
    }

    if (numeros.length >= 4) {
        data += "/" + numeros.slice(4, 8);
    }

    birthInput.value = data;
});

function formatarData(data) {
    if (!data) return "";

    if (/^\d{4}-\d{2}-\d{2}$/.test(data)) {
        const [ano, mes, dia] = data.split("-");
        return `${dia}/${mes}/${ano}`;
    }

    return data;
}


// FOTO DO TÉCNICO

function atualizarFoto(foto) {
    fotoTecnico = foto || "";

    photoPreview.hidden = !fotoTecnico;
    photoIcon.hidden = !!fotoTecnico;

    if (fotoTecnico) {
        photoPreview.src = fotoTecnico;
    } else {
        photoPreview.removeAttribute("src");
    }
}

photoInput.addEventListener("change", () => {
    const arquivo = photoInput.files[0];

    if (!arquivo) return;

    if (!arquivo.type.startsWith("image/")) {
        alert("Selecione um arquivo de imagem válido.");
        photoInput.value = "";
        return;
    }

    const leitor = new FileReader();

    leitor.onload = () => atualizarFoto(leitor.result);
    leitor.readAsDataURL(arquivo);
});


// PREENCHER FORMULÁRIO

function preencherFormulario(tecnico) {
    selectedSavedManagerId = tecnico.id;

    $("manager-name").value = tecnico.first_name || "";
    $("manager-surname").value = tecnico.last_name || "";
    $("manager-nationality").value = tecnico.nationality || "";
    birthInput.value = formatarData(tecnico.birth_date);

    formationMenu.setValue(tecnico.preferred_formation || "4-3-3");
    experienceMenu.setValue(tecnico.playing_experience || "nenhuma");
    reputationMenu.setValue(tecnico.reputation || "baixa");

    atualizarFoto(tecnico.photo);

    modal.hidden = true;
}


// BIBLIOTECA DE TÉCNICOS EXISTENTES

function abrirBiblioteca() {
    managerList.innerHTML = "";
    tecnicosSalvos = carregarTecnicos();

    if (tecnicosSalvos.length === 0) {
        const mensagem = document.createElement("p");
        mensagem.textContent =
            "Nenhum técnico salvo foi encontrado. Crie um técnico primeiro.";

        managerList.appendChild(mensagem);
    } else {
        tecnicosSalvos.forEach(tecnico => {
            const botao = document.createElement("button");
            const nome = document.createElement("strong");
            const detalhes = document.createElement("span");

            botao.type = "button";
            botao.className = "saved-manager-option";

            nome.textContent = tecnico.full_name ||
                `${tecnico.first_name || ""} ${tecnico.last_name || ""}`.trim();

            detalhes.textContent =
                `${tecnico.nationality || "Nacionalidade não informada"} · ${tecnico.reputation || "Reputação não informada"}`;

            botao.append(nome, detalhes);
            botao.addEventListener("click", () => preencherFormulario(tecnico));

            managerList.appendChild(botao);
        });
    }

    modal.hidden = false;
}

savedManagerButton.addEventListener("click", abrirBiblioteca);

$("close-manager-modal").addEventListener("click", () => {
    modal.hidden = true;
});

modal.addEventListener("click", event => {
    if (event.target === modal) modal.hidden = true;
});


// NAVEGAÇÃO

backButton.addEventListener("click", () => {
    window.location.href = "selecionar-clube.html";
});


// VALIDAR DATA E IDADE

function validarNascimento(data) {
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(data)) {
        alert("Digite a data no formato DD/MM/AAAA.");
        return null;
    }

    const [dia, mes, ano] = data.split("/").map(Number);
    const nascimento = new Date(ano, mes - 1, dia);
    const hoje = new Date();

    if (
        nascimento.getDate() !== dia ||
        nascimento.getMonth() !== mes - 1 ||
        nascimento.getFullYear() !== ano
    ) {
        alert("Informe uma data de nascimento válida.");
        return null;
    }

    let idade = hoje.getFullYear() - ano;

    if (
        hoje.getMonth() < mes - 1 ||
        (hoje.getMonth() === mes - 1 && hoje.getDate() < dia)
    ) {
        idade--;
    }

    if (idade < 18 || idade > 100 || nascimento > hoje) {
        alert("O técnico deve ter entre 18 e 100 anos.");
        return null;
    }

    return {
        idade,
        data: `${ano}-${String(mes).padStart(2, "0")}-${String(dia).padStart(2, "0")}`
    };
}


// SALVAR TÉCNICO

createButton.addEventListener("click", () => {
    const nome = $("manager-name").value.trim();
    const sobrenome = $("manager-surname").value.trim();
    const nacionalidade = $("manager-nationality").value.trim();
    const nascimento = birthInput.value.trim();

    if (!nome || !sobrenome || !nacionalidade || !nascimento) {
        alert("Preencha nome, sobrenome, nacionalidade e nascimento.");
        return;
    }

    const dataValidada = validarNascimento(nascimento);
    if (!dataValidada) return;

    const idTecnico = selectedSavedManagerId || "manager_" + Date.now();

    const tecnico = {
        id: idTecnico,
        first_name: nome,
        last_name: sobrenome,
        full_name: `${nome} ${sobrenome}`,
        birth_date: dataValidada.data,
        age: dataValidada.idade,
        nationality: nacionalidade,
        preferred_formation: formationMenu.getValue(),
        playing_experience: experienceMenu.getValue(),
        reputation: reputationMenu.getValue(),
        photo: fotoTecnico
    };

    const indice = tecnicosSalvos.findIndex(item => item.id === idTecnico);

    if (indice >= 0) {
        tecnicosSalvos[indice] = tecnico;
    } else {
        tecnicosSalvos.push(tecnico);
    }

    salvarBiblioteca();

    const tecnicoDaCarreira = {
        ...tecnico,
        club_id: clube ? clube.id : null
    };

    localStorage.setItem(
        ACTIVE_MANAGER_KEY,
        JSON.stringify(tecnicoDaCarreira)
    );

    console.log("Técnico salvo:", tecnico);
    console.log("Técnico da carreira:", tecnicoDaCarreira);

    window.location.href = "menu-principal.html";
});
