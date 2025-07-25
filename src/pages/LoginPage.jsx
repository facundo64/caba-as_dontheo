import React, { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../services/firebase';
import { QualtechLogo } from '../components/common/icons.jsx';

const LoginPage = ({ authError, setAuthError }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isRegister, setIsRegister] = useState(false);

    const handleAuthAction = async (e) => {
        e.preventDefault();
        setAuthError('');
        try {
            if (isRegister) {
                await createUserWithEmailAndPassword(auth, email, password);
            } else {
                await signInWithEmailAndPassword(auth, email, password);
            }
        } catch (err) {
            switch (err.code) {
                case 'auth/email-already-in-use':
                    setAuthError('Este email ya está registrado. Por favor, inicia sesión.');
                    break;
                case 'auth/weak-password':
                    setAuthError('La contraseña debe tener al menos 6 caracteres.');
                    break;
                case 'auth/user-not-found':
                case 'auth/wrong-password':
                case 'auth/invalid-credential':
                    setAuthError('Email o contraseña incorrectos.');
                    break;
                default:
                    setAuthError('Ocurrió un error. Inténtalo de nuevo.');
                    break;
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 flex flex-col justify-center items-center p-4 font-sans" style={{backgroundImage: `url('https://www.transparenttextures.com/patterns/dark-denim-3.png')`}}>
            <div className="w-full max-w-md">
                <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl p-8 md:p-10">
                    <div className="flex justify-center mb-6">
                        <QualtechLogo className="h-16 w-16 text-amber-500 fill-current" />
                    </div>
                    <h2 className="text-2xl font-bold text-center text-white mb-2">
                        {isRegister ? 'Crear Nueva Cuenta' : 'Acceso a la Plataforma'}
                    </h2>
                    <p className="text-center text-gray-400 mb-6">Gestiona tu negocio con Qualtech</p>
                    {authError && <p className="bg-red-500/20 border border-red-500 text-red-300 text-sm p-3 rounded-md mb-4 text-center">{authError}</p>}
                    <form onSubmit={handleAuthAction} className="space-y-5">
                        <div>
                            <label className="text-sm font-bold text-gray-300 block mb-2">Email</label>
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3 bg-gray-700 text-white rounded-md border border-gray-600 focus:ring-2 focus:ring-amber-500" placeholder="tu@email.com" required />
                        </div>
                        <div>
                            <label className="text-sm font-bold text-gray-300 block mb-2">Contraseña</label>
                            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3 bg-gray-700 text-white rounded-md border border-gray-600 focus:ring-2 focus:ring-amber-500" placeholder="••••••••" required />
                        </div>
                        <button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-4 rounded-lg transition-transform transform hover:scale-105">
                            {isRegister ? 'Registrarse' : 'Iniciar Sesión'}
                        </button>
                    </form>
                    <div className="text-center mt-6">
                        <button onClick={() => { setIsRegister(!isRegister); setAuthError(''); }} className="text-sm text-amber-400 hover:text-amber-300">
                            {isRegister ? '¿Ya tienes una cuenta? Inicia Sesión' : '¿No tienes una cuenta? Regístrate'}
                        </button>
                    </div>
                </div>
                <p className="text-center text-xs text-gray-500 mt-6">Potenciado por Qualtech © {new Date().getFullYear()}</p>
            </div>
        </div>
    );
};

export default LoginPage;
