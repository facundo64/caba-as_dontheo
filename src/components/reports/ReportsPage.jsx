import React, { useState } from 'react';
import SalesReports from './SalesReports.jsx';
import InventoryReports from './InventoryReports.jsx';
import CustomerReports from './CustomerReports.jsx';
import AccountingReports from './AccountingReports.jsx';
import { ChevronLeftIcon, ChevronRightIcon } from '../common/Icons.jsx';

const ReportsPage = () => {
    const [activeTab, setActiveTab] = useState('sales');
    const [isNavOpen, setIsNavOpen] = useState(true); // Estado para controlar la barra lateral

    const renderContent = () => {
        switch (activeTab) {
            case 'sales':
                return <SalesReports />;
            case 'inventory':
                return <InventoryReports />;
            case 'customers':
                return <CustomerReports />;
            case 'accounting':
                return <AccountingReports />;
            default:
                return <SalesReports />;
        }
    };

    const NavButton = ({ tabId, children }) => (
        <button 
            onClick={() => setActiveTab(tabId)} 
            className={`w-full text-left p-3 rounded-lg transition-colors text-white font-semibold ${activeTab === tabId ? 'bg-amber-500' : 'hover:bg-gray-700'}`}
        >
            {children}
        </button>
    );

    return (
        <div className="animate-fade-in flex h-full relative">
            {/* Botón para Ocultar/Mostrar Barra Lateral */}
            <button 
                onClick={() => setIsNavOpen(!isNavOpen)}
                className="absolute top-1/2 -translate-y-1/2 left-0 bg-gray-700 hover:bg-gray-600 text-white rounded-full p-1 z-20 transition-transform duration-300"
                style={{ transform: isNavOpen ? `translateX(16rem) translateY(-50%)` : `translateX(20px) translateY(-50%)`}}
            >
                {isNavOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
            </button>

            {/* Barra Lateral Izquierda */}
            <aside className={`bg-gray-800 rounded-2xl transition-all duration-300 ease-in-out flex-shrink-0 ${isNavOpen ? 'w-64 p-4 mr-4' : 'w-0'}`}>
                {isNavOpen && (
                    <div className="space-y-2">
                        <h3 className="text-lg font-bold text-white mb-4">Categorías</h3>
                        <NavButton tabId="sales">Ventas</NavButton>
                        <NavButton tabId="inventory">Inventario</NavButton>
                        <NavButton tabId="customers">Clientes</NavButton>
                        <NavButton tabId="accounting">Contable y Fiscal</NavButton>
                    </div>
                )}
            </aside>
            
            {/* Contenido Principal del Reporte con margen condicional */}
            <div className={`flex-grow transition-all duration-300 ${!isNavOpen ? 'ml-12' : ''}`}>
                <h2 className="text-3xl font-bold text-white mb-6">Módulo de Reportes</h2>
                <div className="bg-gray-800 p-6 rounded-2xl shadow-lg h-[calc(100%-4.5rem)]"> {/* Altura ajustada para el título */}
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default ReportsPage;
