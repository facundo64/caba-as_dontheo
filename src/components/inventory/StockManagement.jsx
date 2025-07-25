import React, { useState, useEffect, useMemo } from 'react';
import { collection, query, onSnapshot, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../services/firebase.js';
import { useAuth } from '../../context/AuthContext.jsx';
import Modal from '../common/Modal.jsx';
import { PlusCircleIcon, EditIcon, TrashIcon, BarcodeIcon, DollarSignIcon, AlertTriangleIcon, RefreshCwIcon } from '../common/Icons.jsx';


const DashboardCard = ({ title, value, icon, colorClass }) => (
    <div className={`bg-gray-800 p-6 rounded-2xl shadow-lg flex items-center gap-6 border-l-4 ${colorClass}`}>
        <div className="text-4xl">{icon}</div>
        <div>
            <p className="text-gray-400 text-sm">{title}</p>
            <p className="text-2xl font-bold text-white">{value}</p>
        </div>
    </div>
);


const StockManagement = () => {
    const { currentUser } = useAuth();
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [activeTab, setActiveTab] = useState('summary'); 
    
    const initialFormState = { id: null, name: '', sku: '', category: '', subcategory: '', provider: '', stock: '', costPrice: '', price: '', minStock: '', maxStock: '', lot: '', expirationDate: '' };
    const [currentItem, setCurrentItem] = useState(initialFormState);
    
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

  
    const { totalValue, criticalProducts, criticalProductsList } = useMemo(() => {
        const totalValue = inventory.reduce((sum, item) => sum + (item.costPrice || 0) * (item.stock || 0), 0);
        const criticalProductsList = inventory.filter(item => item.stock <= item.minStock && item.minStock > 0);
        
        return {
            totalValue: totalValue.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' }),
            criticalProducts: criticalProductsList.length,
            criticalProductsList,
        };
    }, [inventory]);


    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCurrentItem(prev => ({ ...prev, [name]: value }));
    };

    const openModal = (mode, item = null) => {
        setError('');
        setModalMode(mode);
        setCurrentItem(item ? { ...item } : initialFormState);
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!currentItem.name || !currentItem.stock || !currentItem.price) {
            setError("Nombre, Stock y Precio de Venta son obligatorios.");
            return;
        }
        
        const dataToSave = {
            name: currentItem.name,
            sku: currentItem.sku || '',
            category: currentItem.category || '',
            subcategory: currentItem.subcategory || '',
            provider: currentItem.provider || '',
            stock: parseFloat(currentItem.stock) || 0,
            costPrice: parseFloat(currentItem.costPrice) || 0,
            price: parseFloat(currentItem.price) || 0,
            minStock: parseFloat(currentItem.minStock) || 0,
            maxStock: parseFloat(currentItem.maxStock) || 0,
            lot: currentItem.lot || '',
            expirationDate: currentItem.expirationDate || '',
            lastUpdated: new Date()
        };

        try {
            const inventoryCollectionPath = `artifacts/${appId}/users/${currentUser.uid}/inventory`;
            if (modalMode === 'add') {
                await addDoc(collection(db, inventoryCollectionPath), dataToSave);
            } else {
                const itemDocRef = doc(db, inventoryCollectionPath, currentItem.id);
                await updateDoc(itemDocRef, dataToSave);
            }
            setIsModalOpen(false);
        } catch (err) {
            console.error("Error al guardar el producto:", err);
            setError("Ocurrió un error al guardar el producto.");
        }
    };
    
    const handleDeleteItem = async (itemId) => {
        if (window.confirm("¿Estás seguro de que quieres eliminar este producto? Esta acción no se puede deshacer.")) {
            try {
                const itemDocRef = doc(db, `artifacts/${appId}/users/${currentUser.uid}/inventory`, itemId);
                await deleteDoc(itemDocRef);
            } catch (err) {
                console.error("Error al eliminar item:", err);
                alert("Ocurrió un error al eliminar el producto.");
            }
        }
    };

    const handleBarcodeScan = () => {
        const randomSku = `SKU-${Math.floor(100000 + Math.random() * 900000)}`;
        setCurrentItem(prev => ({ ...prev, sku: randomSku }));
        alert(`Código de barras simulado: ${randomSku}`);
    };
    
    const getMargin = (cost, price) => {
        if (!cost || !price || cost <= 0 || price <= 0) return 'N/A';
        const margin = ((price - cost) / price) * 100;
        return `${margin.toFixed(1)}%`;
    };

    if (loading) {
        return <div className="text-center text-white">Cargando inventario...</div>;
    }

    return (
        <div className="animate-fade-in">
            {/* --- Pestañas de Navegación --- */}
            <div className="flex border-b border-gray-700 mb-6">
                <button 
                    onClick={() => setActiveTab('summary')} 
                    className={`py-2 px-4 text-lg font-semibold transition-colors ${activeTab === 'summary' ? 'border-b-2 border-amber-500 text-amber-500' : 'text-gray-400 hover:text-white'}`}
                >
                    Resumen
                </button>
                <button 
                    onClick={() => setActiveTab('list')} 
                    className={`py-2 px-4 text-lg font-semibold transition-colors ${activeTab === 'list' ? 'border-b-2 border-amber-500 text-amber-500' : 'text-gray-400 hover:text-white'}`}
                >
                    Lista de Productos
                </button>
            </div>

            {activeTab === 'summary' && (
                <div className="space-y-8">
                    <div>
                        <h2 className="text-3xl font-bold text-white mb-6">Resumen de Inventario</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <DashboardCard title="Stock Total Valorizado" value={totalValue} icon={<DollarSignIcon />} colorClass="border-green-500" />
                            <DashboardCard title="Productos Críticos" value={criticalProducts} icon={<AlertTriangleIcon />} colorClass="border-red-500" />
                            <DashboardCard title="Rotación Promedio" value="35 Días" icon={<RefreshCwIcon />} colorClass="border-blue-500" />
                        </div>
                    </div>
                    
                    {/* --- NUEVA SECCIÓN DE ALERTAS --- */}
                    <div>
                        <h3 className="text-2xl font-bold text-white mb-4">Alertas de Stock</h3>
                        <div className="bg-gray-800 rounded-xl shadow-2xl overflow-hidden">
                            {criticalProductsList.length > 0 ? (
                                <table className="w-full text-left text-gray-300">
                                    <thead className="bg-gray-900/50">
                                        <tr>
                                            <th className="p-4 font-semibold">Producto</th>
                                            <th className="p-4 font-semibold text-center">Stock Actual</th>
                                            <th className="p-4 font-semibold text-center">Stock Mínimo</th>
                                            <th className="p-4 font-semibold text-right">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {criticalProductsList.map(item => (
                                            <tr key={item.id} className="border-b border-gray-700">
                                                <td className="p-4 font-medium text-white">{item.name}</td>
                                                <td className="p-4 font-bold text-red-500 text-center">{item.stock}</td>
                                                <td className="p-4 text-center">{item.minStock}</td>
                                                <td className="p-4 text-right">
                                                    <button onClick={() => openModal('edit', item)} className="text-blue-400 hover:text-blue-300">
                                                        <EditIcon />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <p className="p-8 text-center text-gray-400">¡Excelente! No hay productos con stock crítico.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'list' && (
                <div>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                        <h2 className="text-3xl font-bold text-white">Gestión de Productos</h2>
                        <button 
                            onClick={() => openModal('add')}
                            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-4 rounded-lg transition-transform transform hover:scale-105 shadow-lg"
                        >
                            <PlusCircleIcon />
                            Nuevo Producto
                        </button>
                    </div>
                    <div className="bg-gray-800 rounded-xl shadow-2xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-gray-300">
                                <thead className="bg-gray-900/50">
                                    <tr>
                                        <th className="p-4 font-semibold">SKU</th>
                                        <th className="p-4 font-semibold">Producto</th>
                                        <th className="p-4 font-semibold">Categoría</th>
                                        <th className="p-4 font-semibold text-right">Stock</th>
                                        <th className="p-4 font-semibold text-right">Precio ($)</th>
                                        <th className="p-4 font-semibold text-right">Margen</th>
                                        <th className="p-4 font-semibold text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {inventory.length > 0 ? inventory.map(item => (
                                        <tr key={item.id} className="border-b border-gray-700 hover:bg-gray-700/50 transition-colors">
                                            <td className="p-4 font-mono text-xs">{item.sku || '-'}</td>
                                            <td className="p-4 font-medium text-white">{item.name}</td>
                                            <td className="p-4 text-sm">{item.category || '-'}</td>
                                            <td className={`p-4 font-bold text-right ${item.stock <= item.minStock && item.minStock > 0 ? 'text-red-500' : 'text-green-400'}`}>{item.stock}</td>
                                            <td className="p-4 text-amber-400 font-semibold text-right">${item.price ? item.price.toFixed(2) : '0.00'}</td>
                                            <td className="p-4 text-right">{getMargin(item.costPrice, item.price)}</td>
                                            <td className="p-4 text-right">
                                                <div className="flex justify-end gap-4">
                                                    <button onClick={() => openModal('edit', item)} className="text-blue-400 hover:text-blue-300"><EditIcon /></button>
                                                    <button onClick={() => handleDeleteItem(item.id)} className="text-red-500 hover:text-red-400"><TrashIcon /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="7" className="text-center p-8 text-gray-400">
                                                No hay productos en el inventario. ¡Agrega el primero!
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalMode === 'add' ? 'Agregar Nuevo Producto' : 'Editar Producto'} size="lg">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && <p className="bg-red-500 text-white p-3 rounded-md mb-4">{error}</p>}
                    <div>
                        <h3 className="text-lg font-semibold text-amber-400 mb-2">Identificación</h3>
                        <div className="flex gap-2 mb-4">
                            <input type="text" name="sku" value={currentItem.sku} onChange={handleInputChange} placeholder="SKU / Código de Barras" className="w-full p-3 bg-gray-700 text-white rounded-md border border-gray-600 focus:ring-2 focus:ring-amber-500" />
                            <button type="button" onClick={handleBarcodeScan} className="p-3 bg-gray-600 hover:bg-gray-500 rounded-md" title="Escanear código de barras"><BarcodeIcon /></button>
                        </div>
                        <input type="text" name="name" value={currentItem.name} onChange={handleInputChange} placeholder="Nombre del producto *" className="w-full p-3 bg-gray-700 text-white rounded-md border border-gray-600 focus:ring-2 focus:ring-amber-500" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-amber-400 mb-2">Categorización</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input type="text" name="category" value={currentItem.category} onChange={handleInputChange} placeholder="Categoría (ej. Carne Vacuna)" className="w-full p-3 bg-gray-700 text-white rounded-md border border-gray-600 focus:ring-2 focus:ring-amber-500" />
                            <input type="text" name="subcategory" value={currentItem.subcategory} onChange={handleInputChange} placeholder="Subcategoría (ej. Cortes Premium)" className="w-full p-3 bg-gray-700 text-white rounded-md border border-gray-600 focus:ring-2 focus:ring-amber-500" />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-amber-400 mb-2">Precios y Stock</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                             <input type="number" name="stock" value={currentItem.stock} onChange={handleInputChange} placeholder="Stock Actual *" className="w-full p-3 bg-gray-700 text-white rounded-md border border-gray-600 focus:ring-2 focus:ring-amber-500" step="0.01" />
                             <input type="number" name="costPrice" value={currentItem.costPrice} onChange={handleInputChange} placeholder="Precio de Costo" className="w-full p-3 bg-gray-700 text-white rounded-md border border-gray-600 focus:ring-2 focus:ring-amber-500" step="0.01" />
                             <input type="number" name="price" value={currentItem.price} onChange={handleInputChange} placeholder="Precio de Venta *" className="w-full p-3 bg-gray-700 text-white rounded-md border border-gray-600 focus:ring-2 focus:ring-amber-500" step="0.01" />
                        </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                             <input type="number" name="minStock" value={currentItem.minStock} onChange={handleInputChange} placeholder="Stock Mínimo" className="w-full p-3 bg-gray-700 text-white rounded-md border border-gray-600 focus:ring-2 focus:ring-amber-500" />
                             <input type="number" name="maxStock" value={currentItem.maxStock} onChange={handleInputChange} placeholder="Stock Máximo" className="w-full p-3 bg-gray-700 text-white rounded-md border border-gray-600 focus:ring-2 focus:ring-amber-500" />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-amber-400 mb-2">Trazabilidad</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <input type="text" name="lot" value={currentItem.lot} onChange={handleInputChange} placeholder="Lote" className="w-full p-3 bg-gray-700 text-white rounded-md border border-gray-600 focus:ring-2 focus:ring-amber-500" />
                             <div>
                                <label className="text-sm text-gray-400">Fecha de Vencimiento</label>
                                <input type="date" name="expirationDate" value={currentItem.expirationDate} onChange={handleInputChange} className="w-full p-3 bg-gray-700 text-white rounded-md border border-gray-600 focus:ring-2 focus:ring-amber-500" />
                             </div>
                        </div>
                    </div>
                    <div className="mt-6 pt-4 border-t border-gray-700">
                        <button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-4 rounded-lg transition-all">
                            {modalMode === 'add' ? 'Guardar Producto' : 'Actualizar Producto'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default StockManagement;