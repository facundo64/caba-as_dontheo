import React, { useState, useEffect, useMemo } from 'react';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../../services/firebase.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { FileDownIcon } from '../common/Icons.jsx';

const AccountingReports = () => {
    const { currentUser } = useAuth();
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const appId = 'qualtech-saas-demo';
    const IVA_RATE = 0.21; // Tasa de IVA del 21%

    useEffect(() => {
        if (!currentUser) {
            setLoading(false);
            return;
        }

        const salesCollectionPath = `artifacts/${appId}/users/${currentUser.uid}/sales`;
        const q = query(collection(db, salesCollectionPath), orderBy("createdAt", "asc"));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const salesData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate() : new Date(),
            }));
            setSales(salesData);
            setLoading(false);
        }, (err) => {
            console.error("Error al obtener ventas:", err);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentUser]);

    // Procesar datos para el Libro IVA
    const ivaBookData = useMemo(() => {
        return sales.map(sale => {
            const total = sale.total || 0;
            const netAmount = total / (1 + IVA_RATE);
            const ivaAmount = total - netAmount;
            return {
                ...sale,
                netAmount,
                ivaAmount,
            };
        });
    }, [sales]);

    const handleExport = () => {
        // Lógica para exportar a CSV o PDF iría aquí
        alert("La funcionalidad para exportar se implementará en el futuro.");
    };

    if (loading) {
        return <div className="text-center text-white">Cargando reportes contables...</div>;
    }

    return (
        <div className="animate-fade-in space-y-8">
            <div className="bg-gray-900/50 p-6 rounded-2xl shadow-lg">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-white">Libro IVA Ventas</h3>
                    <button 
                        onClick={handleExport}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
                    >
                        <FileDownIcon />
                        Exportar
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-gray-300">
                        <thead className="bg-gray-800">
                            <tr>
                                <th className="p-4 font-semibold">Fecha</th>
                                <th className="p-4 font-semibold">Cliente</th>
                                <th className="p-4 font-semibold">Comprobante</th>
                                <th className="p-4 font-semibold text-right">Neto Gravado</th>
                                <th className="p-4 font-semibold text-right">IVA (21%)</th>
                                <th className="p-4 font-semibold text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ivaBookData.length > 0 ? ivaBookData.map((sale) => (
                                <tr key={sale.id} className="border-b border-gray-700">
                                    <td className="p-4 text-sm">{sale.createdAt.toLocaleDateString('es-AR')}</td>
                                    <td className="p-4 font-medium text-white">{sale.customer?.name || 'Consumidor Final'}</td>
                                    <td className="p-4 font-mono text-xs">FAC-{sale.id.substring(0, 8).toUpperCase()}</td>
                                    <td className="p-4 text-right">
                                        {sale.netAmount.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}
                                    </td>
                                    <td className="p-4 text-right">
                                        {sale.ivaAmount.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}
                                    </td>
                                    <td className="p-4 text-amber-400 font-semibold text-right">
                                        {sale.total.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="6" className="text-center p-8 text-gray-400">
                                        No hay ventas registradas para generar el reporte.
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

export default AccountingReports;
