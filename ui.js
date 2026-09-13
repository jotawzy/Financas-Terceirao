import { criarPorquinho, salvarPorquinho, excluirPorquinho } from "./database.js";

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
    const alvo = document.getElementById(id);
    if (alvo) alvo.classList.add("active");
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

    if (totalPix) totalPix.textContent = dinheiro(pix);
    if (totalFisico) totalFisico.textContent = dinheiro(fisico);
    if (totalGeral) totalGeral.textContent = dinheiro(pix + fisico);
}

export function mostrarPorquinhos(dados) {
    porquinhos = dados || {};
    if (!listaPorquinhos) return;
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
    if (!p) return;
    
    abrirPagina("detalhes");
    
    if (titulo) titulo.textContent = p.nome || "Novo Porquinho";
    if (campoNome) campoNome.value = p.nome || "";
    if (campoDescricao) campoDescricao.value = p.descricao || "";
    if (campoPix) campoPix.value = p.pix || 0;
    if (campoFisico) campoFisico.value = p.fisico || 0;
    if (campoObservacoes) campoObservacoes.value = p.observacoes || "";
    if (statusSalvar) statusSalvar.textContent = "";
}

export function limparFormulario() {
    porquinhoAtual = null;
    if (titulo) titulo.textContent = "Novo Porquinho";
    if (campoNome) campoNome.value = "";
    if (campoDescricao) campoDescricao.value = "";
    if (campoPix) campoPix.value = 0;
    if (campoFisico) campoFisico.value = 0;
    if (campoObservacoes) campoObservacoes.value = "";
    if (statusSalvar) statusSalvar.textContent = "";
}

function marcarAlterado() {
    if (statusSalvar) statusSalvar.textContent = "Alterações não salvas";
}

[campoNome, campoDescricao, campoPix, campoFisico, campoObservacoes].forEach(campo => {
    if (campo) campo.addEventListener("input", marcarAlterado);
});

const botaoVoltar = document.getElementById("voltar");
if (botaoVoltar) botaoVoltar.onclick = () => abrirPagina("porquinhos");

const botaoNovoPorquinho = document.getElementById("novo-porquinho");
if (botaoNovoPorquinho) {
    botaoNovoPorquinho.onclick = () => {
        limparFormulario();
        abrirPagina("detalhes");
    };
}

export function mostrarPendencias(dados) {
    pendencias = dados || {};
    if (!listaPendencias) return;
    listaPendencias.innerHTML = "";

    Object.entries(pendencias).forEach(([id, p]) => {
        const item = document.createElement("div");
        item.className = "pendencia";
        item.innerHTML = `
            <strong>${p.titulo}</strong>
            <p>${p.descricao || ""}</p>
        `;
        listaPendencias.appendChild(item);
    });
}

const botaoSalvar = document.getElementById("salvar");
if (botaoSalvar) {
    botaoSalvar.onclick = async () => {
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

        if (statusSalvar) statusSalvar.textContent = "Salvo!";
        abrirPagina("porquinhos");
    };
}

const botaoExcluir = document.getElementById("excluir");
if (botaoExcluir) {
    botaoExcluir.onclick = async () => {
        if (!porquinhoAtual) return;
        if (!confirm("Excluir este porquinho?")) return;

        await excluirPorquinho(porquinhoAtual);
        abrirPagina("porquinhos");
    };
}

export { porquinhos, pendencias, porquinhoAtual };