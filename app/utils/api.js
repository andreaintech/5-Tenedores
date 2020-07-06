import * as firebase from "firebase";

export function reauthenticate(password) {
    const user = firebase.auth().currentUser;
    const credentials = firebase.auth.EmailAuthProvider.credential(
        user.email,
        password
    );

    console.log(credentials);
    console.log(user.reauthenticateWithCredential(credentials));

    return user.reauthenticateWithCredential(credentials);
}