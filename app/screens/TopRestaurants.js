import React, { useState, useRef, useEffect } from "react";
import { View, Text } from "react-native";
import Toast from "react-native-easy-toast";
import ListTopRestaurants from '../components/ranking/ListTopRestaurants';

import { firebaseApp } from "../utils/firebase";
import firebase from "firebase/app";
import "firebase/firestore";

const db = firebase.firestore(firebaseApp);

export default function TopRestaurants (props) {
    const { navigation } = props;
    const [restaurants, setRestaurants] = useState([]);
    const toastRef = useRef();

    useEffect(() => {
        db.collection("restaurants")
        .orderBy("rating", "desc")
        .limit(5)   // Obtener los 5 mas puntuados
        .get()
        .then((response) => {
            const restaurantsArray = [];
            response.forEach(doc => {   // Aqui ya tenemos todos los restaurantes
                const data = doc.data();
                data.id = doc.id;
                restaurantsArray.push(data);
            });

            setRestaurants(restaurantsArray);
        })
    }, [])

    return (
        <View>
            <ListTopRestaurants 
                restaurants={restaurants}
                navigation={navigation}
            />
            <Toast 
                ref={toastRef}
                position="center"
                opacity={0.9}
            />
        </View>
    );
}