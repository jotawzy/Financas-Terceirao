// =========================
// database.js
// =========================

import { db } from "./firebase.js";

import {

    ref,
    push,
    set,
    remove,
    onValue

} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-database.js";

// =========================
// REFERÊNCIAS
// =========================

const PORQUINHOS = ref(db, "financeiro/porquinhos");

// =========================
// PORQUINHOS
// =========================

export function escutarPorquinhos(callback){

    onValue(PORQUINHOS,(snapshot)=>{

        callback(snapshot.val() || {});

    });

}

export function criarPorquinho(dados){

    const novo = push(PORQUINHOS);

    return set(novo,dados);

}

export function salvarPorquinho(id,dados){

    return set(

        ref(db,`financeiro/porquinhos/${id}`),

        dados

    );

}

export function excluirPorquinho(id){

    return remove(

        ref(db,`financeiro/porquinhos/${id}`)

    );

}