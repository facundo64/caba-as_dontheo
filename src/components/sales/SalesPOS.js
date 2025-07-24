import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../context/AuthContext';

const SalesPOS = () => {
    const { currentUser } = useAuth();
    const [inventory, setInventory] = useState([]);
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!currentUser) return;

        const inventoryCollectionPath = `inventory/${currentUser.uid}/items`;
        const q = query(collection(db, inventoryCollectionPath));

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const items = [];
            querySnapshot.forEach((doc) => {
                items.push({ id: doc.id, ...doc.data() });
            });
            setInventory(items);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentUser]);
    
    // Lógica para añadir al carrito, finalizar venta, etc.

    if (loading) {
        return <div>Cargando productos...</div>;
    }

    return (
        <div className="animate-fade-in flex flex-col lg:flex-row gap-8 h-full">
            {/* Catálogo de Productos */}
            <div className="lg:w-2/3">
                <h2 className="text-3xl font-bold text-white mb-4">Punto de Venta</h2>
                <p>Catálogo de productos irá aquí.</p>
            </div>

            {/* Carrito de Compras */}
            <div className="lg:w-1/3 bg-gray-800 rounded-xl shadow-2xl flex flex-col p-6">
                <h3 className="text-2xl font-bold text-white border-b border-gray-700 pb-4 mb-4">Carrito</h3>
                <div className="flex-grow">
                    <p className="text-gray-400 text-center mt-10">El carrito está vacío.</p>
                </div>
                <div className="border-t border-gray-700 pt-4 mt-4">
                    <div className="flex justify-between items-center text-2xl font-bold text-white mb-4">
                        <span>Total:</span>
                        <span>$0.00</span>
                    </div>
                    <button className="w-full bg-amber-500 text-white font-bold py-3 rounded-lg">
                        Finalizar Venta
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SalesPOS;