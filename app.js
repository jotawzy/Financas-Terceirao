// ================================
// app.js
// ================================

import {

    escutarPorquinhos,

} from "./database.js";

import {

    mostrarPorquinhos,
    mostrarPendencias,
    abrirPagina

} from "./ui.js";

// ================================
// INICIAR
// ================================

window.addEventListener("DOMContentLoaded",()=>{

    abrirPagina("caixa");

    escutarPorquinhos((dados)=>{

        mostrarPorquinhos(dados);

    });

//    escutarPendencias((dados)=>{

  //      mostrarPendencias(dados);

//    });

});

import "./pendencias.js";
import "./destinacoes.js";

const abrirCarne = document.getElementById("abrir-carne");

if (abrirCarne) {

    abrirCarne.onclick = () => {

        window.location.href = "carne.html";

    };

}

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