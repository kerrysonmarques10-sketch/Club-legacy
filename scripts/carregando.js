
const clubName = document.getElementById("club-name");

const clubeSalvo = localStorage.getItem("clubLegacy_selectedClub");

if (clubeSalvo) {
    try {
        const clube = JSON.parse(clubeSalvo);
        clubName.textContent = clube.name;
    } catch (error) {
        clubName.textContent = "Preparando nova carreira";
    }
} else {
    clubName.textContent = "Preparando nova carreira";
}

setTimeout(() => {
    window.location.href = "criar-tecnico.html";
}, 2500);
