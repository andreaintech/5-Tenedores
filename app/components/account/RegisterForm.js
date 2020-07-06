import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Input, Icon, Button } from "react-native-elements";
import Loading from "../Loading";
import { validateEmail } from "../../utils/validations"
import { size, isEmpty } from "lodash";
import * as firebase from "firebase";
import { useNavigation } from "@react-navigation/native";

export default function RegisterForm(props) {
    const { toastRef } = props;
    const [showPassword, setShowPassword ]              = useState(false);
    const [showRepeatPassword, setShowRepeatPassword]   = useState(false);
    const [formData, setFormData]                       = useState(defaultFormValue());
    const [loading, setLoading]                         = useState(false);  // Hook de estado para el Loading
    const navigation                                    = useNavigation();

    const onSubmit = () => {
        if(isEmpty(formData.email) || isEmpty(formData.password) || isEmpty(formData.repeatPassword)) {
            toastRef.current.show("Todos los campos son obligatorios");
        } else if(!validateEmail(formData.email)) {
            toastRef.current.show("El email no es correcto");
        } else if(formData.password !== formData.repeatPassword) {
            toastRef.current.show("Las contraseñas deben coincidir");
        } else if(size(formData.password) < 6) {
            toastRef.current.show("La contraseña tiene que tener al menos 6 caracteres");
        } else {
            setLoading(true); // Loading para notificar que estamos creando la cuenta
            // Crear la cuenta en firebase
            firebase.auth().createUserWithEmailAndPassword(formData.email, formData.password)
            .then(() => {
                setLoading(false);  // Ocultar loading
                navigation.navigate("account");
            })
            .catch(() => {
                setLoading(false); // Ocultar loading
                toastRef.current.show("El email ya esta en uso. Pruebe con otro email");
            });
        } 
        
        // console.log(validateEmail(formData.email));
        // console.log(validatePassword(formData.password));
        // console.log(validaterepeatPassword(formData.repeatPassword));
    }

    const onChange = (e, type) => {
        setFormData({ ...formData, [type]: e.nativeEvent.text})
    }

    return (
        <View style={styles.formContainer}>
            <Input
                placeholder="Correo electronico"
                containerStyle={styles.inputForm}
                style={styles.logo}
                onChange={e => onChange(e, "email")}
                rightIcon={
                    <Icon
                        type="material-community"
                        name="at"
                        iconStyle={styles.iconRight}
                    />
                }
            />
            <Input
                placeholder="Contraseñaa"
                containerStyle={styles.inputForm}
                password={true}
                secureTextEntry={showPassword ? false : true}
                style={styles.logo}
                onChange={e => onChange(e, "password")}
                rightIcon={
                    <Icon
                        type="material-community"
                        name={showPassword ? "eye-off-outline" : "eye-outline"}
                        iconStyle={styles.iconRight}
                        onPress={() => setShowPassword(!showPassword)}
                    />
                }
            />
            <Input
                placeholder="Repetir contraseña"
                containerStyle={styles.inputForm}
                password={true}
                secureTextEntry={showRepeatPassword ? false : true}
                style={styles.logo}
                onChange={e => onChange(e, "repeatPassword")}
                rightIcon={
                    <Icon
                        type="material-community"
                        name={showRepeatPassword ? "eye-off-outline" : "eye-outline"}
                        iconStyle={styles.iconRight}
                        onPress={() => setShowRepeatPassword(!showRepeatPassword)}
                    />
                }
            />
            <Button
                title="Registrarse"
                containerStyle={styles.btnContainerRegister}
                buttonStyle={styles.btnRegister}
                onPress={onSubmit}
            />
            <Loading isVisible={loading} text="Creando cuenta" />
        </View>
    );
}

function defaultFormValue() {
    return {
        email: "",
        password: "",
        repeatPassword: "",
    };
}

const styles = StyleSheet.create({
    formContainer: {
        flex:           1,
        alignItems:     "center",
        justifyContent: "center",
        marginTop:      30,
    },
    inputForm: {
      width:        "100%",
      marginTop:    20,  
    },
    btnContainerRegister: {
        marginTop:  20,
        width:      "95%"
    },
    btnRegister: {
       backgroundColor: "#00a680" 
    },
    iconRight: {
        color: "#c1c1c1"
    }
});