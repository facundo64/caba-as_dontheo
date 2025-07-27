import React, { useState, useEffect, useMemo, useRef } from 'react';
import { collection, query, onSnapshot, addDoc, doc, updateDoc, writeBatch, where, getDocs, serverTimestamp, increment } from 'firebase/firestore';
import { db } from '../../services/firebase.js';
import { useAuth } from '../../context/AuthContext.jsx';
import Modal from '../common/Modal.jsx';
import TicketModal from './TicketModal.jsx';
import { TrashIcon, BackspaceIcon, AddressBookIcon } from '../common/Icons.jsx';

// --- Sub-componente: Vista de Ventas (TPV) ---
const SalesView = ({ onProceedToPayment, setSaleData }) => {
    const { currentUser } = useAuth();
    const [inventory, setInventory] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [cart, setCart] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState({ id: 'consumidor_final', name: 'Consumidor Final' });
    const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
    const appId = 'qualtech-saas-demo';

    useEffect(() => {
        if (!currentUser) return;
        // Cargar Inventario
        const invQuery = query(collection(db, `artifacts/${appId}/users/${currentUser.uid}/inventory`));
        const unsubInv = onSnapshot(invQuery, (snapshot) => {
            setInventory(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        // Cargar Clientes
        const custQuery = query(collection(db, `artifacts/${appId}/users/${currentUser.uid}/customers`));
        const unsubCust = onSnapshot(custQuery, (snapshot) => {
            setCustomers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        return () => { unsubInv(); unsubCust(); };
    }, [currentUser]);

    const addToCart = (product) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
            }
            return [...prev, { ...product, quantity: 1 }];
        });
    };

    const updateCartQuantity = (id, qty) => {
        const newQty = parseFloat(qty);
        setCart(prev => prev.map(item => item.id === id ? { ...item, quantity: isNaN(newQty) || newQty < 0 ? 0 : newQty } : item).filter(item => item.quantity > 0));
    };

    const removeFromCart = (id) => setCart(prev => prev.filter(item => item.id !== id));
    
    const total = useMemo(() => cart.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0), [cart]);

    const handleProceedToPayment = () => {
        if (cart.length === 0) return;
        setSaleData({ cart, total, customer: selectedCustomer });
        onProceedToPayment();
    };

    const filteredInventory = inventory.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="flex flex-col md:flex-row gap-4 h-full">
            {/* Carrito y Cliente */}
            <div className="w-full md:w-1/3 bg-gray-800 p-4 rounded-lg flex flex-col">
                <div className="flex justify-between items-center pb-2 border-b border-gray-700">
                    <h3 className="text-xl font-bold text-white">Orden</h3>
                    <button onClick={() => setIsCustomerModalOpen(true)} className="flex items-center gap-2 text-amber-400 hover:text-amber-300 text-sm">
                        <AddressBookIcon /> {selectedCustomer.name}
                    </button>
                </div>
                <div className="flex-grow overflow-y-auto py-4">
                    {cart.length === 0 ? <p className="text-gray-400 text-center mt-10">Comience a agregar productos</p> : 
                        cart.map(item => (
                            <div key={item.id} className="flex items-center gap-2 mb-2 p-2 bg-gray-900/50 rounded-md">
                                <div className="flex-grow">
                                    <p className="text-white font-semibold">{item.name}</p>
                                    <p className="text-xs text-gray-400">${item.price.toFixed(2)} x {item.quantity}</p>
                                </div>
                                <span className="w-24 text-right text-white font-bold">${(item.price * item.quantity).toFixed(2)}</span>
                                <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-400 p-1"><TrashIcon /></button>
                            </div>
                        ))
                    }
                </div>
                <div className="border-t border-gray-700 pt-4">
                    <div className="flex justify-between text-2xl font-bold text-white mb-4"><span>Total:</span><span>${total.toFixed(2)}</span></div>
                    <button onClick={handleProceedToPayment} className="w-full bg-amber-500 text-white font-bold py-3 rounded-lg disabled:opacity-50 transition-transform transform hover:scale-105" disabled={cart.length === 0}>Pago</button>
                </div>
            </div>

            {/* Catálogo de Productos */}
            <div className="w-full md:w-2/3">
                <input type="text" placeholder="Buscar productos..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full p-3 bg-gray-800 rounded-md mb-4 text-white border border-gray-700" />
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 overflow-y-auto" style={{maxHeight: 'calc(100vh - 250px)'}}>
                    {filteredInventory.map(p => (
                        <button key={p.id} onClick={() => addToCart(p)} className="bg-gray-800 rounded-lg p-4 text-center hover:bg-gray-700 disabled:opacity-50 transition-transform transform hover:-translate-y-1" disabled={p.stock <= 0}>
                            <h3 className="font-semibold text-white">{p.name}</h3>
                            <p className="text-amber-400 font-bold">${p.price.toFixed(2)}</p>
                            <p className={`text-sm ${p.stock > 0 ? 'text-gray-400' : 'text-red-500 font-bold'}`}>{p.stock > 0 ? `Stock: ${p.stock}` : 'Agotado'}</p>
                        </button>
                    ))}
                </div>
            </div>
            
            <Modal isOpen={isCustomerModalOpen} onClose={() => setIsCustomerModalOpen(false)} title="Seleccionar Cliente">
                <div className="space-y-2 max-h-96 overflow-y-auto">
                    <button onClick={() => { setSelectedCustomer({ id: 'consumidor_final', name: 'Consumidor Final' }); setIsCustomerModalOpen(false); }} className="w-full text-left p-3 hover:bg-gray-700 rounded-md text-white">Consumidor Final</button>
                    {customers.map(c => <button key={c.id} onClick={() => { setSelectedCustomer(c); setIsCustomerModalOpen(false); }} className="w-full text-left p-3 hover:bg-gray-700 rounded-md text-white">{c.name} - {c.taxId}</button>)}
                </div>
            </Modal>
        </div>
    );
};

// --- Sub-componente: Vista de Pago ---
const PaymentView = ({ saleData, onBack, onSaleComplete }) => {
    const [paymentMethod, setPaymentMethod] = useState('efectivo');
    const [amountPaid, setAmountPaid] = useState('');
    const total = saleData.total;
    const change = parseFloat(amountPaid) >= total ? parseFloat(amountPaid) - total : 0;

    const handleNumpad = (value) => {
        if (value === 'del') {
            setAmountPaid(prev => prev.slice(0, -1));
        } else {
            setAmountPaid(prev => prev + value);
        }
    };

    return (
        <div className="flex flex-col md:flex-row gap-8 h-full">
            <div className="w-full md:w-1/3">
                <h3 className="text-2xl font-bold mb-4 text-white">Método de Pago</h3>
                <div className="space-y-2">
                    <button onClick={() => setPaymentMethod('efectivo')} className={`w-full text-left p-4 rounded-lg text-white font-semibold ${paymentMethod === 'efectivo' ? 'bg-amber-500' : 'bg-gray-700 hover:bg-gray-600'}`}>Efectivo</button>
                    <button onClick={() => setPaymentMethod('tarjeta')} className={`w-full text-left p-4 rounded-lg text-white font-semibold ${paymentMethod === 'tarjeta' ? 'bg-amber-500' : 'bg-gray-700 hover:bg-gray-600'}`}>Tarjeta</button>
                </div>
            </div>
            <div className="w-full md:w-2/3 flex flex-col items-center justify-center bg-gray-800 p-8 rounded-lg">
                <p className="text-6xl font-bold text-white mb-4">${total.toFixed(2)}</p>
                {paymentMethod === 'efectivo' && (
                    <div className="w-full max-w-sm">
                        <div className="bg-gray-900 p-4 rounded-lg text-right mb-4">
                            <p className="text-3xl text-white">{amountPaid || '0.00'}</p>
                            <p className="text-amber-400">Vuelto: ${change.toFixed(2)}</p>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            {['1','2','3','4','5','6','7','8','9','.', '0'].map(val => <button key={val} onClick={() => handleNumpad(val)} className="p-4 bg-gray-700 rounded-lg text-2xl text-white hover:bg-gray-600">{val}</button>)}
                            <button onClick={() => handleNumpad('del')} className="p-4 bg-gray-700 rounded-lg text-2xl text-white hover:bg-gray-600 flex justify-center items-center"><BackspaceIcon /></button>
                        </div>
                    </div>
                )}
                <div className="flex gap-4 mt-8 w-full max-w-sm">
                    <button onClick={onBack} className="w-full bg-gray-600 font-bold py-3 rounded-lg text-white hover:bg-gray-500">Regresar</button>
                    <button onClick={() => onSaleComplete(paymentMethod)} className="w-full bg-green-600 font-bold py-3 rounded-lg text-white hover:bg-green-500">Validar</button>
                </div>
            </div>
        </div>
    );
};

// --- Componente Principal: Caja Registradora ---
const CashRegister = () => {
    const { currentUser } = useAuth();
    const [activeSession, setActiveSession] = useState(null);
    const [view, setView] = useState('loading');
    const [isOpeningModalOpen, setIsOpeningModalOpen] = useState(false);
    const [openingAmount, setOpeningAmount] = useState('');
    const [saleData, setSaleData] = useState(null);
    const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
    const [completedSaleData, setCompletedSaleData] = useState(null);

    const appId = 'qualtech-saas-demo';

    useEffect(() => {
        const checkActiveSession = async () => {
            if (!currentUser) return;
            const sessionsRef = collection(db, `artifacts/${appId}/users/${currentUser.uid}/cashSessions`);
            const q = query(sessionsRef, where("endTime", "==", null));
            const querySnapshot = await getDocs(q);
            if (querySnapshot.empty) {
                setView('closed');
            } else {
                setActiveSession({ id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() });
                setView('sales');
            }
        };
        checkActiveSession();
    }, [currentUser]);

    const handleOpenRegister = async () => {
        if (openingAmount === '' || parseFloat(openingAmount) < 0) {
            alert("Por favor, ingrese un monto de apertura válido.");
            return;
        }
        const sessionsRef = collection(db, `artifacts/${appId}/users/${currentUser.uid}/cashSessions`);
        const newSession = {
            startTime: serverTimestamp(),
            endTime: null,
            startAmount: parseFloat(openingAmount),
            user: currentUser.email,
        };
        const docRef = await addDoc(sessionsRef, newSession);
        setActiveSession({ id: docRef.id, ...newSession });
        setView('sales');
        setIsOpeningModalOpen(false);
    };
    
    const handleSaleComplete = async (paymentMethod) => {
        const batch = writeBatch(db);
        const salesRef = collection(db, `artifacts/${appId}/users/${currentUser.uid}/sales`);
        const saleDocRef = doc(salesRef);
        const finalSaleData = {
            ...saleData,
            id: saleDocRef.id,
            paymentMethod,
            createdAt: new Date(),
            cashierId: currentUser.uid,
            sessionId: activeSession.id
        };
        batch.set(saleDocRef, finalSaleData);

        saleData.cart.forEach(item => {
            const productRef = doc(db, `artifacts/${appId}/users/${currentUser.uid}/inventory`, item.id);
            batch.update(productRef, { stock: increment(-item.quantity) });
        });
        
        if(paymentMethod === 'efectivo'){
            const sessionRef = doc(db, `artifacts/${appId}/users/${currentUser.uid}/cashSessions`, activeSession.id);
            batch.update(sessionRef, { endAmount: increment(saleData.total) });
        }

        await batch.commit();
        setCompletedSaleData(finalSaleData);
        setIsTicketModalOpen(true);
        setView('sales');
    };

    if (view === 'loading') return <div className="text-center text-white">Cargando Caja...</div>;

    if (view === 'closed') {
        return (
            <>
                <Modal isOpen={isOpeningModalOpen} onClose={() => setIsOpeningModalOpen(false)} title="Abrir Caja Registradora">
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-bold text-gray-300 block mb-2">Efectivo de Apertura</label>
                            <input type="number" value={openingAmount} onChange={e => setOpeningAmount(e.target.value)} className="w-full p-3 bg-gray-700 text-white rounded-md border border-gray-600" placeholder="0.00" />
                        </div>
                        <button onClick={handleOpenRegister} className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-4 rounded-lg">Abrir Caja</button>
                    </div>
                </Modal>
                <div className="text-center p-8">
                    <h2 className="text-2xl font-bold mb-4 text-white">No hay ninguna sesión de caja activa</h2>
                    <button onClick={() => setIsOpeningModalOpen(true)} className="bg-amber-500 text-white font-bold py-3 px-6 rounded-lg">Abrir Caja Registradora</button>
                </div>
            </>
        );
    }

    return (
        <>
            {view === 'sales' && <SalesView onProceedToPayment={() => setView('payment')} setSaleData={setSaleData} />}
            {view === 'payment' && <PaymentView saleData={saleData} onBack={() => setView('sales')} onSaleComplete={handleSaleComplete} />}
            <TicketModal isOpen={isTicketModalOpen} onClose={() => setIsTicketModalOpen(false)} saleData={completedSaleData} />
        </>
    );
};

export default CashRegister;
