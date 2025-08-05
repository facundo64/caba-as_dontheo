import React, { useState, useEffect, useMemo } from 'react';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '../../services/firebase.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DollarSignIcon, AlertTriangleIcon } from '../common/Icons.jsx';

// Sub-componente para las tarjetas de métricas
const ReportCard = ({ title, value, icon, colorClass }) => (
    <div className={`bg-gray-900/50 p-6 rounded-2xl shadow-lg flex items-center gap-6 border-l-4 ${colorClass}`}>
        <div className="text-3xl">{icon}</div>
        <div>
            <p className="text-gray-400 text-sm">{title}</p>
            <p className="text-2xl font-bold text-white">{value}</p>
        </div>
    </div>
);

const InventoryReports = () => {
    const { currentUser } = useAuth();
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const appId = 'qualtech-saas-demo';

    useEffect(() => {
        if (!currentUser) {
            setLoading(false);
            return;
        }

        const inventoryCollectionPath = `artifacts/${appId}/users/${currentUser.uid}/inventory`;
        const q = query(collection(db, inventoryCollectionPath));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const inventoryData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setInventory(inventoryData);
            setLoading(false);
        }, (err) => {
            console.error("Error al obtener inventario:", err);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentUser]);

    // Procesar datos para las métricas y gráficos
    const inventoryMetrics = useMemo(() => {
        const totalValue = inventory.reduce((sum, item) => sum + (item.costPrice || 0) * (item.stock || 0), 0);
        const criticalProducts = inventory.filter(item => item.stock <= item.minStock && item.minStock > 0).length;
        
        const topStockProducts = [...inventory]
            .sort((a, b) => (b.stock || 0) - (a.stock || 0))
            .slice(0, 10); // Top 10 productos con más stock

        return {
            totalValue: totalValue.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' }),
            criticalProducts,
            topStockProducts
        };
    }, [inventory]);

    if (loading) {
        return <div className="text-center text-white">Cargando reportes de inventario...</div>;
    }

    return (
        <div className="animate-fade-in space-y-8">
            {/* Tarjetas de Métricas Clave */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ReportCard 
                    title="Valor Total del Inventario (al costo)" 
                    value={inventoryMetrics.totalValue} 
                    icon={<DollarSignIcon />} 
                    colorClass="border-green-500" 
                />
                <ReportCard 
                    title="Productos con Stock Crítico" 
                    value={inventoryMetrics.criticalProducts} 
                    icon={<AlertTriangleIcon />} 
                    colorClass="border-red-500" 
                />
            </div>

            {/* Gráfico de Productos con Mayor Stock */}
            <div className="bg-gray-900/50 p-6 rounded-2xl shadow-lg">
                <h3 className="text-xl font-bold text-white mb-4">Top 10 Productos con Mayor Stock</h3>
                 <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={inventoryMetrics.topStockProducts} layout="vertical" margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
                         <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
                         <XAxis type="number" stroke="#A0AEC0" />
                         <YAxis type="category" dataKey="name" width={150} stroke="#A0AEC0" tick={{ fontSize: 12 }} />
                         <Tooltip 
                            contentStyle={{ backgroundColor: '#2D3748', border: 'none', color: '#FFF' }} 
                            cursor={{fill: '#4A5568'}} 
                         />
                         <Legend />
                         <Bar dataKey="stock" name="Stock Actual" fill="#38B2AC" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default InventoryReports;