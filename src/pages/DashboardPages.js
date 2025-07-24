import React, { useState } from 'react';
import Layout from '../components/dashboard/Layout';
import StockManagement from '../components/inventory/StockManagement';
import SalesPOS from '../components/sales/SalesPOS';
import Placeholder from '../components/common/Placeholder';

const DashboardPage = () => {
    const [activeView, setActiveView] = useState('inventory'); // Vista inicial

    const renderContent = () => {
        switch (activeView) {
            case 'inventory':
                return <StockManagement />;
            case 'pos':
                return <SalesPOS />;
            case 'salesHistory':
                return <Placeholder title="Historial de Ventas" message="Aquí podrás ver todas las transacciones realizadas." />;
            case 'reports':
                return <Placeholder title="Generación de Reportes" message="Visualiza reportes de ventas, análisis de inventario y rendimiento." />;
            case 'users':
                return <Placeholder title="Gestión de Usuarios" message="Administra los roles y permisos de tus empleados." />;
            default:
                return <StockManagement />;
        }
    };

    return (
        <Layout activeView={activeView} setActiveView={setActiveView}>
            {renderContent()}
        </Layout>
    );
};

export default DashboardPage;