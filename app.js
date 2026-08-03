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