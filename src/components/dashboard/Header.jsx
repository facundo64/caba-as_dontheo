import React from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../../services/firebase.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { QualtechLogo, LogoutIcon } from '../common/Icons.jsx';

const Header = () => {
    const { currentUser } = useAuth();

    const handleLogout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
        }
    };

    return (
        <header className="bg-gray-800 shadow-md p-4 flex justify-between items-center w-full no-print">
            <div className="flex items-center gap-3">
                <QualtechLogo className="h-8 w-8 text-amber-500 fill-current" />
                <h1 className="text-xl font-bold text-white">Qualtech</h1>
            </div>
            <div className="flex items-center gap-4">
                <span className="text-sm text-gray-300 hidden sm:block">{currentUser?.email}</span>
                <button 
                    onClick={handleLogout} 
                    className="flex items-center gap-2 text-gray-300 hover:text-red-500 transition-colors"
                    title="Cerrar Sesión"
                >
                    <LogoutIcon />
                    <span className="hidden md:inline">Cerrar Sesión</span>
                </button>
            </div>
        </header>
    );
};

export default Header;