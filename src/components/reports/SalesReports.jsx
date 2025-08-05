import React, { useState, useEffect, useMemo } from 'react';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../../services/firebase.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

const SalesReports = () => {
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
        const q = query(collection(db, salesCollectionPath), orderBy("createdAt", "desc"));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const salesData = snapshot.docs.map(doc => ({
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

    // Procesar datos para el gráfico de ventas diarias
    const dailySalesData = useMemo(() => {
        const salesByDay = {};
        sales.forEach(sale => {
            const date = sale.createdAt.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' });
            if (!salesByDay[date]) {
                salesByDay[date] = 0;
            }
            salesByDay[date] += sale.total;
        });

        return Object.keys(salesByDay).map(date => ({
            name: date,
            Ingresos: salesByDay[date],
        })).reverse(); // Para mostrar en orden cronológico
    }, [sales]);

    // Procesar datos para el ranking de productos
    const topProductsData = useMemo(() => {
        const productSales = {};
        sales.forEach(sale => {
            (sale.cart || []).forEach(item => {
                if (!productSales[item.name]) {
                    productSales[item.name] = 0;
                }
                productSales[item.name] += item.quantity;
            });
        });

        return Object.keys(productSales)
            .map(name => ({ name, Cantidad: productSales[name] }))
            .sort((a, b) => b.Cantidad - a.Cantidad)
            .slice(0, 5); // Mostrar solo el Top 5
    }, [sales]);

    if (loading) {
        return <div className="text-center text-white">Cargando reportes...</div>;
    }

    return (
        <div className="animate-fade-in space-y-8">
            {/* Gráfico de Ingresos por Día */}
            <div className="bg-gray-900/50 p-6 rounded-2xl shadow-lg">
                <h3 className="text-xl font-bold text-white mb-4">Ingresos por Día</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={dailySalesData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
                        <XAxis dataKey="name" stroke="#A0AEC0" />
                        <YAxis stroke="#A0AEC0" />
                        <Tooltip contentStyle={{ backgroundColor: '#2D3748', border: 'none' }} />
                        <Legend />
                        <Line type="monotone" dataKey="Ingresos" stroke="#FBBF24" strokeWidth={2} activeDot={{ r: 8 }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Gráfico de Productos más vendidos */}
            <div className="bg-gray-900/50 p-6 rounded-2xl shadow-lg">
                <h3 className="text-xl font-bold text-white mb-4">Productos Más Vendidos (Top 5 por Cantidad)</h3>
                 <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={topProductsData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                         <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
                         <XAxis type="number" stroke="#A0AEC0" />
                         <YAxis type="category" dataKey="name" width={150} stroke="#A0AEC0" tick={{ fontSize: 12 }} />
                         <Tooltip contentStyle={{ backgroundColor: '#2D3748', border: 'none' }} cursor={{fill: '#4A5568'}} />
                         <Legend />
                         <Bar dataKey="Cantidad" fill="#FBBF24" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default SalesReports;