// ================================
// pendencias.js
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
// VARIÁVEIS
// ================================

let pendencias = {};

let pendenciaAtual = null;


// ================================
// ELEMENTOS
// ================================

const lista = document.getElementById("lista-pendencias");

const botaoNova = document.getElementById("nova-pendencia");

const formulario = document.getElementById("form-pendencia");

formulario.classList.add("escondido");

const tituloForm = document.getElementById("titulo-form-pendencia");

const campoTitulo = document.getElementById("pendencia-titulo");

const campoDescricao = document.getElementById("pendencia-descricao");

const campoValor = document.getElementById("pendencia-valor");

const botaoSalvar = document.getElementById("salvar-pendencia");

const botaoExcluir = document.getElementById("excluir-pendencia");


// ================================
// FIREBASE
// ================================

const referencia =
ref(db,"financeiro/pendencias");


// ================================
// CARREGAR PENDÊNCIAS
// ================================

onValue(referencia,(snapshot)=>{

    pendencias = snapshot.val() || {};

    mostrarPendencias();

});


// ================================
// MOSTRAR PENDÊNCIAS
// ================================

function mostrarPendencias(){

    lista.innerHTML="";


    if(Object.keys(pendencias).length === 0){

        lista.innerHTML=`

            <p class="vazio">

                Nenhuma pendência cadastrada.

            </p>

        `;

        return;

    }


    Object.entries(pendencias)
    .forEach(([id,p])=>{


        const card =
        document.createElement("div");


        card.className="pendencia";


        card.innerHTML=`

            <h3>

                ${p.titulo}

            </h3>


            <p>

                ${p.descricao || ""}

            </p>


            <strong>

                ${formatarValor(p.valor)}

            </strong>


        `;


        card.onclick=()=>{

            abrirEdicao(id);

        };


        lista.appendChild(card);


    });

}


// ================================
// NOVA PENDÊNCIA
// ================================

botaoNova.onclick=()=>{

    if(formulario.classList.contains("escondido")){

        pendenciaAtual=null;

        limparFormulario();

        formulario.classList.remove("escondido");

    }else{

        fecharFormulario();

    }

};


// ================================
// ABRIR EDIÇÃO
// ================================

function abrirEdicao(id){

    const p = pendencias[id];

    pendenciaAtual=id;


    tituloForm.textContent=
    "Editar Pendência";


    campoTitulo.value=
    p.titulo || "";


    campoDescricao.value=
    p.descricao || "";


    campoValor.value=
    p.valor || 0;


    formulario.classList.remove("escondido");

}


// ================================
// SALVAR
// ================================

botaoSalvar.onclick=async()=>{


    const dados={

        titulo:
        campoTitulo.value.trim(),


        descricao:
        campoDescricao.value.trim(),


        valor:
        Number(campoValor.value) || 0


    };


    if(!dados.titulo){

        alert("Digite um título.");

        return;

    }


    if(pendenciaAtual){


        await set(

            ref(
            db,
            `financeiro/pendencias/${pendenciaAtual}`
            ),

            dados

        );


    }else{


        const nova =
        push(referencia);


        await set(
            nova,
            dados
        );


    }


    fecharFormulario();


};


// ================================
// EXCLUIR
// ================================

botaoExcluir.onclick=async()=>{


    if(!pendenciaAtual){

        fecharFormulario();

        return;

    }


    await remove(

        ref(
        db,
        `financeiro/pendencias/${pendenciaAtual}`
        )

    );


    fecharFormulario();


};


// ================================
// LIMPAR
// ================================

function limparFormulario(){

    tituloForm.textContent=
    "Nova Pendência";


    campoTitulo.value="";

    campoDescricao.value="";

    campoValor.value=0;

}


// ================================
// FECHAR
// ================================

function fecharFormulario(){

    formulario.classList.add("escondido");

    pendenciaAtual=null;

    limparFormulario();

}


// ================================
// FORMATAÇÃO
// ================================

function formatarValor(valor){

    return Number(valor || 0)
    .toLocaleString("pt-BR",{

        style:"currency",

        currency:"BRL"

    });

}