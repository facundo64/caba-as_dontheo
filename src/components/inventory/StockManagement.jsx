import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, addDoc } from 'firebase/firestore';
import { db } from '../../services/firebase.js';
import { useAuth } from '../../context/AuthContext.jsx';
import Modal from '../common/Modal.jsx';
import { PlusCircleIcon } from '../common/Icons.jsx';

const StockManagement = () => {
    const { currentUser } = useAuth();
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newItem, setNewItem] = useState({ name: '', stock: '', price: '' });
    const [error, setError] = useState('');
    const appId = 'qualtech-saas-demo';

    useEffect(() => {
        if (!currentUser) {
            setLoading(false);
            return;
        };

        const inventoryCollectionPath = `artifacts/${appId}/users/${currentUser.uid}/inventory`;
        const q = query(collection(db, inventoryCollectionPath));

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const items = [];
            querySnapshot.forEach((doc) => {
                items.push({ id: doc.id, ...doc.data() });
            });
            setInventory(items);
            setLoading(false);
        }, (err) => {
            console.error("Error al obtener inventario:", err);
            setError("No se pudo cargar el inventario. Revisa tus reglas de seguridad en Firestore.");
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentUser]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewItem(prev => ({ ...prev, [name]: value }));
    };

    const handleAddItem = async (e) => {
        e.preventDefault();
        if (!newItem.name || !newItem.stock || !newItem.price) {
            setError("Todos los campos son obligatorios.");
            return;
        }
        if (parseFloat(newItem.stock) < 0 || parseFloat(newItem.price) < 0) {
            setError("El stock y el precio no pueden ser negativos.");
            return;
        }

        try {
            const inventoryCollectionPath = `artifacts/${appId}/users/${currentUser.uid}/inventory`;
            await addDoc(collection(db, inventoryCollectionPath), {
                name: newItem.name,
                stock: parseFloat(newItem.stock),
                price: parseFloat(newItem.price),
                lastUpdated: new Date()
            });
            setNewItem({ name: '', stock: '', price: '' });
            setError('');
            setIsModalOpen(false);
        } catch (err) {
            console.error("Error al agregar item:", err);
            setError("Ocurrió un error al agregar el producto.");
        }
    };

    if (loading) {
        return <div className="text-center text-white">Cargando inventario...</div>;
    }

    return (
        <div className="animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h2 className="text-3xl font-bold text-white">Gestión de Inventario</h2>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-4 rounded-lg transition-transform transform hover:scale-105 shadow-lg"
                >
                    <PlusCircleIcon />
                    Agregar Producto
                </button>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Agregar Nuevo Producto">
                <form onSubmit={handleAddItem}>
                    {error && <p className="bg-red-500 text-white p-3 rounded-md mb-4">{error}</p>}
                    <div className="space-y-4">
                        <input type="text" name="name" value={newItem.name} onChange={handleInputChange} placeholder="Nombre del producto (ej. Lomo)" className="w-full p-3 bg-gray-700 text-white rounded-md border border-gray-600 focus:ring-2 focus:ring-amber-500" />
                        <input type="number" name="stock" value={newItem.stock} onChange={handleInputChange} placeholder="Stock inicial (ej. 25.5)" className="w-full p-3 bg-gray-700 text-white rounded-md border border-gray-600 focus:ring-2 focus:ring-amber-500" step="0.1" />
                        <input type="number" name="price" value={newItem.price} onChange={handleInputChange} placeholder="Precio por unidad/kg (ej. 15000)" className="w-full p-3 bg-gray-700 text-white rounded-md border border-gray-600 focus:ring-2 focus:ring-amber-500" step="0.01" />
                    </div>
                    <div className="mt-6">
                        <button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-4 rounded-lg transition-all">
                            Guardar Producto
                        </button>
                    </div>
                </form>
            </Modal>
            
            <div className="bg-gray-800 rounded-xl shadow-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-gray-300">
                        <thead className="bg-gray-900/50">
                            <tr>
                                <th className="p-4 font-semibold">Producto</th>
                                <th className="p-4 font-semibold">Stock (kg/unidad)</th>
                                <th className="p-4 font-semibold">Precio ($)</th>
                                <th className="p-4 font-semibold">Última Actualización</th>
                            </tr>
                        </thead>
                        <tbody>
                            {inventory.length > 0 ? inventory.map(item => (
                                <tr key={item.id} className="border-b border-gray-700 hover:bg-gray-700/50 transition-colors">
                                    <td className="p-4 font-medium text-white">{item.name}</td>
                                    <td className="p-4">{item.stock}</td>
                                    <td className="p-4 text-amber-400 font-semibold">${item.price ? item.price.toFixed(2) : '0.00'}</td>
                                    <td className="p-4 text-sm">{item.lastUpdated ? new Date(item.lastUpdated.seconds * 1000).toLocaleString() : 'N/A'}</td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="4" className="text-center p-8 text-gray-400">
                                        No hay productos en el inventario. ¡Agrega el primero!
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

export default StockManagement;
