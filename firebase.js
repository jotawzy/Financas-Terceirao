import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";

import { getDatabase } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-database.js";

const firebaseConfig = {

    apiKey: "AIzaSyB61Xpg_vXrjo6IwFq51-Qieqzu7TobkxA",

    authDomain: "terceirao-financas.firebaseapp.com",

    databaseURL: "https://terceirao-financas-default-rtdb.firebaseio.com",

    projectId: "terceirao-financas",

    storageBucket: "terceirao-financas.firebasestorage.app",

    messagingSenderId: "1688796412",

    appId: "1:1688796412:web:4913200f8ec54a728e6b79"

};

const app = initializeApp(firebaseConfig);

export const db = getDatabase(app);