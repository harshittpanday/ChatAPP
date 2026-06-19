const firebaseConfig = {
  apiKey: "AIzaSyANV0zyDZI6vvMnD97hBU_13JSQ58CDZgA",
  authDomain: "cha1app.firebaseapp.com",
  databaseURL: "https://cha1app-default-rtdb.firebaseio.com",
  projectId: "cha1app",
  storageBucket: "cha1app.appspot.com",
  messagingSenderId: "505319315336",
  appId: "1:505319315336:web:39578b123426805653cc3d"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.database();
const storage = firebase.storage();

console.log("Firebase Ready");