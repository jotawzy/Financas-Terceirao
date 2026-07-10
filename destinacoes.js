// ================================
// destinacoes.js
// ================================

import { db } from "./firebase.js";
import { abrirPagina } from "./ui.js";
import {
    ref,
    push,
    set,
    remove,
    onValue
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-database.js";

// ================================
// VARIÁVEIS LOCAIS
// ================================
let porquinhos = {};
let destinacoes = {};
let destinacaoAtual = null;

// ================================
// ELEMENTOS DO DOM
// ================================
const lista = document.getElementById("lista-destinacoes");
const botaoNova = document.getElementById("nova-destinacao");
const botaoVoltar = document.getElementById("voltar-destinacao");
const tituloForm = document.getElementById("titulo-form-destinacao");

const campoNome = document.getElementById("destinacao-nome");
const campoDescricao = document.getElementById("destinacao-descricao");
const campoValor = document.getElementById("destinacao-valor");
const statusSalvar = document.getElementById("status-destinacao");

const botaoSalvar = document.getElementById("salvar-destinacao");
const botaoExcluir = document.getElementById("excluir-destinacao");

const txtSaldoReal = document.getElementById("simulacao-saldo-real");
const txtSaldoRestante = document.getElementById("simulacao-saldo-restante");

// ================================
// REFERÊNCIAS DO FIREBASE
// ================================
const refPorquinhos = ref(db, "financeiro/porquinhos");
const refDestinacoes = ref(db, "financeiro/simulacao_destinacoes");

// ================================
// ESCUTAR BANCO DE DADOS
// ================================

onValue(refPorquinhos, (snapshot) => {
    porquinhos = snapshot.val() || {};
    recalcularSimulacao();
});

onValue(refDestinacoes, (snapshot) => {
    destinacoes = snapshot.val() || {};
    mostrarDestinacoes();
    recalcularSimulacao();
});

// ================================
// LÓGICA DE CÁLCULO (SIMULAÇÃO)
// ================================
function recalcularSimulacao() {
    let totalReal = 0;
    Object.values(porquinhos).forEach(p => {
        totalReal += Number(p.pix || 0) + Number(p.fisico || 0);
    });

    let totalAlocado = 0;
    Object.values(destinacoes).forEach(d => {
        totalAlocado += Number(d.valor || 0);
    });

    let saldoRestante = totalReal - totalAlocado;

    txtSaldoReal.textContent = formatarMoeda(totalReal);
    txtSaldoRestante.textContent = formatarMoeda(saldoRestante);

    if (saldoRestante < 0) {
        txtSaldoRestante.style.color = "#ff4d4d";
    } else {
        txtSaldoRestante.style.color = "#4cd137";
    }
}

// ================================
// RENDERIZAR LISTA DE DESTINAÇÕES (IGUAL OS PORQUINHOS)
// ================================
function mostrarDestinacoes() {
    lista.innerHTML = "";

    if (Object.keys(destinacoes).length === 0) {
        lista.innerHTML = `
            <p class="vazio">Nenhuma destinação simulada ainda.</p>
        `;
        return;
    }

    Object.entries(destinacoes).forEach(([id, d]) => {
        const card = document.createElement("div");
        card.className = "porquinho"; // Reaproveita a classe CSS visual dos porquinhos

        card.innerHTML = `
            <h3>${d.nome}</h3>
            <div class="valor">
                ${formatarMoeda(d.valor)}
            </div>
            <div class="descricao">
                ${d.descricao || ""}
            </div>
            <button class="detalhes">Detalhes</button>
        `;

        card.querySelector(".detalhes").onclick = () => {
            abrirEdicao(id);
        };

        lista.appendChild(card);
    });
}

// ================================
// CONTROLE DE NAVEGAÇÃO / DETALHES
// ================================
botaoNova.onclick = () => {
    destinacaoAtual = null;
    limparFormulario();
    abrirPagina("detalhes-destinacao");
};

botaoVoltar.onclick = () => {
    abrirPagina("destinacoes"); // Volta sem salvar nada
};

function abrirEdicao(id) {
    const d = destinacoes[id];
    destinacaoAtual = id;

    tituloForm.textContent = d.nome || "Editar Destinação";
    campoNome.value = d.nome || "";
    campoDescricao.value = d.descricao || "";
    campoValor.value = d.valor || 0;
    statusSalvar.textContent = "";

    abrirPagina("detalhes-destinacao");
}

function limparFormulario() {
    tituloForm.textContent = "Nova Destinação";
    campoNome.value = "";
    campoDescricao.value = "";
    campoValor.value = 0;
    statusSalvar.textContent = "";
}

// ================================
// MONITORAR ALTERAÇÕES NÃO SALVAS
// ================================
function marcarAlterado() {
    statusSalvar.textContent = "Alterações não salvas";
}

[campoNome, campoDescricao, campoValor].forEach(campo => {
    campo.addEventListener("input", marcarAlterado);
});

// ================================
// AÇÕES: SALVAR E EXCLUIR
// ================================
botaoSalvar.onclick = async () => {
    const dados = {
        nome: campoNome.value.trim(),
        descricao: campoDescricao.value.trim(),
        valor: Number(campoValor.value) || 0
    };

    if (!dados.nome) {
        alert("Informe um nome.");
        return;
    }

    if (destinacaoAtual) {
        await set(ref(db, `financeiro/simulacao_destinacoes/${destinacaoAtual}`), dados);
    } else {
        const novaRef = push(refDestinacoes);
        await set(novaRef, dados);
    }

    statusSalvar.textContent = "Salvo!";
    abrirPagina("destinacoes");
};

botaoExcluir.onclick = async () => {
    if (!destinacaoAtual) return;

    if (!confirm("Excluir esta simulação de destinação?")) return;

    await remove(ref(db, `financeiro/simulacao_destinacoes/${destinacaoAtual}`));
    abrirPagina("destinacoes");
};

// ================================
// AUXILIAR: FORMATAR DINHEIRO
// ================================
function formatarMoeda(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}