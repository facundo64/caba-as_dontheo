import React, { useState } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../../services/firebase';
import { useAuth } from '../../context/AuthContext.jsx';
import { BeefIcon, ChartIcon, UsersIcon, TicketIcon, LogoutIcon, ChevronDownIcon, ShoppingCartIcon, HistoryIcon, QualtechLogo } from '../common/icons';

const Sidebar = ({ activeView, setActiveView }) => {
    const [isSalesMenuOpen, setIsSalesMenuOpen] = useState(false);
    const { currentUser } = useAuth();

    const handleLogout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
        }
    };

    const NavItem = ({ viewName, icon, children, isSubItem = false }) => (
        <button onClick={() => setActiveView(viewName)} className={`flex items-center w-full text-left gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isSubItem ? 'pl-12' : ''} ${activeView === viewName ? 'bg-amber-500 text-white shadow-md' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}>
            {icon}
            <span className="font-medium">{children}</span>
        </button>
    );

    const salesTabs = ['pos', 'salesHistory'];

    return (
        <aside className="w-64 bg-gray-800 p-6 flex-col justify-between shadow-2xl hidden md:flex no-print">
            <div>
                <div className="flex items-center gap-3 mb-10">
                    <QualtechLogo className="h-10 w-10 text-amber-500 fill-current" />
                    <h1 className="text-2xl font-bold text-white">Qualtech</h1>
                </div>
                <nav className="space-y-2">
                    <NavItem viewName="inventory" icon={<BeefIcon />}>Inventario</NavItem>
                    <div>
                        <button onClick={() => setIsSalesMenuOpen(!isSalesMenuOpen)} className={`flex items-center justify-between w-full text-left gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${salesTabs.includes(activeView) ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}>
                            <div className="flex items-center gap-3"><TicketIcon /><span className="font-medium">Ventas</span></div>
                            <ChevronDownIcon className={`transition-transform duration-300 ${isSalesMenuOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {isSalesMenuOpen && (
                            <div className="mt-2 space-y-2 animate-fade-in-down">
                                <NavItem viewName="pos" icon={<ShoppingCartIcon />} isSubItem>Punto de Venta</NavItem>
                                <NavItem viewName="salesHistory" icon={<HistoryIcon />} isSubItem>Historial</NavItem>
                            </div>
                        )}
                    </div>
                    <NavItem viewName="reports" icon={<ChartIcon />}>Reportes</NavItem>
                    <NavItem viewName="users" icon={<UsersIcon />}>Usuarios</NavItem>
                </nav>
            </div>
            <div>
                <div className="border-t border-gray-700 pt-4 mb-4">
                    <p className="text-xs text-gray-400">Usuario:</p>
                    <p className="text-sm font-medium truncate">{currentUser?.email}</p>
                </div>
                <button onClick={handleLogout} className="flex items-center w-full text-left gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-red-600 hover:text-white">
                    <LogoutIcon />
                    <span className="font-medium">Cerrar Sesión</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;