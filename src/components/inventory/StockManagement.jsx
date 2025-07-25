import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, addDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../context/AuthContext.jsx';


const StockManagement = () => {
    const { currentUser } = useAuth();
    const [inventory, setInventory] = useState([]);
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
        }, (error) => {
            console.error("Error al obtener inventario:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentUser]);


    if (loading) {
        return <div>Cargando inventario...</div>;
    }

    return (
        <div>
            <h2 className="text-3xl font-bold text-white mb-6">Gestión de Inventario</h2>
            {/* Aquí ira la tabla y el botón para agregar productos */}
            <div className="bg-gray-800 rounded-xl p-4">
                <p>Tabla de inventario irá aquí.</p>
                <p>{inventory.length} items cargados.</p>
            </div>
        </div>
    );
};

export default StockManagement;