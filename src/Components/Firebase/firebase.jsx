import firebase from "firebase/app";

const config ={
    apiKey: "AIzaSyDtXOvG9tmXRYjDD7O3EYjzz2syivlbTAA",
    authDomain: "horno-firebase-react.web.app",
    databaseURL: "https://horno-panadero-default-rtdb.firebaseio.com",
    projectId: "horno-panadero",
    storageBucket: "horno-panadero.appspot.com",
    messagingSenderId: "310370306205",
    appId: "1:310370306205:web:64ff344cc779b97dffac74"
  }
firebase.initializeApp(config);

export default firebase;
