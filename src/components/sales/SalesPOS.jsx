
import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, writeBatch, doc } from 'firebase/firestore';
import { db } from '../../services/firebase.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { TrashIcon } from '../common/Icons.jsx';
import TicketModal from './TicketModal.jsx'; 

const SalesPOS = () => {
    const { currentUser } = useAuth();
    const [inventory, setInventory] = useState([]);
    const [cart, setCart] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const appId = 'qualtech-saas-demo';


    const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
    const [completedSaleData, setCompletedSaleData] = useState(null);

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
            console.error("Error al obtener inventario para TPV:", err);
            setError("No se pudo cargar el inventario.");
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentUser, appId]);

    const addToCart = (product) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(item => item.id === product.id);
            if (existingItem) {
                return prevCart.map(item => 
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [...prevCart, { ...product, quantity: 1 }];
        });
    };

    const updateCartQuantity = (productId, quantity) => {
        const numQuantity = parseFloat(quantity);
        setCart(prevCart => 
            prevCart.map(item => 
                item.id === productId ? { ...item, quantity: isNaN(numQuantity) || numQuantity < 0 ? 0 : numQuantity } : item
            ).filter(item => item.quantity > 0)
        );
    };

    const removeFromCart = (productId) => {
        setCart(prevCart => prevCart.filter(item => item.id !== productId));
    };

    const total = cart.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0);

    const filteredInventory = inventory.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleFinalizeSale = async () => {
        if (cart.length === 0) {
            setError("El carrito está vacío.");
            return;
        }
        setError('');
        

        const batch = writeBatch(db);
        const salesCollectionPath = `artifacts/${appId}/users/${currentUser.uid}/sales`;
        const saleDocRef = doc(collection(db, salesCollectionPath));

        const saleData = {
            id: saleDocRef.id,
            items: cart,
            total: total,
            createdAt: new Date(),
            cashierId: currentUser.uid
        };

        batch.set(saleDocRef, saleData);

        const inventoryCollectionPath = `artifacts/${appId}/users/${currentUser.uid}/inventory`;
        cart.forEach(item => {
            const productDocRef = doc(db, inventoryCollectionPath, item.id);
            const newStock = item.stock - item.quantity;
            batch.update(productDocRef, { stock: newStock });
        });

        try {
            await batch.commit();
            setCompletedSaleData(saleData);
            setIsTicketModalOpen(true);
            setCart([]);
        } catch (err) {
            console.error("Error al finalizar la venta:", err);
            setError("No se pudo completar la venta. El stock no ha sido modificado.");
        }
    };

    if (loading) {
        return <div className="text-center text-white">Cargando productos...</div>;
    }

    return (
        <>
      
            <TicketModal 
                isOpen={isTicketModalOpen} 
                onClose={() => setIsTicketModalOpen(false)} 
                saleData={completedSaleData} 
            />
            <div className="animate-fade-in flex flex-col lg:flex-row gap-8 h-full">
                {/* Catálogo de Productos */}
                <div className="lg:w-2/3">
                    <h2 className="text-3xl font-bold text-white mb-4">Punto de Venta</h2>
                    <input
                        type="text"
                        placeholder="Buscar producto..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full p-3 bg-gray-700 text-white rounded-md border border-gray-600 focus:ring-2 focus:ring-amber-500 mb-6"
                    />
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto" style={{maxHeight: 'calc(100vh - 250px)'}}>
                        {filteredInventory.map(product => (
                            <button 
                                key={product.id} 
                                onClick={() => addToCart(product)} 
                                className="bg-gray-800 rounded-lg p-4 text-center hover:bg-gray-700 hover:shadow-lg transition-all transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed" 
                                disabled={product.stock <= 0}
                            >
                                <img src={`https://placehold.co/150x100/1F2937/FBBF24?text=${product.name.replace(' ', '+')}`} alt={`Imagen de ${product.name}`} className="mx-auto mb-2 rounded-md" />
                                <h3 className="font-semibold text-white">{product.name}</h3>
                                <p className="text-amber-400 font-bold">${product.price ? product.price.toFixed(2) : '0.00'}</p>
                                <p className={`text-sm ${product.stock > 0 ? 'text-gray-400' : 'text-red-500 font-bold'}`}>
                                    {product.stock > 0 ? `Stock: ${product.stock}` : 'Agotado'}
                                </p>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Carrito de Compras */}
                <div className="lg:w-1/3 bg-gray-800 rounded-xl shadow-2xl flex flex-col p-6 h-full">
                    <h3 className="text-2xl font-bold text-white border-b border-gray-700 pb-4 mb-4">Carrito</h3>
                    {error && <p className="bg-red-500 text-white p-3 rounded-md mb-4">{error}</p>}
                    <div className="flex-grow overflow-y-auto">
                        {cart.length === 0 ? (
                            <p className="text-gray-400 text-center mt-10">El carrito está vacío.</p>
                        ) : (
                            <div className="space-y-4">
                                {cart.map(item => (
                                    <div key={item.id} className="flex items-center gap-4 bg-gray-900/50 p-3 rounded-lg">
                                        <div className="flex-grow">
                                            <p className="font-semibold text-white">{item.name}</p>
                                            <p className="text-sm text-gray-400">${item.price ? item.price.toFixed(2) : '0.00'}</p>
                                        </div>
                                        <input 
                                            type="number" 
                                            value={item.quantity}
                                            onChange={(e) => updateCartQuantity(item.id, e.target.value)}
                                            className="w-16 bg-gray-700 text-white text-center rounded-md border border-gray-600"
                                            step="0.1"
                                        />
                                        <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-400"><TrashIcon /></button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="border-t border-gray-700 pt-4 mt-4">
                        <div className="flex justify-between items-center text-2xl font-bold text-white mb-4">
                            <span>Total:</span>
                            <span>${total.toFixed(2)}</span>
                        </div>
                        <button 
                            onClick={handleFinalizeSale} 
                            className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-4 rounded-lg transition-transform transform hover:scale-105 disabled:opacity-50" 
                            disabled={cart.length === 0}
                        >
                            Finalizar Venta
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default SalesPOS;