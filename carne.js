import { db } from "./firebase.js";
import {
    ref,
    set,
    onValue
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

const refCarnes = ref(db, "financeiro/carnes");

const alunos = [
    { nome: "Adriele", valor: 25 },
    { nome: "Alexandre", valor: 25 },
    { nome: "Allan", valor: 25 },
    { nome: "Bruno", valor: 30 },
    { nome: "Caíque", valor: 25 },
    { nome: "Carlos Eduardo", valor: 25 },
    { nome: "Carol", valor: 25 },
    { nome: "Dante", valor: 25 },
    { nome: "Diogo", valor: 30 },
    { nome: "Eduarda", valor: 25 },
    { nome: "Edivaldo", valor: 25 },
    { nome: "Josiel", valor: 25 },
    { nome: "Kaio Vitor", valor: 25 },
    { nome: "Kalif Ruan", valor: 30 },
    { nome: "Kauã", valor: 25 },
    { nome: "Kettelly", valor: 25 },
    { nome: "Laine", valor: 25 },
    { nome: "Lazaro Ryan", valor: 25 },
    { nome: "Mateus", valor: 25 },
    { nome: "Pedro Henrique", valor: 25 },
    { nome: "Rafael", valor: 25 },
    { nome: "Rogaciano", valor: 25 }
].sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));

const meses = ["julho", "agosto", "setembro", "outubro", "novembro"];
const lista = document.getElementById("lista-carne");
const totalEl = document.getElementById("total-carne");
const totalFaltaEl = document.getElementById("total-falta");

const valorTotalEsperado = alunos.reduce((acc, aluno) => acc + (aluno.valor * meses.length), 0);

let pagamentos = {};
let primeiraRenderizacao = true;

const domCache = {
    valores: {},
    checkboxes: {}
};

function dinheiro(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

function getIdAluno(nome) {
    return nome.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "_").toLowerCase();
}

function construirDOM() {
    if (!lista) return;
    lista.innerHTML = "";
    const fragmento = document.createDocumentFragment();

    domCache.valores = {};
    domCache.checkboxes = {};

    alunos.forEach(aluno => {
        const id = getIdAluno(aluno.nome);
        const card = document.createElement("div");
        card.className = "porquinho";

        let html = `
            <div class="section-title">
                <div>
                    <h3>${aluno.nome}</h3>
                    <div class="descricao">${dinheiro(aluno.valor)} por parcela</div>
                </div>
                <div class="valor" id="valor-${id}">
                    R$ 0,00
                </div>
            </div>
            <div class="meses">
        `;

        meses.forEach(mes => {
            html += `
                <label class="mes-checkbox">
                    <span>${mes.substring(0, 3).toUpperCase()}</span>
                    <input type="checkbox" class="check-carne" id="check-${id}-${mes}" data-aluno="${id}" data-mes="${mes}">
                </label>
            `;
        });

        html += `</div>`;
        card.innerHTML = html;
        fragmento.appendChild(card);
    });

    lista.appendChild(fragmento);

    alunos.forEach(aluno => {
        const id = getIdAluno(aluno.nome);
        domCache.valores[id] = document.getElementById(`valor-${id}`);
        domCache.checkboxes[id] = {};
        meses.forEach(mes => {
            domCache.checkboxes[id][mes] = document.getElementById(`check-${id}-${mes}`);
        });
    });
}

function sincronizarDOM() {
    alunos.forEach(aluno => {
        const id = getIdAluno(aluno.nome);
        const dados = pagamentos[id] || {};
        let parcelasPagas = 0;

        meses.forEach(mes => {
            const checkbox = domCache.checkboxes[id]?.[mes];
            if (checkbox) {
                const isPago = Boolean(dados[mes]);
                if (checkbox.checked !== isPago) {
                    checkbox.checked = isPago;
                }
                if (isPago) parcelasPagas++;
            }
        });

        const elementoValor = domCache.valores[id];
        if (elementoValor) {
            elementoValor.textContent = dinheiro(aluno.valor * parcelasPagas);
        }
    });
}

function atualizarTotal() {
    let arrecadado = 0;

    alunos.forEach(aluno => {
        const id = getIdAluno(aluno.nome);
        const dados = pagamentos[id] || {};
        meses.forEach(mes => {
            if (dados[mes]) arrecadado += aluno.valor;
        });
    });

    const falta = Math.max(0, valorTotalEsperado - arrecadado);

    if (totalEl) totalEl.textContent = dinheiro(arrecadado);
    if (totalFaltaEl) totalFaltaEl.textContent = dinheiro(falta);
}

onValue(refCarnes, (snapshot) => {
    pagamentos = snapshot.val() || {};
    if (primeiraRenderizacao) {
        construirDOM();
        primeiraRenderizacao = false;
    }
    sincronizarDOM();
    atualizarTotal();
});

document.addEventListener("change", async (e) => {
    if (!e.target.classList.contains("check-carne")) return;

    const alunoId = e.target.dataset.aluno;
    const mes = e.target.dataset.mes;

    if (!alunoId || !mes) return;

    const isChecked = e.target.checked;
    const estadoAtual = pagamentos[alunoId] || {};
    const novoEstado = {
        ...estadoAtual,
        [mes]: isChecked
    };

    pagamentos[alunoId] = novoEstado;

    sincronizarDOM();
    atualizarTotal();

    try {
        const path = `financeiro/carnes/${alunoId}`;
        await set(ref(db, path), novoEstado);
    } catch (err) {
        console.error("Erro ao guardar no Firebase:", err);
    }
});

const btnVoltar = document.getElementById("voltar-caixa");
if (btnVoltar) {
    btnVoltar.onclick = () => {
        window.location.href = "index.html";
    };
}