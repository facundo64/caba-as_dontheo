import React, { useState, useEffect, useMemo } from 'react';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '../../services/firebase.js';
import { useAuth } from '../../context/AuthContext.jsx';

const CustomerReports = () => {
    const { currentUser } = useAuth();
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const appId = 'qualtech-saas-demo';

    useEffect(() => {
        if (!currentUser) {
            setLoading(false);
            return;
        }

        const salesCollectionPath = `artifacts/${appId}/users/${currentUser.uid}/sales`;
        const qSales = query(collection(db, salesCollectionPath));

        const unsubscribe = onSnapshot(qSales, (snapshot) => {
            setSales(snapshot.docs.map(doc => doc.data()));
            setLoading(false);
        }, (err) => {
            console.error("Error al obtener ventas para reporte de clientes:", err);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentUser]);

    // Procesar datos para el ranking de clientes
    const customerRanking = useMemo(() => {
        const customerSpending = {};

        sales.forEach(sale => {
            const customerId = sale.customer?.id;
            // Solo contamos clientes registrados, no "Consumidor Final"
            if (customerId && customerId !== 'consumidor_final') {
                if (!customerSpending[customerId]) {
                    customerSpending[customerId] = {
                        name: sale.customer.name,
                        totalSpent: 0,
                        purchaseCount: 0,
                    };
                }
                customerSpending[customerId].totalSpent += sale.total;
                customerSpending[customerId].purchaseCount += 1;
            }
        });

        return Object.values(customerSpending)
            .sort((a, b) => b.totalSpent - a.totalSpent)
            .slice(0, 10); // Mostramos el Top 10

    }, [sales]);

    if (loading) {
        return <div className="text-center text-white">Cargando reportes de clientes...</div>;
    }

    return (
        <div className="animate-fade-in space-y-8">
            <div className="bg-gray-900/50 p-6 rounded-2xl shadow-lg">
                <h3 className="text-xl font-bold text-white mb-4">Ranking de Clientes por Gasto Total</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-gray-300">
                        <thead className="bg-gray-800">
                            <tr>
                                <th className="p-4 font-semibold">Cliente</th>
                                <th className="p-4 font-semibold text-right">Compras Realizadas</th>
                                <th className="p-4 font-semibold text-right">Gasto Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {customerRanking.length > 0 ? customerRanking.map((customer, index) => (
                                <tr key={index} className="border-b border-gray-700">
                                    <td className="p-4 font-medium text-white">{customer.name}</td>
                                    <td className="p-4 text-right">{customer.purchaseCount}</td>
                                    <td className="p-4 text-amber-400 font-semibold text-right">
                                        {customer.totalSpent.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="3" className="text-center p-8 text-gray-400">
                                        No hay datos de ventas asociadas a clientes para generar un ranking.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default CustomerReports;
