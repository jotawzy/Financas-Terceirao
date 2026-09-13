import { db } from "./firebase.js";
import { ref, onValue } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";
import { criarPorquinho, salvarPorquinho, excluirPorquinho } from "./database.js";

const refPorquinhos = ref(db, "porquinhos");

let porquinhos = {};
let pendencias = {};
let porquinhoAtual = null;

const paginas = document.querySelectorAll(".page");
const botoesMenu = document.querySelectorAll(".nav-btn");
const listaPorquinhos = document.getElementById("lista-porquinhos");
const listaPendencias = document.getElementById("lista-pendencias");
const totalPix = document.getElementById("total-pix");
const totalFisico = document.getElementById("total-fisico");
const totalGeral = document.getElementById("total-geral");
const titulo = document.getElementById("titulo-detalhes");
const campoNome = document.getElementById("nome");
const campoDescricao = document.getElementById("descricao");
const campoPix = document.getElementById("pix");
const campoFisico = document.getElementById("fisico");
const campoObservacoes = document.getElementById("observacoes");
const statusSalvar = document.getElementById("status");

export function abrirPagina(id) {
    paginas.forEach(p => p.classList.remove("active"));
    document.getElementById(id).classList.add("active");
}

botoesMenu.forEach(botao => {
    botao.onclick = () => {
        botoesMenu.forEach(b => b.classList.remove("active"));
        botao.classList.add("active");
        abrirPagina(botao.dataset.page);
    };
});

export function dinheiro(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

export function atualizarCaixa() {
    let pix = 0;
    let fisico = 0;

    Object.values(porquinhos).forEach(p => {
        pix += Number(p.pix || 0);
        fisico += Number(p.fisico || 0);
    });

    totalPix.textContent = dinheiro(pix);
    totalFisico.textContent = dinheiro(fisico);
    totalGeral.textContent = dinheiro(pix + fisico);
}

export function mostrarPorquinhos(dados) {
    porquinhos = dados || {};
    listaPorquinhos.innerHTML = "";

    Object.entries(porquinhos).forEach(([id, p]) => {
        const total = Number(p.pix || 0) + Number(p.fisico || 0);
        const card = document.createElement("div");
        card.className = "porquinho";
        card.innerHTML = `
            <h3>${p.nome}</h3>
            <div class="valor">${dinheiro(total)}</div>
            <div class="descricao">${p.descricao || ""}</div>
            <button class="detalhes">Detalhes</button>
        `;
        
        card.querySelector(".detalhes").onclick = () => abrirDetalhes(id);
        listaPorquinhos.appendChild(card);
    });

    atualizarCaixa();
}

export function abrirDetalhes(id) {
    porquinhoAtual = id;
    const p = porquinhos[id];
    
    abrirPagina("detalhes");
    
    titulo.textContent = p.nome || "Novo Porquinho";
    campoNome.value = p.nome || "";
    campoDescricao.value = p.descricao || "";
    campoPix.value = p.pix || 0;
    campoFisico.value = p.fisico || 0;
    campoObservacoes.value = p.observacoes || "";
    statusSalvar.textContent = "";
}

export function limparFormulario() {
    porquinhoAtual = null;
    titulo.textContent = "Novo Porquinho";
    campoNome.value = "";
    campoDescricao.value = "";
    campoPix.value = 0;
    campoFisico.value = 0;
    campoObservacoes.value = "";
    statusSalvar.textContent = "";
}

function marcarAlterado() {
    statusSalvar.textContent = "Alterações não salvas";
}

[campoNome, campoDescricao, campoPix, campoFisico, campoObservacoes].forEach(campo => {
    campo.addEventListener("input", marcarAlterado);
});

document.getElementById("voltar").onclick = () => abrirPagina("porquinhos");

document.getElementById("novo-porquinho").onclick = () => {
    limparFormulario();
    abrirPagina("detalhes");
};

export function mostrarPendencias(dados) {
    pendencias = dados;
    listaPendencias.innerHTML = "";

    Object.entries(dados || {}).forEach(([id, p]) => {
        const item = document.createElement("div");
        item.className = "pendencia";
        item.innerHTML = `
            <strong>${p.titulo}</strong>
            <p>${p.descricao || ""}</p>
        `;
        listaPendencias.appendChild(item);
    });
}

document.getElementById("salvar").onclick = async () => {
    const dados = {
        nome: campoNome.value.trim(),
        descricao: campoDescricao.value.trim(),
        pix: Number(campoPix.value) || 0,
        fisico: Number(campoFisico.value) || 0,
        observacoes: campoObservacoes.value.trim()
    };

    if (!dados.nome) {
        alert("Informe um nome.");
        return;
    }

    if (porquinhoAtual) {
        await salvarPorquinho(porquinhoAtual, dados);
    } else {
        await criarPorquinho(dados);
    }

    statusSalvar.textContent = "Salvo!";
    abrirPagina("porquinhos");
};

document.getElementById("excluir").onclick = async () => {
    if (!porquinhoAtual) return;
    if (!confirm("Excluir este porquinho?")) return;

    await excluirPorquinho(porquinhoAtual);
    abrirPagina("porquinhos");
};

onValue(refPorquinhos, (snapshot) => {
    mostrarPorquinhos(snapshot.val());
});

export { porquinhos, pendencias, porquinhoAtual };