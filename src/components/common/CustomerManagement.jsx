import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../services/firebase.js';
import { useAuth } from '../../context/AuthContext.jsx';
import Modal from '../common/Modal.jsx';
import { PlusCircleIcon, EditIcon, TrashIcon } from '../common/Icons.jsx';

const CustomerManagement = () => {
    const { currentUser } = useAuth();
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add'); 
    
    const initialFormState = { id: null, name: '', taxId: '', email: '', phone: '', address: '' };
    const [currentItem, setCurrentItem] = useState(initialFormState);
    
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState(''); 
    const appId = 'qualtech-saas-demo';

    useEffect(() => {
        if (!currentUser) {
            setLoading(false);
            return;
        }

        const customersCollectionPath = `artifacts/${appId}/users/${currentUser.uid}/customers`;
        const q = query(collection(db, customersCollectionPath));

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const items = [];
            querySnapshot.forEach((doc) => {
                items.push({ id: doc.id, ...doc.data() });
            });
            setCustomers(items);
            setLoading(false);
        }, (err) => {
            console.error("Error al obtener clientes:", err);
            setError("No se pudo cargar la lista de clientes.");
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentUser]);

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
        if (!currentItem.name || !currentItem.taxId) {
            setError("Nombre y CUIT/DNI son obligatorios.");
            return;
        }
        
        const dataToSave = {
            name: currentItem.name,
            taxId: currentItem.taxId,
            email: currentItem.email || '',
            phone: currentItem.phone || '',
            address: currentItem.address || '',
            updatedAt: new Date()
        };

        try {
            const customersCollectionPath = `artifacts/${appId}/users/${currentUser.uid}/customers`;
            if (modalMode === 'add') {
                await addDoc(collection(db, customersCollectionPath), { ...dataToSave, createdAt: new Date() });
            } else {
                const itemDocRef = doc(db, customersCollectionPath, currentItem.id);
                await updateDoc(itemDocRef, dataToSave);
            }
            setIsModalOpen(false);
        } catch (err) {
            console.error("Error al guardar el cliente:", err);
            setError("Ocurrió un error al guardar el cliente.");
        }
    };
    
    const handleDeleteItem = async (itemId) => {
        if (window.confirm("¿Estás seguro de que quieres eliminar este cliente?")) {
            try {
                const itemDocRef = doc(db, `artifacts/${appId}/users/${currentUser.uid}/customers`, itemId);
                await deleteDoc(itemDocRef);
            } catch (err) {
                console.error("Error al eliminar cliente:", err);
                alert("Ocurrió un error al eliminar el cliente.");
            }
        }
    };


    const filteredCustomers = customers.filter(customer => {
        const term = searchTerm.toLowerCase();
        return (
            customer.name.toLowerCase().includes(term) ||
            customer.taxId.toLowerCase().includes(term) ||
            (customer.address && customer.address.toLowerCase().includes(term))
        );
    });

    if (loading) {
        return <div className="text-center text-white">Cargando clientes...</div>;
    }

    return (
        <div className="animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h2 className="text-3xl font-bold text-white">Gestión de Clientes</h2>
                <button 
                    onClick={() => openModal('add')}
                    className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-4 rounded-lg transition-transform transform hover:scale-105 shadow-lg"
                >
                    <PlusCircleIcon />
                    Nuevo Cliente
                </button>
            </div>

            {/* Barra de Búsqueda */}
            <div className="mb-6">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar por nombre, CUIT/DNI o domicilio..."
                    className="w-full p-3 bg-gray-700 text-white rounded-md border border-gray-600 focus:ring-2 focus:ring-amber-500"
                />
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalMode === 'add' ? 'Agregar Nuevo Cliente' : 'Editar Cliente'} size="lg">
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && <p className="bg-red-500 text-white p-3 rounded-md mb-4">{error}</p>}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="text" name="name" value={currentItem.name} onChange={handleInputChange} placeholder="Nombre Completo o Razón Social *" className="w-full p-3 bg-gray-700 text-white rounded-md border border-gray-600 focus:ring-2 focus:ring-amber-500" />
                        <input type="text" name="taxId" value={currentItem.taxId} onChange={handleInputChange} placeholder="CUIT / DNI *" className="w-full p-3 bg-gray-700 text-white rounded-md border border-gray-600 focus:ring-2 focus:ring-amber-500" />
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="email" name="email" value={currentItem.email} onChange={handleInputChange} placeholder="Email" className="w-full p-3 bg-gray-700 text-white rounded-md border border-gray-600 focus:ring-2 focus:ring-amber-500" />
                        <input type="tel" name="phone" value={currentItem.phone} onChange={handleInputChange} placeholder="Teléfono" className="w-full p-3 bg-gray-700 text-white rounded-md border border-gray-600 focus:ring-2 focus:ring-amber-500" />
                    </div>
                     <input type="text" name="address" value={currentItem.address} onChange={handleInputChange} placeholder="Dirección" className="w-full p-3 bg-gray-700 text-white rounded-md border border-gray-600 focus:ring-2 focus:ring-amber-500" />

                    <div className="mt-6 pt-4 border-t border-gray-700">
                        <button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-4 rounded-lg transition-all">
                            {modalMode === 'add' ? 'Guardar Cliente' : 'Actualizar Cliente'}
                        </button>
                    </div>
                </form>
            </Modal>
            
            <div className="bg-gray-800 rounded-xl shadow-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-gray-300">
                        <thead className="bg-gray-900/50">
                            <tr>
                                <th className="p-4 font-semibold">Nombre</th>
                                <th className="p-4 font-semibold">CUIT/DNI</th>
                                <th className="p-4 font-semibold">Email</th>
                                <th className="p-4 font-semibold">Teléfono</th>
                                <th className="p-4 font-semibold text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCustomers.length > 0 ? filteredCustomers.map(item => (
                                <tr key={item.id} className="border-b border-gray-700 hover:bg-gray-700/50 transition-colors">
                                    <td className="p-4 font-medium text-white">{item.name}</td>
                                    <td className="p-4">{item.taxId}</td>
                                    <td className="p-4">{item.email || '-'}</td>
                                    <td className="p-4">{item.phone || '-'}</td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end gap-4">
                                            <button onClick={() => openModal('edit', item)} className="text-blue-400 hover:text-blue-300"><EditIcon /></button>
                                            <button onClick={() => handleDeleteItem(item.id)} className="text-red-500 hover:text-red-400"><TrashIcon /></button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="text-center p-8 text-gray-400">
                                        No se encontraron clientes con ese criterio de búsqueda.
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

export default CustomerManagement;
