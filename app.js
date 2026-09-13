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
});// Exemplo em destinacoes.js / salvamento:
document.getElementById("salvar-destinacao").addEventListener("click", async () => {
    // Extraia apenas primitivos:
    const dadosLimpos = {
        nome: document.getElementById("destinacao-nome").value.trim(),
        descricao: document.getElementById("destinacao-descricao").value.trim(),
        valor: Number(document.getElementById("destinacao-valor").value || 0)
    };

    // NUNCA passe o evento 'e' ou elementos inteiros do DOM para o Firebase:
    // ERRADO: set(refDest, e) ou set(refDest, meuObjetoComDOM)
    // CERTO:
    await set(refDestinacao, dadosLimpos);
});
