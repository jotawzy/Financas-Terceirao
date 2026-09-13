// =========================
// database.js
// =========================

import { db } from "./firebase.js";

import {

    ref,
    push,
    set,
    remove,
    onValue

} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-database.js";

// =========================
// REFERÊNCIAS
// =========================

const PORQUINHOS = ref(db, "financeiro/porquinhos");

// =========================
// PORQUINHOS
// =========================

export function escutarPorquinhos(callback){

    onValue(PORQUINHOS,(snapshot)=>{

        callback(snapshot.val() || {});

    });

}

export function criarPorquinho(dados){

    const novo = push(PORQUINHOS);

    return set(novo,dados);

}

export function salvarPorquinho(id,dados){

    return set(

        ref(db,`financeiro/porquinhos/${id}`),

        dados

    );

}

export function excluirPorquinho(id){

    return remove(

        ref(db,`financeiro/porquinhos/${id}`)

    );

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