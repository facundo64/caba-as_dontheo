import React from 'react';
import { BeefIcon, TicketIcon, ChartIcon, UsersIcon, ArchivePlusIcon, ClipboardListIcon, AddressBookIcon } from '../common/Icons.jsx';

const MainMenu = ({ onMenuSelect }) => {
    const menuItems = [
        { id: 'inventory', label: 'Gestión de Productos', icon: <BeefIcon /> },
        { id: 'stockEntry', label: 'Ingreso de Inventario', icon: <ArchivePlusIcon /> },
        { id: 'stockMovements', label: 'Movimientos de Stock', icon: <ClipboardListIcon /> },
        { id: 'customers', label: 'Clientes', icon: <AddressBookIcon /> },
        { id: 'pos', label: 'Punto de Venta', icon: <TicketIcon /> },
        { id: 'reports', label: 'Reportes', icon: <ChartIcon /> },
        { id: 'users', label: 'Usuarios', icon: <UsersIcon /> },
    ];

    const MenuItem = ({ item }) => (
        <button 
            onClick={() => onMenuSelect(item.id)}
            className="bg-gray-800 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 aspect-square
                       transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-amber-500/20
                       focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-gray-900"
        >
           
            <div className="text-amber-500 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center">
                {item.icon}
            </div>
        
            <span className="text-white font-semibold text-center text-xs sm:text-sm h-10 flex items-center">
                {item.label}
            </span>
        </button>
    );

    return (
        <div className="flex flex-col items-center justify-center h-full">
            <div className="w-full max-w-6xl mx-auto p-4">
              
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
                    {menuItems.map(item => <MenuItem key={item.id} item={item} />)}
                </div>
            </div>
        </div>
    );
};

export default MainMenu;
