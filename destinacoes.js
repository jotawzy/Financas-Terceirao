// ================================
// destinacoes.js
// ================================

import { db } from "./firebase.js";
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
const formulario = document.getElementById("form-destinacao");
const tituloForm = document.getElementById("titulo-form-destinacao");

const campoNome = document.getElementById("destinacao-nome");
const campoDescricao = document.getElementById("destinacao-descricao");
const campoValor = document.getElementById("destinacao-valor");

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

// Escuta os porquinhos para saber o saldo real total atualizado
onValue(refPorquinhos, (snapshot) => {
    porquinhos = snapshot.val() || {};
    recalcularSimulacao();
});

// Escuta as destinações salvas para a simulação
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
    
    // Soma o valor real de todos os porquinhos cadastrados
    Object.values(porquinhos).forEach(p => {
        totalReal += Number(p.pix || 0) + Number(p.fisico || 0);
    });

    let totalAlocado = 0;
    // Soma o valor de todas as simulações criadas nesta aba
    Object.values(destinacoes).forEach(d => {
        totalAlocado += Number(d.valor || 0);
    });

    let saldoRestante = totalReal - totalAlocado;

    // Atualiza a tela da aba de simulação
    txtSaldoReal.textContent = formatarMoeda(totalReal);
    txtSaldoRestante.textContent = formatarMoeda(saldoRestante);

    // Se o saldo restante ficar negativo, muda a cor para vermelho, senão deixa verde
    if (saldoRestante < 0) {
        txtSaldoRestante.style.color = "#ff4d4d";
    } else {
        txtSaldoRestante.style.color = "#4cd137";
    }
}

// ================================
// RENDERIZAR LISTA DE DESTINAÇÕES
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
        card.className = "pendencia"; // Reaproveitando os estilos CSS que você já criou

        card.innerHTML = `
            <h3>${d.nome}</h3>
            <p>${d.descricao || ""}</p>
            <strong>${formatarMoeda(d.valor)}</strong>
        `;

        card.onclick = () => {
            abrirEdicao(id);
        };

        lista.appendChild(card);
    });
}

// ================================
// CONTROLE DO FORMULÁRIO
// ================================
botaoNova.onclick = () => {
    if (formulario.classList.contains("escondido")) {
        destinacaoAtual = null;
        limparFormulario();
        formulario.classList.remove("escondido");
    } else {
        fecharFormulario();
    }
};

function abrirEdicao(id) {
    const d = destinacoes[id];
    destinacaoAtual = id;

    tituloForm.textContent = "Editar Destinação";
    campoNome.value = d.nome || "";
    campoDescricao.value = d.descricao || "";
    campoValor.value = d.valor || 0;

    formulario.classList.remove("escondido");
    formulario.scrollIntoView({ behavior: "smooth", block: "center" });
}

function fecharFormulario() {
    formulario.classList.add("escondido");
    destinacaoAtual = null;
    limparFormulario();
}

function limparFormulario() {
    tituloForm.textContent = "Nova Destinação";
    campoNome.value = "";
    campoDescricao.value = "";
    campoValor.value = 0;
}

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
        alert("Digite um nome para a destinação.");
        return;
    }

    if (destinacaoAtual) {
        await set(ref(db, `financeiro/simulacao_destinacoes/${destinacaoAtual}`), dados);
    } else {
        const novaRef = push(refDestinacoes);
        await set(novaRef, dados);
    }

    fecharFormulario();
};

botaoExcluir.onclick = async () => {
    if (!destinacaoAtual) {
        fecharFormulario();
        return;
    }

    if (confirm("Deseja excluir esta simulação de gasto?")) {
        await remove(ref(db, `financeiro/simulacao_destinacoes/${destinacaoAtual}`));
        fecharFormulario();
    }
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