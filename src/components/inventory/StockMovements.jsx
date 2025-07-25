// SPDX-License-Identifier: MIT
// Copyright 2024 Qualtech

import React, { useState, useEffect, useRef } from 'react';
import { collection, query, where, getDocs, doc, updateDoc, increment, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../services/firebase.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { BarcodeIcon } from '../common/Icons.jsx';

const StockMovements = () => {
    const { currentUser } = useAuth();
    const [sku, setSku] = useState('');
    const [foundProduct, setFoundProduct] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const appId = 'qualtech-saas-demo';

    // Estado para el formulario de movimiento
    const [movement, setMovement] = useState({
        type: 'salida', // 'salida' o 'entrada'
        reason: 'merma', // 'merma', 'devolucion_proveedor', 'ajuste_negativo', etc.
        quantity: 1,
        notes: ''
    });

    const skuInputRef = useRef(null);
    useEffect(() => {
        skuInputRef.current?.focus();
    }, []);

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
                setMessage({ type: 'success', text: `Producto encontrado: ${productData.name}` });
            }
        } catch (err) {
            console.error("Error buscando producto:", err);
            setMessage({ type: 'error', text: 'Ocurrió un error al buscar el producto.' });
        } finally {
            setLoading(false);
        }
    };

    const handleMovementChange = (e) => {
        const { name, value } = e.target;
        setMovement(prev => ({ ...prev, [name]: value }));
    };

    const handleRegisterMovement = async () => {
        if (!foundProduct || !movement.quantity || movement.quantity <= 0) {
            setMessage({ type: 'error', text: 'Seleccione un producto y una cantidad válida.' });
            return;
        }
        setLoading(true);

        const quantityToUpdate = movement.type === 'salida' ? -movement.quantity : movement.quantity;

        try {
            // Registrar el movimiento en un historial
            const movementsCollectionPath = `artifacts/${appId}/users/${currentUser.uid}/stockMovements`;
            await addDoc(collection(db, movementsCollectionPath), {
                productId: foundProduct.id,
                productName: foundProduct.name,
                sku: foundProduct.sku,
                type: movement.type,
                reason: movement.reason,
                quantity: movement.quantity,
                notes: movement.notes,
                user: currentUser.email,
                date: serverTimestamp()
            });

            // Actualizar el stock del producto
            const itemDocRef = doc(db, `artifacts/${appId}/users/${currentUser.uid}/inventory`, foundProduct.id);
            await updateDoc(itemDocRef, {
                stock: increment(quantityToUpdate),
                lastUpdated: new Date()
            });

            setMessage({ type: 'success', text: `¡Movimiento registrado con éxito!` });
            
            // Resetear formulario
            setSku('');
            setFoundProduct(null);
            setMovement({ type: 'salida', reason: 'merma', quantity: 1, notes: '' });
            skuInputRef.current.focus();

        } catch (err) {
            console.error("Error al registrar movimiento:", err);
            setMessage({ type: 'error', text: 'Ocurrió un error al registrar el movimiento.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-fade-in">
            <h2 className="text-3xl font-bold text-white mb-6">Control de Movimientos de Stock</h2>
            
            <div className="max-w-2xl mx-auto bg-gray-800 p-8 rounded-2xl shadow-lg">
                <form onSubmit={handleSearchProduct} className="flex gap-2 mb-6">
                    <input 
                        ref={skuInputRef}
                        type="text" 
                        value={sku}
                        onChange={(e) => setSku(e.target.value)}
                        placeholder="Buscar producto por SKU..." 
                        className="w-full p-3 bg-gray-700 text-white rounded-md border border-gray-600 focus:ring-2 focus:ring-amber-500"
                    />
                    <button type="submit" className="p-3 bg-amber-500 hover:bg-amber-600 rounded-md disabled:opacity-50" disabled={loading}>
                        <BarcodeIcon />
                    </button>
                </form>

                {message.text && (
                    <div className={`p-3 rounded-md mb-4 text-center ${message.type === 'error' ? 'bg-red-500/20 text-red-300' : 'bg-green-500/20 text-green-300'}`}>
                        {message.text}
                    </div>
                )}

                {foundProduct && (
                    <div className="bg-gray-700 p-6 rounded-lg animate-fade-in space-y-4">
                        <div>
                            <h3 className="text-xl font-bold text-white">{foundProduct.name}</h3>
                            <p className="text-gray-400">Stock actual: <span className="font-bold">{foundProduct.stock}</span></p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label htmlFor="type" className="block text-sm font-medium text-gray-300 mb-1">Tipo de Movimiento</label>
                                <select id="type" name="type" value={movement.type} onChange={handleMovementChange} className="w-full p-2 bg-gray-800 text-white rounded-md border border-gray-600">
                                    <option value="salida">Salida</option>
                                    <option value="entrada">Entrada</option>
                                </select>
                            </div>
                             <div>
                                <label htmlFor="reason" className="block text-sm font-medium text-gray-300 mb-1">Motivo</label>
                                <select id="reason" name="reason" value={movement.reason} onChange={handleMovementChange} className="w-full p-2 bg-gray-800 text-white rounded-md border border-gray-600">
                                    {movement.type === 'salida' ? (
                                        <>
                                            <option value="merma">Merma</option>
                                            <option value="devolucion_proveedor">Devolución a Proveedor</option>
                                            <option value="ajuste_negativo">Ajuste Negativo</option>
                                        </>
                                    ) : (
                                        <>
                                            <option value="devolucion_cliente">Devolución de Cliente</option>
                                            <option value="ajuste_positivo">Ajuste Positivo</option>
                                        </>
                                    )}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="quantity" className="block text-sm font-medium text-gray-300 mb-1">Cantidad</label>
                                <input 
                                    id="quantity"
                                    name="quantity"
                                    type="number"
                                    value={movement.quantity}
                                    onChange={handleMovementChange}
                                    className="w-full p-2 bg-gray-800 text-white text-center rounded-md border border-gray-600"
                                    min="1"
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="notes" className="block text-sm font-medium text-gray-300 mb-1">Observaciones</label>
                            <textarea
                                id="notes"
                                name="notes"
                                value={movement.notes}
                                onChange={handleMovementChange}
                                rows="2"
                                placeholder="Ej: producto dañado, devolución factura N°123..."
                                className="w-full p-2 bg-gray-800 text-white rounded-md border border-gray-600"
                            ></textarea>
                        </div>

                        <button 
                            onClick={handleRegisterMovement}
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-all disabled:opacity-50"
                        >
                            Registrar Movimiento
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StockMovements;