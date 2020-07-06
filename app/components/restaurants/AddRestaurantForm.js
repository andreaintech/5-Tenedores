import React, { useState, useEffect } from "react";
import { StyleSheet, View, ScrollView, Alert, Dimensions } from "react-native";
import { Icon, Avatar, Image, Input, Button } from "react-native-elements";
import { map, size, filter } from "lodash";
import * as Permissions from "expo-permissions";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import MapView from "react-native-maps";
import uuid from "random-uuid-v4";
import Modal from "../Modal";

// Firebase
import { firebaseApp } from "../../utils/firebase";
import firebase from "firebase/app";
import "firebase/storage";
import "firebase/firestore";
const db = firebase.firestore(firebaseApp);

const widthScreen = Dimensions.get("window").width; // Dimension del ancho de la pantalla

export default function AddRestaurantForm(props) {
    const { toastRef, setIsLoading, navigation } = props;

    const [restaurantName, setRestaurantName] = useState("");
    const [restaurantAddress, setRestaurantAddress] = useState("");
    const [restaurantDescription, setRestaurantDescription] = useState("");
    const [imagesSelected, setImagesSelected] = useState([]);
    const [isVisibleMap, setIsVisibleMap] = useState(false);
    const [locationRestaurant, setLocationRestaurant] = useState(null);

    const addRestaurant = () => {
        if(!restaurantName || !restaurantAddress || !restaurantDescription) {
            toastRef.current.show('Todos los campos son obligatorios');
        } else if(size(imagesSelected) === 0){
            toastRef.current.show("El restaurante debe tener al menos una foto");
        } else if(!locationRestaurant) {
            toastRef.current.show("Tiene que localizar el restaurante en el mapa");
        } else {
            setIsLoading(true); // Activar spinner
            
            // Guardar Restaurant
            uploadImageStorage()    // Agregar las imagenes del restaurant
            .then((response) => {
                // Guardar en la BD
                db.collection("restaurants")
                    .add({
                        name: restaurantName,
                        address: restaurantAddress,
                        description: restaurantDescription,
                        location: locationRestaurant,
                        images: response,
                        rating: 0,
                        ratingTotal: 0,
                        quantityVoting: 0,
                        createAt: new Date(),
                        createBy: firebase.auth().currentUser.uid,
                    })
                    .then(() => {
                        setIsLoading(false);
                        console.log('OK');
                        // toastRef.current.show("Se ha creado el restaurante correctamente");
                        navigation.navigate("restaurants");
                    })
                    .catch(() => {
                        setIsLoading(false);
                        toastRef.current.show("Error al subir el restaurante, intentelo mas tarde");
                    })
            });
        }
    }

    // Tiene que ser una funcion asincrona porque antes de guardar los datos del formulario se deben guardar las imagenes del restaurant
    const uploadImageStorage = async () => {
        const imageBlob = [];   

        await Promise.all(
            map(imagesSelected, async (image) => {
                const response = await fetch(image);
                const blob = await response.blob();
                const name = uuid();
                // const ref = firebase.storage().ref("restaurants").child(uuid());
                const ref = firebase.storage().ref("restaurants").child(name);
    
                await ref.put(blob).then(async (result) => {
                    await firebase
                        .storage()
                        // .ref(`restaurants/${result.medata.name}`)
                        .ref(`restaurants/${name}`)
                        .getDownloadURL()
                        .then(photoUrl => {
                            imageBlob.push(photoUrl);
                        });
                });
            })
        );
       
        return imageBlob;
    }

    return (
        <ScrollView style={styles.scrollView}>
            <ImageRestaurant
                imageRestaurant={imagesSelected[0]}
            />
            <FormAdd
                setRestaurantName={setRestaurantName}
                setRestaurantAddress={setRestaurantAddress}
                setRestaurantDescription={setRestaurantDescription}
                setIsVisibleMap={setIsVisibleMap}
                locationRestaurant={locationRestaurant}
            />
            <UploadImage 
                toastRef={toastRef}
                imagesSelected={imagesSelected}
                setImagesSelected={setImagesSelected}
            />
            <Button 
                title="Crear Restaurante"
                onPress={addRestaurant}
                buttonStyle={styles.btnAdd}
            />
            <Map
                isVisibleMap={isVisibleMap}
                setIsVisibleMap={setIsVisibleMap}
                setLocationRestaurant={setLocationRestaurant}
                toastRef={toastRef}
            />
        </ScrollView>
    );
}

function ImageRestaurant(props) {
    const { imageRestaurant} = props;
    return (
        <View style={styles.viewPhoto}>
            <Image
                source={
                    imageRestaurant ? { uri: imageRestaurant} : require("../../../assets/img/no-image.png")
                }
                style={{width: widthScreen, height: 200}}
            />
        </View>
    );
}

// Formulario para agregar un restaurante
function FormAdd(props) {
    const { 
        setRestaurantName, 
        setRestaurantAddress, 
        setRestaurantDescription, 
        setIsVisibleMap, 
        locationRestaurant 
    } = props;

    return(
        <View style={styles.viewForm}>
            <Input
                placeholder="Nombre del Restaurante"
                containerStyle={styles.input}
                onChange={(e) => setRestaurantName(e.nativeEvent.text)}
            />
            <Input
                placeholder="Direccion"
                containerStyle={styles.input}
                onChange={(e) => setRestaurantAddress(e.nativeEvent.text)}
                rightIcon={{
                    type: "material-community",
                    name: "google-maps",
                    color: locationRestaurant ? "#00a680" : "#c2c2c2",
                    onPress: () => setIsVisibleMap(true)
                }}
            />
            <Input
                placeholder="Descripcion del Restaurante"
                multiline={true}
                inputContainerStyle={styles.textArea}
                containerStyle={styles.input}
                onChange={(e) => setRestaurantDescription(e.nativeEvent.text)}
            />
        </View>
    )
}

// Componente que se encarga de gestionar el mapa del restaurante
function Map(props) {
    const { isVisibleMap, setIsVisibleMap, setLocationRestaurant, toastRef } = props;
    const [location, setLocation] = useState(null);

    useEffect(() => {
        // Funcion anonima autoejecutable
        (async () => {
            const resultPermissions = await Permissions.askAsync(
                Permissions.LOCATION
            );

            const statusPermissions = resultPermissions.permissions.location.status;

            if(statusPermissions !== "granted") {   // Permisos denegados
                toastRef.current.show("Tienes que aceptar los permisos de localizacion para crear un restaurante", 3000);
            } else { // Permisos aceptados
                const userLocation = await Location.getCurrentPositionAsync({});
                // console.log("Localizacion actual");
                // console.log(userLocation);
                setLocation({
                    latitude: userLocation.coords.latitude,
                    longitude: userLocation.coords.longitude,
                    latitudeDelta: 0.001,
                    longitudeDelta: 0.001
                });
            }

        })() 
    }, []);

    const confirmLocation = () => {
        setLocationRestaurant(location);
        toastRef.current.show('Localizacion guardada correctamente');setIsVisibleMap(false);
    }

    return (
        <Modal 
            isVisible={isVisibleMap} 
            setIsVisible={setIsVisibleMap}
        >
            <View>
                {location && 
                <MapView
                    style={styles.mapStyle}
                    initialRegion={location}
                    showsUserLocation={true}
                    onRegionChange={(region) => 
                        setLocation(region)
                    }
                >
                    <MapView.Marker
                        coordinate={{
                            latitude: location.latitude,
                            longitude: location.longitude
                        }}
                        draggable
                    />
                </MapView>    
                }
                <View style={styles.viewMapBtn}>
                <Button
                    title="Guardar Ubicacion"
                    containerStyle={styles.viewMapBtnContainerSave}
                    buttonStyle={styles.viewMapBtnSave}
                    onPress={confirmLocation}
                />
                <Button
                    title="Cancelar Ubicacion"
                    containerStyle={styles.viewMapBtnContainerCancel}
                    buttonStyle={styles.viewMapBtnCancel}
                    onPress={() => setIsVisibleMap(false)}
                />
                </View>
            </View>
        </Modal>
    );
}

// Subir imagen a firebase
function UploadImage(props) {
    const { toastRef, imagesSelected, setImagesSelected} = props;

    const imageSelect = async () => {
        const resultPermissions = await Permissions.askAsync(Permissions.CAMERA_ROLL);

        if(resultPermissions === "denied") {
            toastRef.current.show("Es necesario aceptar permisos de galeria. Si los has rechazado debes ir a ajustes y activarlos manualmente", 3000);
        } else {
            const result = await ImagePicker.launchImageLibraryAsync({
                allowsEditing: true,
                aspect: [4, 3]
            });

            if(result.cancelled) {
                toastRef.current.show("Has cerrado la galeria sin seleccionar una imagen", 2000);
            } else {
                // console.log(result.uri);
                setImagesSelected([...imagesSelected, result.uri]); // Obtenemos el valor actual (imagen anterior) y con result.uri obtenemos la nueva imagen a guardar
            }
        }
    };

    // Eliminar imagen de la lista de imagenes a subir (maximo 4 por restaurante)
    const removeImage = (image) => {
        // Nota. Recordar que imagesSelected es el conjunto de imagenes seleccionadas (subidas)
        Alert.alert(
            "Eliminar Imagen",
            "Estas seguro de que quieres eliminar esta imagen?",
            [
                {
                    text: "Cancelar",
                    style: "Cancel"
                },
                {
                    text: "Eliminar",
                    onPress: () => {
                        // const test = filter(imagesSelected, (imageUrl) => imageUrl !== image); // Aplica un filtro para obtener todas aquellas imagenes que no son la que acabo de seleccionar para eliminar
                        setImagesSelected(filter(imagesSelected, (imageUrl) => imageUrl !== image));
                    }
                }
            ],
            { cancelable: false }
        )
    };

    return (
        <View style={styles.viewImages}>
            {size(imagesSelected) < 4 && ( 
            <Icon
                type="material-community"
                name="camera"
                color="#7a7a7a"
                containerStyle={styles.containerIcon}
                onPress={imageSelect}
            />)}
           
            {map(imagesSelected, (imageRestaurant, index) => (
                <Avatar
                    key={index}
                    style={styles.miniatureStyle}
                    source={{uri: imageRestaurant}}
                    onPress={() => removeImage(imageRestaurant)}
                />
            ))}
        </View>
    )
}

const styles = StyleSheet.create({
    scrollView: {
        height: "100%"
    },
    viewForm: {
        marginLeft: 10,
        marginRight: 10,
    },
    input: {
        marginBottom: 10,
    },
    textArea: {
        height: 100,
        width: "100%",
        padding: 0,
        margin: 0
    },
    btnAdd: {
        backgroundColor: "#00a680",
        margin: 20
    },
    viewImages: {
        flexDirection: "row",
        marginLeft: 20,
        marginRight: 20,
        marginTop: 30
    },
    containerIcon: {
        alignItems: "center",
        justifyContent: "center",
        marginRight: 10,
        height: 70,
        width: 70,
        backgroundColor: "#e3e3e3"
    },
    miniatureStyle: {
        width: 70,
        height: 70,
        marginRight: 10
    },
    viewPhoto: {
        alignItems: "center",
        height: 200,
        marginBottom: 20
    },
    mapStyle: {
        width: "100%",
        height: 550,
    },
    viewMapBtn: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 10
    },
    viewMapBtnContainerCancel: {
        paddingLeft: 5
    },
    viewMapBtnCancel: {
        backgroundColor: "#a60d0d"
    },
    viewMapBtnContainerSave: {
        paddingRight: 5
    },
    viewMapBtnSave: {
        backgroundColor: "#00a680"
    }
});