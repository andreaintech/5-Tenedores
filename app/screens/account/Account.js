import React, { useState, useEffect } from "react";
import * as firebase from "firebase";
import Loading from "../../components/Loading"

import UserGuest from "./UserGuest.js";
import UserLogged from "./UserLogged.js";

export default function Account () {
    
    const [login, setLogin] = useState(null);

    useEffect(() => {
        // Verificar si el usuario esta logueado o no.
        firebase.auth().onAuthStateChanged((user) => {
            !user ? setLogin(false) : setLogin(true);
        });
    }, []);

    if (login === null) 
        return <Loading isVisible={true} text="Cargando..." />;

    return login ? <UserLogged /> : <UserGuest />;
}