import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../services/firebase.js';
import { useAuth } from '../../context/AuthContext.jsx';
import Modal from '../common/Modal.jsx';
import { PlusCircleIcon, EditIcon, TrashIcon } from '../common/Icons.jsx';

const StockManagement = () => {
    const { currentUser } = useAuth();
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState({ name: '', stock: '', price: '', id: null });
    const [error, setError] = useState('');
    const appId = 'qualtech-saas-demo';

    useEffect(() => {
        if (!currentUser) {
            setLoading(false);
            return;
        }

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
            setError("No se pudo cargar el inventario.");
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentUser]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCurrentItem(prev => ({ ...prev, [name]: value }));
    };

    const handleAddItem = async (e) => {
        e.preventDefault();
        if (!currentItem.name || !currentItem.stock || !currentItem.price) {
            setError("Todos los campos son obligatorios.");
            return;
        }
        try {
            const inventoryCollectionPath = `artifacts/${appId}/users/${currentUser.uid}/inventory`;
            await addDoc(collection(db, inventoryCollectionPath), {
                name: currentItem.name,
                stock: parseFloat(currentItem.stock),
                price: parseFloat(currentItem.price),
                lastUpdated: new Date()
            });
            setCurrentItem({ name: '', stock: '', price: '', id: null });
            setError('');
            setIsAddModalOpen(false);
        } catch (err) {
            console.error("Error al agregar item:", err);
            setError("Ocurrió un error al agregar el producto.");
        }
    };

    const openEditModal = (item) => {
        setCurrentItem(item);
        setIsEditModalOpen(true);
    };

    const handleUpdateItem = async (e) => {
        e.preventDefault();
        if (!currentItem.name || !currentItem.stock || !currentItem.price) {
            setError("Todos los campos son obligatorios.");
            return;
        }
        try {
            const itemDocRef = doc(db, `artifacts/${appId}/users/${currentUser.uid}/inventory`, currentItem.id);
            await updateDoc(itemDocRef, {
                name: currentItem.name,
                stock: parseFloat(currentItem.stock),
                price: parseFloat(currentItem.price),
                lastUpdated: new Date()
            });
            setCurrentItem({ name: '', stock: '', price: '', id: null });
            setError('');
            setIsEditModalOpen(false);
        } catch (err) {
            console.error("Error al actualizar item:", err);
            setError("Ocurrió un error al actualizar el producto.");
        }
    };
    
    const handleDeleteItem = async (itemId) => {

            try {
                const itemDocRef = doc(db, `artifacts/${appId}/users/${currentUser.uid}/inventory`, itemId);
                await deleteDoc(itemDocRef);
            } catch (err) {
                console.error("Error al eliminar item:", err);
                alert("Ocurrió un error al eliminar el producto.");
            }
        // }
    };

    if (loading) {
        return <div className="text-center text-white">Cargando inventario...</div>;
    }

    return (
        <div className="animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h2 className="text-3xl font-bold text-white">Gestión de Inventario</h2>
                <button 
                    onClick={() => { setCurrentItem({ name: '', stock: '', price: '', id: null }); setIsAddModalOpen(true); }}
                    className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-4 rounded-lg transition-transform transform hover:scale-105 shadow-lg"
                >
                    <PlusCircleIcon />
                    Agregar Producto
                </button>
            </div>

            {/* Modal para Agregar Producto */}
            <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Agregar Nuevo Producto">
                <form onSubmit={handleAddItem}>
                    {error && <p className="bg-red-500 text-white p-3 rounded-md mb-4">{error}</p>}
                    <div className="space-y-4">
                        <input type="text" name="name" value={currentItem.name} onChange={handleInputChange} placeholder="Nombre del producto" className="w-full p-3 bg-gray-700 text-white rounded-md border border-gray-600 focus:ring-2 focus:ring-amber-500" />
                        <input type="number" name="stock" value={currentItem.stock} onChange={handleInputChange} placeholder="Stock inicial" className="w-full p-3 bg-gray-700 text-white rounded-md border border-gray-600 focus:ring-2 focus:ring-amber-500" step="0.1" />
                        <input type="number" name="price" value={currentItem.price} onChange={handleInputChange} placeholder="Precio" className="w-full p-3 bg-gray-700 text-white rounded-md border border-gray-600 focus:ring-2 focus:ring-amber-500" step="0.01" />
                    </div>
                    <div className="mt-6">
                        <button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-4 rounded-lg transition-all">Guardar Producto</button>
                    </div>
                </form>
            </Modal>

            {/* Modal para Editar Producto */}
            <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Editar Producto">
                <form onSubmit={handleUpdateItem}>
                    {error && <p className="bg-red-500 text-white p-3 rounded-md mb-4">{error}</p>}
                    <div className="space-y-4">
                        <input type="text" name="name" value={currentItem.name} onChange={handleInputChange} placeholder="Nombre del producto" className="w-full p-3 bg-gray-700 text-white rounded-md border border-gray-600 focus:ring-2 focus:ring-amber-500" />
                        <input type="number" name="stock" value={currentItem.stock} onChange={handleInputChange} placeholder="Stock" className="w-full p-3 bg-gray-700 text-white rounded-md border border-gray-600 focus:ring-2 focus:ring-amber-500" step="0.1" />
                        <input type="number" name="price" value={currentItem.price} onChange={handleInputChange} placeholder="Precio" className="w-full p-3 bg-gray-700 text-white rounded-md border border-gray-600 focus:ring-2 focus:ring-amber-500" step="0.01" />
                    </div>
                    <div className="mt-6">
                        <button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-4 rounded-lg transition-all">Actualizar Producto</button>
                    </div>
                </form>
            </Modal>
            
            <div className="bg-gray-800 rounded-xl shadow-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-gray-300">
                        <thead className="bg-gray-900/50">
                            <tr>
                                <th className="p-4 font-semibold">Producto</th>
                                <th className="p-4 font-semibold">Stock</th>
                                <th className="p-4 font-semibold">Precio ($)</th>
                                <th className="p-4 font-semibold">Última Actualización</th>
                                <th className="p-4 font-semibold text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {inventory.length > 0 ? inventory.map(item => (
                                <tr key={item.id} className="border-b border-gray-700 hover:bg-gray-700/50 transition-colors">
                                    <td className="p-4 font-medium text-white">{item.name}</td>
                                    <td className="p-4">{item.stock}</td>
                                    <td className="p-4 text-amber-400 font-semibold">${item.price ? item.price.toFixed(2) : '0.00'}</td>
                                    <td className="p-4 text-sm">{item.lastUpdated ? new Date(item.lastUpdated.seconds * 1000).toLocaleString() : 'N/A'}</td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end gap-4">
                                            <button onClick={() => openEditModal(item)} className="text-blue-400 hover:text-blue-300"><EditIcon /></button>
                                            <button onClick={() => handleDeleteItem(item.id)} className="text-red-500 hover:text-red-400"><TrashIcon /></button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="text-center p-8 text-gray-400">
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
