import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";

import { getDatabase } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-database.js";

const firebaseConfig = {

    apiKey: "AIzaSyB61Xpg_vXrjo6IwFq51-Qieqzu7TobkxA",

    authDomain: "terceirao-financas.firebaseapp.com",

    databaseURL: "https://terceirao-financas-default-rtdb.firebaseio.com",

    projectId: "terceirao-financas",

    storageBucket: "terceirao-financas.firebasestorage.app",

    messagingSenderId: "1688796412",

    appId: "1:1688796412:web:4913200f8ec54a728e6b79"

};

const app = initializeApp(firebaseConfig);

export const db = getDatabase(app);

let carregado = false;

// O ouvinte do Firebase apenas atualiza valores na memória
onValue(refBanco, (snapshot) => {
    dadosLocais = snapshot.val() || {};
    
    if (!carregado) {
        montarEstruturaEstatica(); // Roda só 1 vez na primeira carga
        carregado = true;
    }
    
    atualizarValoresNaTela(); // Atualiza só os dados alterados sem apagar HTML
});

function montarEstruturaEstatica() {
    lista.innerHTML = "";
    const fragmento = document.createDocumentFragment();

    itens.forEach(item => {
        const card = document.createElement("div");
        card.className = "porquinho";
        
        // Estrutura fixa do HTML com IDs únicos para cada campo que muda
        card.innerHTML = `
            <h3>${item.nome}</h3>
            <span id="valor-${item.id}">R$ 0,00</span>
        `;
        
        fragmento.appendChild(card);
    });

    lista.appendChild(fragmento);
}

function atualizarValoresNaTela() {
    itens.forEach(item => {
        const elValor = document.getElementById(`valor-${item.id}`);
        if (elValor) {
            elValor.textContent = calcularNovoValor(item.id);
        }
    });
}