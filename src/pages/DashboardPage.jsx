import React, { useState } from 'react';
import Header from '../components/dashboard/Header.jsx';
import MainMenu from '../components/dashboard/MainMenu.jsx';
import StockManagement from '../components/inventory/StockManagement.jsx';
import StockEntry from '../components/inventory/StockEntry.jsx';
import StockMovements from '../components/inventory/StockMovements.jsx'; 
import CustomerManagement from '../components/common/CustomerManagement.jsx';
import SalesPOS from '../components/sales/SalesPOS.jsx';
import Placeholder from '../components/common/Placeholder.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const DashboardPage = () => {
    const [activeView, setActiveView] = useState('menu'); 
    const { currentUser } = useAuth();
    const appId = 'qualtech-saas-demo';

    const renderContent = () => {
        if (activeView === 'menu') {
            return <MainMenu onMenuSelect={setActiveView} />;
        }

        let moduleContent;
        switch (activeView) {
            case 'inventory':
                moduleContent = <StockManagement />;
                break;
            case 'stockEntry':
                moduleContent = <StockEntry />;
                break;
            case 'stockMovements':
                moduleContent = <StockMovements />;
                break;
            case 'pos':
                moduleContent = <SalesPOS />;
                break;
            case 'customers':
                moduleContent = <CustomerManagement />;
                break; 
            case 'reports':
                moduleContent = <Placeholder title="Generación de Reportes" message="Visualiza reportes de ventas, análisis de inventario y rendimiento." />;
                break;
            case 'users':
                moduleContent = <Placeholder title="Gestión de Usuarios" message="Administra los roles y permisos de tus empleados." />;
                break;
            default:
                moduleContent = <MainMenu onMenuSelect={setActiveView} />;
                break;
        }
        
        return (
            <div className="p-4 sm:p-6 md:p-8">
                <button 
                    onClick={() => setActiveView('menu')}
                    className="text-amber-400 hover:text-amber-300 mb-6"
                >
                    &larr; Volver al Menú Principal
                </button>
                {moduleContent}
            </div>
        );
    };

    return (
        <div className="flex flex-col h-screen bg-gray-900 text-white font-sans">
            <Header />
            <main className="flex-1 overflow-y-auto">
                {renderContent()}
            </main>
        </div>
    );
};

export default DashboardPage;
