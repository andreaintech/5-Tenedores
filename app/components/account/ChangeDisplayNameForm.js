import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Input, Button } from "react-native-elements";
import * as firebase from "firebase";

export default function ChangeDisplayNameForm(props) {
    const { displayName, setShowModal, toastRef, setRealoadUserInfo } = props;

    const [ newDisplayName, setNewDisplayName ] = useState(null);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const onSubmit = () => {
        console.log(newDisplayName);
        setError(null);
        if(!newDisplayName) {   // Si el nombre esta vacio (null)
            setError("El nombre no puede estar vacio");
        } else if(displayName === newDisplayName) {
            setError("El nombre no puede ser igual al anterior");
        } else {
            setIsLoading(true);    // Mostrar el loading
            const update = {
                displayName: newDisplayName
            }
            firebase
                .auth()
                .currentUser.updateProfile(update)
                .then(() => {
                    setIsLoading(false);
                    setRealoadUserInfo(true);   // Actualizar la informacion con el useEffect del componente abuelo UserLogged
                    setShowModal(false);
                    console.log('OK');
                })
                .catch(() => {
                    setError("Error al actualizar el nombre");
                    setIsLoading(false);
                });
        }
    }

    return(
        <View style={styles.view}>
            <Input 
                placeholder="Nombre y apellido"
                containerStyle={styles.input}
                rightIcon={{
                    type: "material-community",
                    name: "account-circle-outline",
                    color: "#c2c2c2"
                }}
                defaultValue={displayName || ""}    // Esto quiere decir, si displayName viene con algo (distinto de null entonces lo muestra, sino muestra un string vacio (""))
                onChange={(e) => setNewDisplayName(e.nativeEvent.text)}
                errorMessage={error}    // Mostrar el mensaje de error en caso de que exista
            />
            <Button 
                title="Cambiar nombre"
                containerStyle={styles.btnContainer}
                buttonStyle={styles.btn}
                onPress={onSubmit}
                loading={isLoading}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    view: {
        alignItems: "center",
        paddingTop: 10,
        paddingBottom: 10,
    },
    input: {
        marginBottom: 10,
    },
    btnContainer: {
        marginTop: 20,
        width: "95%"
    },
    btn: {
        backgroundColor: "#00a680"
    }
});