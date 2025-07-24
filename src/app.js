import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './services/firebase';

import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';

function App() {
    const [user, setUser] = useState(undefined);
    const [loading, setLoading] = useState(true);
    const [authError, setAuthError] = useState('');
    
    // Este ID es para las rutas de Firestore, puedes cambiarlo si quieres
    const appId = 'qualtech-saas-demo';

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            try {
                if (currentUser) {
                    // Verificar si el perfil del usuario existe
                    const profileDocRef = doc(db, `artifacts/${appId}/users/${currentUser.uid}/profile`, 'data');
                    const docSnap = await getDoc(profileDocRef);

                    if (!docSnap.exists()) {
                        // Si no existe, es un nuevo registro, lo creamos con rol de admin
                        await setDoc(profileDocRef, {
                            email: currentUser.email,
                            role: 'admin',
                            createdAt: new Date(),
                        });
                    }
                    setUser(currentUser);
                } else {
                    setUser(null);
                }
            } catch (error) {
                console.error("Error al verificar/crear perfil:", error);
                setAuthError("Error al configurar el perfil. Revisa los permisos de Firestore.");
                await signOut(auth); // Desloguear si hay error para evitar inconsistencias
            } finally {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, [appId]);

    if (loading) {
        return (
            <div className="bg-gray-900 h-screen flex justify-center items-center text-white">
                Cargando plataforma...
            </div>
        );
    }

    return user ? <DashboardPage user={user} appId={appId} /> : <LoginPage authError={authError} setAuthError={setAuthError} />;
}

export default App;