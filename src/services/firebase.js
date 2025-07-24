//configuracion de firebase

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';


const firebaseConfig = {
  apiKey: "AIzaSyAWNo-2QvdDmU_RoU_WIMnPVLu3goG5uo8",
  authDomain: "dontheo.firebaseapp.com",
  projectId: "dontheo",
  storageBucket: "dontheo.appspot.com",
  messagingSenderId: "83699827050",
  appId: "1:83699827050:web:977ed848a2cb379b69a513",
  measurementId: "G-J0BTDRRGSF"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
