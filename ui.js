// ================================
// ui.js
// Parte 1/3
// ================================
import {

    criarPorquinho,
    salvarPorquinho,
    excluirPorquinho

} from "./database.js";

let porquinhos = {};
let pendencias = {};

let porquinhoAtual = null;

// ================================
// ELEMENTOS
// ================================

const paginas = document.querySelectorAll(".page");

const botoesMenu = document.querySelectorAll(".nav-btn");

const listaPorquinhos =
document.getElementById("lista-porquinhos");

const listaPendencias =
document.getElementById("lista-pendencias");

const totalPix =
document.getElementById("total-pix");

const totalFisico =
document.getElementById("total-fisico");

const totalGeral =
document.getElementById("total-geral");

const titulo =
document.getElementById("titulo-detalhes");

const campoNome =
document.getElementById("nome");

const campoDescricao =
document.getElementById("descricao");

const campoPix =
document.getElementById("pix");

const campoFisico =
document.getElementById("fisico");

const campoObservacoes =
document.getElementById("observacoes");

const statusSalvar =
document.getElementById("status");

// ================================
// NAVEGAÇÃO
// ================================

export function abrirPagina(id){

    paginas.forEach(p=>{

        p.classList.remove("active");

    });

    document
    .getElementById(id)
    .classList
    .add("active");

}

botoesMenu.forEach(botao=>{

    botao.onclick=()=>{

        botoesMenu.forEach(b=>{

            b.classList.remove("active");

        });

        botao.classList.add("active");

        abrirPagina(
            botao.dataset.page
        );

    };

});

// ================================
// FORMATAR DINHEIRO

export function dinheiro(valor){

    return Number(valor || 0)
    .toLocaleString("pt-BR",{

        style:"currency",

        currency:"BRL"

    });

}

// ================================
// ATUALIZA TOTAIS
// ================================

export function atualizarCaixa(){

    let pix=0;

    let fisico=0;

    Object.values(porquinhos).forEach(p=>{

        pix+=Number(p.pix||0);

        fisico+=Number(p.fisico||0);

    });

    totalPix.textContent=
    dinheiro(pix);

    totalFisico.textContent=
    dinheiro(fisico);

    totalGeral.textContent=
    dinheiro(pix+fisico);

}

// ================================
// RENDERIZA PORQUINHOS
// ================================

export function mostrarPorquinhos(dados){

    porquinhos=dados;

    listaPorquinhos.innerHTML="";

    Object.entries(dados).forEach(([id,p])=>{

        const total=
        Number(p.pix||0)+
        Number(p.fisico||0);

        const card=
        document.createElement("div");

        card.className="porquinho";

        card.innerHTML=`

            <h3>${p.nome}</h3>

            <div class="valor">

                ${dinheiro(total)}

            </div>

            <div class="descricao">

                ${p.descricao || ""}

            </div>

            <button
            class="detalhes">

                Detalhes

            </button>

        `;

        card
        .querySelector(".detalhes")
        .onclick=()=>{

            abrirDetalhes(id);

        };

        listaPorquinhos
        .appendChild(card);

    });

    atualizarCaixa();

}

// ================================
// ui.js
// Parte 2/3
// ================================

// ================================
// ABRIR DETALHES
// ================================

export function abrirDetalhes(id){

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

// ================================
// LIMPAR FORMULÁRIO
// ================================

export function limparFormulario(){

    porquinhoAtual = null;

    titulo.textContent = "Novo Porquinho";

    campoNome.value = "";

    campoDescricao.value = "";

    campoPix.value = 0;

    campoFisico.value = 0;

    campoObservacoes.value = "";

    statusSalvar.textContent = "";

}

// ================================
// ALTERAÇÕES NÃO SALVAS
// ================================

function marcarAlterado(){

    statusSalvar.textContent = "Alterações não salvas";

}

[
    campoNome,
    campoDescricao,
    campoPix,
    campoFisico,
    campoObservacoes

].forEach(campo=>{

    campo.addEventListener("input",marcarAlterado);

});

// ================================
// BOTÃO VOLTAR
// ================================

document
.getElementById("voltar")
.onclick=()=>{

    abrirPagina("porquinhos");

};

// ================================
// NOVO PORQUINHO
// ================================

document
.getElementById("novo-porquinho")
.onclick=()=>{

    limparFormulario();

    abrirPagina("detalhes");

};

// ================================
// PENDÊNCIAS
// ================================

export function mostrarPendencias(dados){

    pendencias = dados;

    listaPendencias.innerHTML = "";

    Object.entries(dados).forEach(([id,p])=>{

        const item =
        document.createElement("div");

        item.className = "pendencia";

        item.innerHTML = `

            <strong>

                ${p.titulo}

            </strong>

            <p>

                ${p.descricao || ""}

            </p>

        `;

        listaPendencias.appendChild(item);

    });

}
// ================================
// SALVAR
// ================================

document
.getElementById("salvar")
.onclick = async ()=>{

    const dados={

        nome:campoNome.value.trim(),

        descricao:campoDescricao.value.trim(),

        pix:Number(campoPix.value)||0,

        fisico:Number(campoFisico.value)||0,

        observacoes:campoObservacoes.value.trim()

    };

    if(!dados.nome){

        alert("Informe um nome.");

        return;

    }

    if(porquinhoAtual){

        await salvarPorquinho(
            porquinhoAtual,
            dados
        );

    }else{

        await criarPorquinho(
            dados
        );

    }

    statusSalvar.textContent="Salvo!";

    abrirPagina("porquinhos");

};

// ================================
// EXCLUIR
// ================================

document
.getElementById("excluir")
.onclick = async ()=>{

    if(!porquinhoAtual)
        return;

    if(!confirm("Excluir este porquinho?"))
        return;
        
    console.log(porquinhoAtual);;
    await excluirPorquinho(
        porquinhoAtual
    );

    abrirPagina("porquinhos");

};

// ================================
// EXPORTS
// ================================

export{

    porquinhos,

    pendencias,

    porquinhoAtual

};