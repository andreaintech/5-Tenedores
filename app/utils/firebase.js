import firebase from "firebase/app";

const firebaseConfig = {
    apiKey: "AIzaSyCE4D9TMzNTCPImYWATZM9HwN8Ff4HE5ig",
    authDomain: "tenedores-andrea.firebaseapp.com",
    databaseURL: "https://tenedores-andrea.firebaseio.com",
    projectId: "tenedores-andrea",
    storageBucket: "tenedores-andrea.appspot.com",
    messagingSenderId: "338261680804",
    appId: "1:338261680804:web:0b18a8e5fae24e254a7c31"

}

// Initialize Firebase
export const firebaseApp = firebase.initializeApp(firebaseConfig);
