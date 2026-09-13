import { db } from "./firebase.js";
import { ref, push, set, remove, onValue } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

let pendencias = {};
let pendenciaAtual = null;

const lista = document.getElementById("lista-pendencias");
const botaoNova = document.getElementById("nova-pendencia");
const formulario = document.getElementById("form-pendencia");

if (formulario) formulario.classList.add("escondido");

const tituloForm = document.getElementById("titulo-form-pendencia");
const campoTitulo = document.getElementById("pendencia-titulo");
const campoDescricao = document.getElementById("pendencia-descricao");
const campoValor = document.getElementById("pendencia-valor");
const botaoSalvar = document.getElementById("salvar-pendencia");
const botaoExcluir = document.getElementById("excluir-pendencia");
const referencia = ref(db, "financeiro/pendencias");

onValue(referencia, (snapshot) => {
    pendencias = snapshot.val() || {};
    mostrarPendencias();
});

function mostrarPendencias() {
    if (!lista) return;
    lista.innerHTML = "";
    if (Object.keys(pendencias).length === 0) {
        lista.innerHTML = `<p class="vazio">Nenhuma Anotação cadastrada.</p>`;
        return;
    }

    Object.entries(pendencias).forEach(([id, p]) => {
        const card = document.createElement("div");
        card.className = "pendencia";
        card.innerHTML = `<h3>${p.titulo}</h3><p>${p.descricao || ""}</p>${Number(p.valor) > 0 ? `<strong>${formatarValor(p.valor)}</strong>` : ""}`;
        card.onclick = () => abrirEdicao(id);
        lista.appendChild(card);
    });
}

if (botaoNova) {
    botaoNova.onclick = () => {
        if (formulario.classList.contains("escondido")) {
            pendenciaAtual = null;
            limparFormulario();
            formulario.classList.remove("escondido");
        } else {
            fecharFormulario();
        }
        if (formulario) formulario.scrollIntoView({ behavior: "smooth", block: "center" });
    };
}

function abrirEdicao(id) {
    const p = pendencias[id];
    if (!p) return;
    pendenciaAtual = id;
    if (tituloForm) tituloForm.textContent = "Editar Anotação";
    if (campoTitulo) campoTitulo.value = p.titulo || "";
    if (campoDescricao) campoDescricao.value = p.descricao || "";
    if (campoValor) campoValor.value = p.valor || 0;
    if (formulario) formulario.classList.remove("escondido");
}

if (botaoSalvar) {
    botaoSalvar.onclick = async () => {
        const dados = {
            titulo: campoTitulo?.value?.trim() || "",
            descricao: campoDescricao?.value?.trim() || "",
            valor: Number(campoValor?.value) || 0
        };
        if (!dados.titulo) {
            alert("Digite um título.");
            return;
        }
        if (pendenciaAtual) {
            await set(ref(db, `financeiro/pendencias/${pendenciaAtual}`), dados);
        } else {
            const nova = push(referencia);
            await set(nova, dados);
        }
        fecharFormulario();
    };
}

if (botaoExcluir) {
    botaoExcluir.onclick = async () => {
        if (!pendenciaAtual) {
            fecharFormulario();
            return;
        }
        await remove(ref(db, `financeiro/pendencias/${pendenciaAtual}`));
        fecharFormulario();
    };
}

function limparFormulario() {
    if (tituloForm) tituloForm.textContent = "Nova Anotação";
    if (campoTitulo) campoTitulo.value = "";
    if (campoDescricao) campoDescricao.value = "";
    if (campoValor) campoValor.value = 0;
}

function fecharFormulario() {
    if (formulario) formulario.classList.add("escondido");
    pendenciaAtual = null;
    limparFormulario();
}

function formatarValor(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}