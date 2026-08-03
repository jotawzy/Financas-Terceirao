// ================================
// carne.js
// Parte 1/3
// ================================

import { db } from "./firebase.js";

import {

    ref,
    set,
    onValue

} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-database.js";

// ================================
// REFERÊNCIA FIREBASE
// ================================

const refCarnes = ref(db, "financeiro/carnes");

// ================================
// ALUNOS
// ================================

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

// ================================
// MESES
// ================================

const meses = [

    "julho",
    "agosto",
    "setembro",
    "outubro",
    "novembro"

];

// ================================
// ELEMENTOS
// ================================

const lista =
document.getElementById("lista-carne");

const total =
document.getElementById("total-carne");

// ================================
// DADOS
// ================================

let pagamentos = {};

// ================================
// ESCUTAR FIREBASE
// ================================

onValue(refCarnes,(snapshot)=>{

    pagamentos =
    snapshot.val() || {};

    renderizarLista();

});

// ================================
// FORMATAR MOEDA
// ================================

function dinheiro(valor){

    return Number(valor || 0)
    .toLocaleString("pt-BR",{

        style:"currency",

        currency:"BRL"

    });

}

// ================================
// RENDERIZAR
// ================================

function renderizarLista(){

    lista.innerHTML="";

    alunos.forEach(aluno=>{

        const id =
        aluno.nome
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g,"")
        .replace(/\s+/g,"_")
        .toLowerCase();

        const dados =
        pagamentos[id] || {};

        const card =
        document.createElement("div");

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

                <div
                class="valor">

                    ${dinheiro(
                        aluno.valor *
                        meses.filter(
                            m=>dados[m]
                        ).length
                    )}

                </div>

            </div>

            <div class="meses">

        `;

        meses.forEach(mes=>{

            html += `

                <label
                class="mes-checkbox">

                    <span>

                        ${mes.substring(0,3).toUpperCase()}

                    </span>

                    <input
                        type="checkbox"
                        class="check-carne"
                        data-aluno="${id}"
                        data-mes="${mes}"
                        ${
                            dados[mes]
                            ? "checked"
                            : ""
                        }>

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


// ================================
// EVENTOS DAS CHECKBOXES
// ================================

document.addEventListener("change", async (e) => {

    if (!e.target.classList.contains("check-carne"))
        return;

    const aluno = e.target.dataset.aluno;
    const mes = e.target.dataset.mes;

    const atual = pagamentos[aluno] || {};

    atual[mes] = e.target.checked;

    await set(

        ref(db, `financeiro/carnes/${aluno}`),

        atual

    );

});

// ================================
// TOTAL ARRECADADO
// ================================

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

// ================================
// PRIMEIRA EXECUÇÃO
// ================================

async function inicializarBanco() {

    let alterou = false;

    for (const aluno of alunos) {

        const id = aluno.nome
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/\s+/g, "_")
            .toLowerCase();

        if (!pagamentos[id]) {

            alterou = true;

            pagamentos[id] = {

                julho: false,
                agosto: false,
                setembro: false,
                outubro: false,
                novembro: false

            };

            await set(

                ref(db, `financeiro/carnes/${id}`),

                pagamentos[id]

            );

        }

    }

    if (alterou) {

        atualizarTotal();

    }

}

// ================================
// BOTÃO VOLTAR
// ================================

document
.getElementById("voltar-caixa")
.onclick = () => {

    window.location.href = "index.html";

};

// ================================
// INICIAR
// ================================

window.addEventListener("DOMContentLoaded", () => {

    inicializarBanco();

});