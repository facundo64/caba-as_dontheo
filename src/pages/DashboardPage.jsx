import React, { useState } from 'react';
import Layout from '../components/dashboard/Layout.jsx';
import StockManagement from '../components/inventory/StockManagement.jsx';
import SalesPOS from '../components/sales/SalesPOS.jsx';
import Placeholder from '../components/common/Placeholder.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const DashboardPage = () => {
    const [activeView, setActiveView] = useState('inventory');
    const { currentUser } = useAuth();
    const appId = 'qualtech-saas-demo'; // Este ID se usa para las rutas de Firestore

    
    const renderContent = () => {
        switch (activeView) {
            case 'inventory':
                return <StockManagement user={currentUser} appId={appId} />;
            case 'pos':
                return <SalesPOS user={currentUser} appId={appId} />;
            case 'salesHistory':
                return <Placeholder title="Historial de Ventas" message="Aquí podrás ver todas las transacciones realizadas." />;
            case 'reports':
                return <Placeholder title="Generación de Reportes" message="Visualiza reportes de ventas, análisis de inventario y rendimiento." />;
            case 'users':
                return <Placeholder title="Gestión de Usuarios" message="Administra los roles y permisos de tus empleados." />;
            default:
                return <StockManagement user={currentUser} appId={appId} />;
        }
    };

    return (
        // El Layout envuelve el contenido principal y le pasa el estado de la vista activa
        <Layout activeView={activeView} setActiveView={setActiveView}>
            {renderContent()}
        </Layout>
    );
};

export default DashboardPage;
