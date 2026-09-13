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
].sort((a,b)=>
    a.nome.localeCompare(
        b.nome,
        "pt-BR"
    )
);

const meses = [
    "julho",
    "agosto",
    "setembro",
    "outubro",
    "novembro"
];

const lista = document.getElementById("lista-carne");
const total = document.getElementById("total-carne");

let pagamentos = {};

onValue(refCarnes, (snapshot) => {
    pagamentos = snapshot.val() || {};
    renderizarLista();
    atualizarTotal();
});

function dinheiro(valor){
    return Number(valor || 0)
    .toLocaleString("pt-BR",{
        style:"currency",
        currency:"BRL"
    });
}

function renderizarLista(){
    lista.innerHTML="";

    alunos.forEach(aluno=>{
        const id = aluno.nome
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g,"")
            .replace(/\s+/g,"_")
            .toLowerCase();

        const dados = pagamentos[id] || {};

        const card = document.createElement("div");
        card.className="porquinho";

        let html = `
            <div class="section-title">
                <div>
                    <h3>
                        ${aluno.nome}
                    </h3>
                    <div class="descricao">
                        ${dinheiro(aluno.valor)}
                        por parcela
                    </div>
                </div>
                <div class="valor">
                    ${dinheiro(
                        aluno.valor *
                        meses.filter(
                            m => Boolean(dados[m])
                        ).length
                    )}
                </div>
            </div>
            <div class="meses">
        `;

        meses.forEach(mes=>{
            html += `
                <label class="mes-checkbox">
                    <span>
                        ${mes.substring(0,3).toUpperCase()}
                    </span>
                    <input
                        type="checkbox"
                        class="check-carne"
                        data-aluno="${id}"
                        data-mes="${mes}"
                        ${Boolean(dados[mes]) ? "checked" : ""}>
                </label>
            `;
        });

        html += `
            </div>
        `;

        card.innerHTML = html;
        lista.appendChild(card);
    });

    atualizarTotal();
}

document.addEventListener("change", async (e) => {
    if (!e.target.classList.contains("check-carne"))
        return;

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

    try {
        await set(ref(db, `financeiro/carnes/${aluno}`), novoEstado);
        atualizarTotal();
    } catch (err) {
        console.error("Erro ao salvar no Firebase:", err);
    }
});

function atualizarTotal() {
    let arrecadado = 0;

    alunos.forEach(aluno => {
        const id = aluno.nome
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/\s+/g, "_")
            .toLowerCase();

        const dados = pagamentos[id] || {};

        meses.forEach(mes => {
            if (dados[mes]) {
                arrecadado += aluno.valor;
            }
        });
    });

    total.textContent = dinheiro(arrecadado);
}

async function inicializarBanco() {
    for (const aluno of alunos) {
        const id = aluno.nome
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/\s+/g, "_")
            .toLowerCase();

        if (!pagamentos[id]) {
            const estruturaInicial = {
                julho: false,
                agosto: false,
                setembro: false,
                outubro: false,
                novembro: false
            };
            pagamentos[id] = estruturaInicial;
            try {
                await set(ref(db, `financeiro/carnes/${id}`), estruturaInicial);
            } catch (err) {
                console.error(`Erro ao criar estrutura inicial para ${id}:`, err);
            }
        }
    }
    atualizarTotal();
}

document.getElementById("voltar-caixa").onclick = () => {
    window.location.href = "index.html";
};

window.addEventListener("DOMContentLoaded", () => {
    inicializarBanco();
});