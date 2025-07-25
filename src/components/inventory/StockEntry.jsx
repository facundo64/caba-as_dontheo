import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../../services/firebase.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { BarcodeIcon } from '../common/Icons.jsx';

const StockEntry = () => {
    const { currentUser } = useAuth();
    const [sku, setSku] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [foundProduct, setFoundProduct] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const appId = 'qualtech-saas-demo';

    const handleSearchProduct = async (e) => {
        e.preventDefault();
        if (!sku) {
            setMessage({ type: 'error', text: 'Por favor, ingrese un SKU.' });
            return;
        }
        setLoading(true);
        setMessage({ type: '', text: '' });
        setFoundProduct(null);

        try {
            const inventoryCollectionPath = `artifacts/${appId}/users/${currentUser.uid}/inventory`;
            const q = query(collection(db, inventoryCollectionPath), where("sku", "==", sku));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                setMessage({ type: 'error', text: 'Producto no encontrado con ese SKU.' });
            } else {
                const productData = querySnapshot.docs[0].data();
                setFoundProduct({ id: querySnapshot.docs[0].id, ...productData });
            }
        } catch (err) {
            console.error("Error buscando producto:", err);
            setMessage({ type: 'error', text: 'Ocurrió un error al buscar el producto.' });
        } finally {
            setLoading(false);
        }
    };

    const handleAddStock = async () => {
        if (!foundProduct || quantity <= 0) {
            setMessage({ type: 'error', text: 'No hay un producto seleccionado o la cantidad no es válida.' });
            return;
        }
        setLoading(true);
        try {
            const itemDocRef = doc(db, `artifacts/${appId}/users/${currentUser.uid}/inventory`, foundProduct.id);
            await updateDoc(itemDocRef, {
                stock: increment(quantity),
                lastUpdated: new Date()
            });
            setMessage({ type: 'success', text: `¡Se agregaron ${quantity} unidades al stock de ${foundProduct.name}!` });
          
            setSku('');
            setQuantity(1);
            setFoundProduct(null);
        } catch (err) {
            console.error("Error al agregar stock:", err);
            setMessage({ type: 'error', text: 'Ocurrió un error al actualizar el stock.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-fade-in">
            <h2 className="text-3xl font-bold text-white mb-6">Ingreso de Inventario</h2>
            
            <div className="max-w-xl mx-auto bg-gray-800 p-8 rounded-2xl shadow-lg">
                <form onSubmit={handleSearchProduct} className="flex gap-2 mb-6">
                    <input 
                        type="text" 
                        value={sku}
                        onChange={(e) => setSku(e.target.value)}
                        placeholder="Ingresar o escanear SKU..." 
                        className="w-full p-3 bg-gray-700 text-white rounded-md border border-gray-600 focus:ring-2 focus:ring-amber-500"
                    />
                    <button type="submit" className="p-3 bg-amber-500 hover:bg-amber-600 rounded-md" disabled={loading}>
                        <BarcodeIcon />
                    </button>
                </form>

                {message.text && (
                    <div className={`p-3 rounded-md mb-4 text-center ${message.type === 'error' ? 'bg-red-500/20 text-red-300' : 'bg-green-500/20 text-green-300'}`}>
                        {message.text}
                    </div>
                )}

                {foundProduct && (
                    <div className="bg-gray-700 p-6 rounded-lg animate-fade-in">
                        <h3 className="text-xl font-bold text-white">{foundProduct.name}</h3>
                        <p className="text-gray-400">Stock actual: <span className="font-bold">{foundProduct.stock}</span></p>
                        
                        <div className="flex items-center gap-4 my-4">
                            <label className="text-lg font-semibold text-white">Cantidad a Ingresar:</label>
                            <input 
                                type="number"
                                value={quantity}
                                onChange={(e) => setQuantity(parseFloat(e.target.value))}
                                className="w-24 p-2 bg-gray-800 text-white text-center rounded-md border border-gray-600"
                                min="1"
                            />
                        </div>

                        <button 
                            onClick={handleAddStock}
                            disabled={loading}
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-all"
                        >
                            Confirmar Ingreso de Stock
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StockEntry;
