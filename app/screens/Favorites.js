import React, { useState, useRef, useCallback } from "react";
import { StyleSheet, View, Text, FlatList, ActivityIndicator, TouchableOpacity, Alert } from "react-native";
import { Image, Icon, Button } from "react-native-elements";
import { useFocusEffect } from "@react-navigation/native";
import Toast from "react-native-easy-toast";
import Loading from "../components/Loading";

import { firebaseApp } from "../utils/firebase";
import firebase from "firebase";
import "firebase/firestore";

const db = firebase.firestore(firebaseApp);

export default function Favorites (props) {
    const { navigation } = props;
    const [restaurants, setRestaurants] = useState([]);
    const [userLogged, setUserLogged] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [reloadData, setReloadData] = useState(false);
    const toastRef = useRef();

    firebase.auth().onAuthStateChanged((user) => {
        user ? setUserLogged(true) : setUserLogged(false);
    });

    useFocusEffect(
        useCallback(() => {
           if(userLogged) {
               const idUser = firebase.auth().currentUser.uid;

               db.collection("favorites")
               .where("idUser", "==", idUser)
               .get()
               .then((response) => {
                   const idRestaurantsArray = [];

                   response.forEach((doc) => {
                    idRestaurantsArray.push(doc.data().idRestaurant);
                   });

                   getDataRestaurant(idRestaurantsArray)
                   .then((response) => {
                        const restaurantsList = [];

                        response.forEach(doc => {
                            const restaurant = doc.data();
                            restaurant.id = doc.id;
                            restaurantsList.push(restaurant);
                        });

                        setRestaurants(restaurantsList);
                   })
               });
           }
           setReloadData(false);
        }, [userLogged, reloadData])
    );

    const getDataRestaurant = (idRestaurantArray) => {
        const arrayRestaurants = [];
        idRestaurantArray.forEach(idRestaurant => {
            const result = db.collection("restaurants").doc(idRestaurant).get();

            arrayRestaurants.push(result);
        });
        return Promise.all(arrayRestaurants);
    }

    if(!userLogged) {
        return <UserNotLogged navigation={navigation}/>;
    }
    
    if(restaurants?.length === 0) {
        return <NotFoundRestaurants/>;
    } else {
        return (
            <View style={styles.viewBody}>
                {restaurants ? (    // Cargaron los restaurantes favoritos
                    <FlatList
                        data={restaurants}
                        renderItem={(restaurant) => <Restaurant restaurant={restaurant} setIsLoading={setIsLoading} toastRef={toastRef} setReloadData={setReloadData}
                        navigation={navigation}/>}
                        keyExtractor={(item, index) => index.toString()}
                    />
                ) : (
                    <View style={styles.loaderRestaurants}>
                        <ActivityIndicator size="large"/>
                        <Text style={{ textAlign: "center"}}>Cargando restaurantes</Text>
                    </View>
                )}
                <Toast 
                    ref={toastRef}
                    position="center"
                    opacity={0.9}
                />
                <Loading 
                    text="Eliminando" 
                    isVisible={isLoading}
                />
            </View>
        );
    }
}

// Componente para cuando no hay favoritos agregados a la cuenta
function NotFoundRestaurants() {
    return(
        <View style={{flex: 1, alignItems: "center", justifyContent: "center"}}>
            <Icon
                type="material-community"
                name="alert-outline"
                size={50}
            />
            <Text style={{fontSize: 20}}>No tiene restaurantes en su lista</Text>
        </View>
    )
}

function UserNotLogged(props) {
    const { navigation } = props;

    return(
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center"}}>
            <Icon 
                type="material-community"
                name="login"
                size={50}
            />
            <Text style={{fontSize: 18, textAlign: "center"}}>Inicia sesión para ver esta sección</Text>
            <Button
                title="Iniciar Sesión"
                containerStyle={{ marginTop: 20, width: "80%"}}
                buttonStyle={{ backgroundColor: "#00a680"}}
                onPress={() => navigation.navigate("account", { screen: "login" })}
            />
        </View>
    )
}

function Restaurant (props) {
    const { restaurant, setIsLoading, toastRef, setReloadData, navigation } = props;
    const { name, images, id } = restaurant.item;

    const confirmRemoveFavorite = () => {
        Alert.alert(
            "Eliminar restaurante de Favortios",
            "Estas seguro de que quieres eliminar el restaurante de la lista de favoritos?",
            [
                {
                    text: "Cancelar",
                    style: "cancel"
                },
                {
                    text: "Eliminar",
                    onPress: removeFavorite
                }
            ],
            { cancelable: false }
        )
    }

    const removeFavorite = () => {
        setIsLoading(true);

        db.collection("favorites")
        .where("idRestaurant", "==", id)
        .where("idUser", "==", firebase.auth().currentUser.uid)
        .get()
        .then((response) => {
            response.forEach((doc) => {
                const idFavorite = doc.id;
                db.collection("favorites")
                .doc(idFavorite)
                .delete()
                .then(() => {
                    setIsLoading(false);
                    setReloadData(true);           
                    toastRef.current.show("Restaurante eliminado correctamente de favoritos");     
                })
                .catch(() => {
                    setIsLoading(false);
                    toastRef.current.show("Error al eliminar el restaurante de favoritos");   
                })
            });
        })
    }

    return (
        <View style={styles.restaurant}>
            <TouchableOpacity
                onPress={() => navigation.navigate("restaurants", {screen: "restaurant", params: {id: id}})}
            >
                <Image
                    resizeMode="cover"
                    style={styles.image}
                    PlaceholderContent={<ActivityIndicator color ="#fff" />}
                    source={images[0] ? { uri: images[0]} : require("../../assets/img/no-image.png")}
                />
                <View style={styles.info}>
                    <Text style={styles.name}>{name}</Text>
                    <Icon
                        type="material-community"
                        name="heart"
                        color="#00a680"
                        containerStyle={styles.favorite}
                        onPress={confirmRemoveFavorite}
                        underlayColor="transparent"
                    />
                </View>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    viewBody: {
        flex: 1,
        backgroundColor: "#f2f2f2",
    },
    loaderRestaurants: {
        marginTop: 10,
        marginBottom: 20
    },
    restaurant: {
        margin: 10
    },
    image: {
        width: "100%",
        height: 180
    },
    info: {
        flex: 1,
        alignItems: "center",
        justifyContent: "space-between",
        flexDirection: "row",
        paddingLeft: 20,
        paddingRight: 20,
        paddingTop: 10,
        paddingBottom: 10,
        marginTop: -30,
        backgroundColor: "#fff"
    }, 
    name: {
        fontWeight: "bold",
        fontSize: 20
    },
    favorite: {
        marginTop: -35,
        backgroundColor: "#fff",
        padding: 15,
        borderRadius: 100
    }
})