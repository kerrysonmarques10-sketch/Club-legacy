
/* ==============================
   BARRAS FIXAS - CLUB LEGACY
============================== */

// NAVEGAÇÃO LATERAL

const navigationButtons = document.querySelectorAll(".nav-button");

navigationButtons.forEach(button => {

    button.addEventListener("click", () => {

        // Remove a seleção anterior
        navigationButtons.forEach(item => {
            item.classList.remove("active");
        });

        // Seleciona o botão clicado
        button.classList.add("active");

        // Identifica a seção
        const section = button.dataset.section;

        // Avisa a página principal
        document.dispatchEvent(
            new CustomEvent("clublegacy:navigate", {
                detail: { section }
            })
        );

    });

});


// BOTÃO AVANÇAR DIA

const advanceButton = document.getElementById("advance-day");

if (advanceButton) {

    advanceButton.addEventListener("click", () => {

        document.dispatchEvent(
            new CustomEvent("clublegacy:advance-day")
        );

    });

}
