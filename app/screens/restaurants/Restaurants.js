import React, { useState, useEffect, useCallback } from "react";
import { StyleSheet, View, Text } from "react-native";
import { Icon } from "react-native-elements";
import  { useFocusEffect } from "@react-navigation/native";
import { firebaseApp } from "../../utils/firebase"
import firebase from "firebase/app";
import "firebase/firestore";
import ListRestaurants from "../../components/restaurants/ListRestaurants";

const db = firebase.firestore(firebaseApp);

export default function Restaurants(props) {
    const { navigation } = props;
    const [user, setUser] = useState(false);
    const [restaurants, setRestaurants] = useState([]);
    const [totalRestaurants, setTotalRestaurants] = useState(0);
    const [startRestaurants, setStartRestaurants] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const limitRestaurants = 8;

    // Verifica si estamos logueados
    useEffect(() => {
        firebase.auth().onAuthStateChanged((userInfo) => {
            // console.log(userInfo);
            setUser(userInfo);
        })
    }, []);

    useFocusEffect(
        // Obtiene los primeros n restaurantes
        useCallback(() => {
            db.collection("restaurants").get()
        .then((snap) => {
            setTotalRestaurants(snap.size);
        });

        const resultRestaurants = [];
        db.collection("restaurants")
        .orderBy("createAt", "desc")
        .limit(limitRestaurants).get()
        .then((response) => {
            // console.log(response);
            setStartRestaurants(response.docs[response.docs.length -1]);

            response.forEach((doc) => {
                const restaurant = doc.data();
                restaurant.id = doc.id;

                resultRestaurants.push(restaurant); // Agregar cada uno de los restaurantes con su id
            });
            setRestaurants(resultRestaurants);
        })
        .catch((error) => {
            console.log("Error al obtener los restaurantes de la BD");
        });
        }, [])
    );

    // Obtiene los primeros n restaurantes
    // useEffect(() => {
        
    // }, []);

    const handleLoadMore = () => {
        const resultRestaurants = [];
        restaurants.length < totalRestaurants && setIsLoading(true);
    
        db.collection("restaurants")
            .orderBy("createAt", "desc")
            .startAfter(startRestaurants.data().createAt)
            .limit(limitRestaurants)
            .get()
            .then((response) => {
                if(response.docs.length > 0) { // Significa que ha pedido nuevos restaurantes
                    setStartRestaurants(response.docs[response.docs.length -1]);   // Guardamos el ultimo restaurante
                } else {
                    setIsLoading(false);
                }
    
                response.forEach((doc) => {
                    const restaurant = doc.data();
                    restaurant.id = doc.id;
                    resultRestaurants.push(restaurant);
                });
    
                setRestaurants([...restaurants, ...resultRestaurants]);   // Spread operator
            });
    }

    return (
        <View styles={styles.viewBody}>
            <ListRestaurants 
                restaurants={restaurants} 
                handleLoadMore={handleLoadMore}
                isLoading={isLoading}
            />
            
            {/* Si el usuario existe, entonces renderizalo */}
            {user && (
                <Icon
                    reverse
                    type="material-community"
                    name="plus"
                    color="#00a680"
                    containerStyle={styles.btnContainer}      
                    onPress={() => navigation.navigate("add-restaurant")}              
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    viewBody: {
        flex: 1,
        backgroundColor: "#fff"
    },
    btnContainer: {
        position: "absolute",
        marginTop: 650,
        right: 10,
        shadowColor: "black",
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.5,
      },
    //   btnContainer: {
    //     position: "absolute",
    //     bottom: 10,
    //     // top: 10,
    //     right: 10,
    //     shadowColor: "black",
    //     shadowOffset: { width: 2, height: 2 },
    //     shadowOpacity: 0.5,
    //   },
});