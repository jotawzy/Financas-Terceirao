import { db } from "./firebase.js";
import {
    ref,
    set,
    onValue
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-database.js";

const refCarnes = ref(db, "financeiro/carnes");

const alunos = [
    { nome:"Adriele", valor:25 },
    { nome:"Alexandre", valor:25 },
    { nome:"Allan", valor:25 },
    { nome:"Bruno", valor:30 },
    { nome:"Caíque", valor:25 },
    { nome:"Carlos Eduardo", valor:25 },
    { nome:"Carol", valor:25 },
    { nome:"Dante", valor:25 },
    { nome:"Diogo", valor:30 },
    { nome:"Eduarda", valor:25 },
    { nome:"Edivaldo", valor:25 },
    { nome:"Josiel", valor:25 },
    { nome:"Kaio Vitor", valor:25 },
    { nome:"Kalif Ruan", valor:30 },
    { nome:"Kauã", valor:25 },
    { nome:"Kettelly", valor:25 },
    { nome:"Laine", valor:25 },
    { nome:"Lazaro Ryan", valor:25 },
    { nome:"Mateus", valor:25 },
    { nome:"Pedro Henrique", valor:25 },
    { nome:"Rafael", valor:25 },
    { nome:"Rogaciano", valor:25 }
].sort((a,b)=> a.nome.localeCompare(b.nome, "pt-BR"));

const meses = ["julho", "agosto", "setembro", "outubro", "novembro"];
const lista = document.getElementById("lista-carne");
const total = document.getElementById("total-carne");

let pagamentos = {};
let primeiraRenderizacao = true;

// ⚡ CACHE DOS ELEMENTOS DO DOM (Evita procuras repetidas no navegador)
const domCache = {
    valores: {},
    checkboxes: {}
};

onValue(refCarnes, (snapshot) => {
    pagamentos = snapshot.val() || {};
    if (primeiraRenderizacao) {
        construirDOM();
        primeiraRenderizacao = false;
    }
    sincronizarDOM();
    atualizarTotal();
});

function dinheiro(valor){
    return Number(valor || 0).toLocaleString("pt-BR",{
        style:"currency",
        currency:"BRL"
    });
}

function construirDOM() {
    lista.innerHTML = "";
    const fragmento = document.createDocumentFragment();

    alunos.forEach(aluno => {
        const id = aluno.nome.normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/\s+/g,"_").toLowerCase();
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
                    <span>${mes.substring(0,3).toUpperCase()}</span>
                    <input type="checkbox" class="check-carne" id="check-${id}-${mes}" data-aluno="${id}" data-mes="${mes}">
                </label>
            `;
        });

        html += `</div>`;
        card.innerHTML = html;
        fragmento.appendChild(card);
    });

    lista.appendChild(fragmento);

    // ⚡ GUARDA REFERÊNCIAS EM MEMÓRIA
    alunos.forEach(aluno => {
        const id = aluno.nome.normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/\s+/g,"_").toLowerCase();
        domCache.valores[id] = document.getElementById(`valor-${id}`);
        domCache.checkboxes[id] = {};
        meses.forEach(mes => {
            domCache.checkboxes[id][mes] = document.getElementById(`check-${id}-${mes}`);
        });
    });
}

function sincronizarDOM() {
    alunos.forEach(aluno => {
        const id = aluno.nome.normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/\s+/g,"_").toLowerCase();
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

document.addEventListener("change", async (e) => {
    if (!e.target.classList.contains("check-carne")) return;

    const aluno = e.target.dataset.aluno;
    const mes = e.target.dataset.mes;
    const isChecked = e.target.checked;

    const estadoAtual = pagamentos[aluno] || {
        julho: false,
        agosto: false,
        setembro: false,
        outubro: false,
        novembro: false
    };

    const novoEstado = {
        ...estadoAtual,
        [mes]: isChecked
    };

    pagamentos[aluno] = novoEstado;
    
    // Atualiza logo a interface localmente antes de esperar pela rede
    sincronizarDOM();
    atualizarTotal();

    try {
        await set(ref(db, `financeiro/carnes/${aluno}`), novoEstado);
    } catch (err) {
        console.error("Erro ao guardar:", err);
    }
});

function atualizarTotal() {
    let arrecadado = 0;
    alunos.forEach(aluno => {
        const id = aluno.nome.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g,"_").toLowerCase();
        const dados = pagamentos[id] || {};
        meses.forEach(mes => {
            if (dados[mes]) arrecadado += aluno.valor;
        });
    });
    total.textContent = dinheiro(arrecadado);
}

document.getElementById("voltar-caixa").onclick = () => {
    window.location.href = "index.html";
};