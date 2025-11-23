let synonyms = {}; // Kombinert synonymdata lastes inn her
let antonyms = {}; // Holder antonymdata
let wordChain = []; // Holder ordene i kjeden
let currentWord = null; // Gjeldende ord
let selectedAntonymPair = []; // Valgt antonympar
let inAntonymMode = false; // Flag for å sjekke om vi er i antonym-spillmodus

// Last inn både synonym.json og antonym.json
Promise.all([
    fetch('synonym.json').then(response => response.json()), // Første synonymfil
    fetch('synonymOO.json').then(response => response.json()), // Andre synonymfil
    fetch('antonym.json').then(response => response.json()) // Antonymfil
])
    .then(([jsonData1, jsonData2, antonymData]) => {
        synonyms = mergeSynonymData(jsonData1, jsonData2); // Kombiner synonymer
        antonyms = antonymData; // Lagre antonymene
        console.log("Kombinerte synonymer lastet inn:", synonyms); // Debug
        console.log("Antonymer lastet inn:", antonyms); // Debug
        selectRandomAntonymPair(); // Velg et tilfeldig antonympar når data er lastet
    })
    .catch(error => {
        console.error("Feil ved lasting av data:", error);
    });

// Funksjon for å kombinere og sortere synonymdata
function mergeSynonymData(data1, data2) {
    const merged = { ...data1 }; // Start med første datasett

    for (const word in data2) {
        if (merged[word]) {
            // Hvis ordet allerede finnes, kombiner og fjern duplikater
            merged[word] = Array.from(new Set(merged[word].concat(data2[word]))).sort();
        } else {
            // Ellers legg til som nytt
            merged[word] = data2[word];
        }
    }

    return merged;
}

// Velg et tilfeldig antonympar
function selectRandomAntonymPair() {
    const antonymKeys = Object.keys(antonyms);
    const randomKey = antonymKeys[Math.floor(Math.random() * antonymKeys.length)];

    // Sjekk om vi har et antonympar
    if (antonyms[randomKey]) {
        selectedAntonymPair = [randomKey, antonyms[randomKey][0]]; // Første antonym og et tilfeldig annet antonym fra listen
        displayAntonymPair(); // Vis antonymene på skjermen
    }
}

// Vis antonymene på skjermen
function displayAntonymPair() {
    const antonymDisplay = document.getElementById("antonym-pair");
    antonymDisplay.innerHTML = `<strong>Start med antonympar:</strong> ${selectedAntonymPair[0]} → ${selectedAntonymPair[1]}`;
}

// Håndter klikk på antonympar og start spillet
document.getElementById("antonym-pair").addEventListener("click", function() {
    // Start spillet med det første antonymet
    currentWord = selectedAntonymPair[0];
    wordChain = [currentWord]; // Initialiser kjeden med det første antonymet
    inAntonymMode = true; // Sett spillmodus til antonym
    updateDisplay();
    message.innerText = `Vi starter med ${currentWord} – finn en synonymkjede til ${selectedAntonymPair[1]}.`;
    message.className = "info";

    // Vis synonymer for det første ordet
    showSynonyms(currentWord);

    // Start spillet
    playAntonymGame();
});

// Funksjon for å håndtere spillet fra synonym til antonym
function playAntonymGame() {
    const input = document.getElementById("user-input").value.trim().toLowerCase();

    // Hvis vi er i antonym-modus, sjekk om vi har nådd det andre antonymet
    if (inAntonymMode) {
        if (input === selectedAntonymPair[1]) {
            message.innerText = `Gratulerer! Du kom til ${input} på ${wordChain.length} steg.`;
            message.className = "success";
            endGame(); // Avslutt spillet når vi når det andre antonymet
        }
    }
}

// Håndter innsendt ord
function submitWord() {
    const input = document.getElementById("user-input").value.trim().toLowerCase();
    const message = document.getElementById("message");

    if (!currentWord) {
        // Start et nytt spill
        if (input in synonyms) {
            currentWord = input;
            wordChain.push(currentWord);
            updateDisplay();
            message.innerText = "Start! Fortsett med et synonym.";
            message.className = "success";
            showSynonyms(input); // Vis synonymer
        } else {
            message.innerText = "Ordet finnes ikke i synonymlisten. Prøv et annet.";
            message.className = "error";
        }
    } else {
        // Sjekk om det nye ordet er et synonym for det nåværende ordet
        const validSynonyms = synonyms[currentWord];
        if (validSynonyms && validSynonyms.includes(input)) {
            currentWord = input;
            wordChain.push(currentWord);
            updateDisplay();
            message.innerText = "Riktig! Fortsett med et synonym.";
            message.className = "success";
            showSynonyms(input); // Vis synonymer
            
                if (inAntonymMode) {
        if (input === selectedAntonymPair[1]) {
            message.innerText = `Gratulerer! Du kom til ${input} på ${wordChain.length} steg.`;
            message.className = "success";
            endGame(); // Avslutt spillet når vi når det andre antonymet
        }
    }
            
        } else {
            message.innerText = "Feil! Ordet er ikke et synonym. Prøv igjen.";
            message.className = "error";
        }
    }

    document.getElementById("user-input").value = ""; // Tøm inputfeltet
}

// Oppdater skjermen
function updateDisplay() {
    const chainLength = wordChain.length;
    document.getElementById("word-chain").innerText = wordChain.join(" → ");
    document.getElementById("chain-length").innerText = `${chainLength}`;
}

// Vis synonymer under ordet
function showSynonyms(word) {
    const synonymList = synonyms[word];
    const synonymDisplay = document.getElementById("synonym-list");

    if (synonymList) {
        synonymDisplay.innerHTML = `<strong>${word}: </strong> ${synonymList.join(", ")}`;
    } else {
        synonymDisplay.innerHTML = "Ingen synonymer funnet.";
    }
}

// Avslutt spillet når du når det andre antonymet
function endGame() {
    message.innerText = `Du fullførte spillet med ${wordChain.length} steg!`;
    message.className = "success";
    inAntonymMode = false; // Sett spillmodus tilbake til synonym-modus
    selectedAntonymPair = []; // Nullstill antonymparet
    wordChain = []; // Nullstill ordkjeden
}

// Legg til Enter-tast som innsending
document.getElementById("user-input").addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        event.preventDefault(); // Forhindre ny linje i tekstfeltet
        submitWord(); // Kall submitWord-funksjonen
    }
});

// Start et nytt spill (eller når siden lastes)
window.onload = () => {
    document.getElementById("user-input").focus();
};

document.getElementById("toggle-synonyms").addEventListener("click", function() {
    const synonymList = document.getElementById("synonym-list");
    if (synonymList.style.display === "none" || synonymList.style.display === "") {
        synonymList.style.display = "block"; // Vis synonymlisten
        this.innerText = "Skjul synonymer"; // Endre knappetekst
    } else {
        synonymList.style.display = "none"; // Skjul synonymlisten
        this.innerText = "Vis synonymer"; // Endre knappetekst
    }
});