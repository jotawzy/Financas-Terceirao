import { escutarPorquinhos } from "./database.js";
import { mostrarPorquinhos, abrirPagina } from "./ui.js";
import "./pendencias.js";
import "./destinacoes.js";

window.addEventListener("DOMContentLoaded", () => {
    abrirPagina("caixa");

    escutarPorquinhos((dados) => {
        mostrarPorquinhos(dados);
    });

    const abrirCarne = document.getElementById("abrir-carne");
    if (abrirCarne) {
        abrirCarne.onclick = () => {
            window.location.href = "carne.html";
        };
    }
});