import React, { useState, useMemo } from 'react';
import Modal from '../common/Modal.jsx';

// --- Iconos Adicionales para un look más profesional (normalmente estarían en Icons.jsx) ---
const UserPlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="23" y1="11" x2="23" y2="17"/><line x1="20" y1="14" x2="26" y2="14"/></svg>;
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const MoreVerticalIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>;
const CheckCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
const BriefcaseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>;
const CalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>;
const BuildingIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><path d="M9 22v-4h6v4"></path><path d="M8 6h.01"></path><path d="M16 6h.01"></path><path d="M12 6h.01"></path><path d="M12 10h.01"></path><path d="M12 14h.01"></path><path d="M16 10h.01"></path><path d="M8 10h.01"></path><path d="M8 14h.01"></path><path d="M16 14h.01"></path></svg>;


// --- Datos de ejemplo de RRHH ---
const mockUsers = [
    { id: '1', displayName: 'Ana Rodriguez', email: 'ana.admin@dontheo.com', role: 'admin', department: 'Gerencia', status: 'active', startDate: '2022-01-15T10:00:00Z', lastLogin: '2025-08-06T22:30:00Z', avatar: 'https://placehold.co/100x100/FBBF24/4A5568?text=AR', phone: '11-1234-5678', address: 'Av. Corrientes 1234, CABA', emergencyContact: 'Juan Rodriguez (hermano) - 11-8765-4321', vacationDays: 15, sickDays: 3 },
    { id: '2', displayName: 'Carlos Gomez', email: 'carlos.gomez@dontheo.com', role: 'cajero', department: 'Ventas', status: 'active', startDate: '2023-03-20T11:30:00Z', lastLogin: '2025-08-06T18:45:00Z', avatar: 'https://placehold.co/100x100/4A5568/FBBF24?text=CG', phone: '11-2345-6789', address: 'Calle Falsa 123, CABA', emergencyContact: 'Maria Gomez (esposa) - 11-9876-5432', vacationDays: 10, sickDays: 1 },
    { id: '3', displayName: 'Lucia Fernandez', email: 'lucia.fernandez@dontheo.com', role: 'ventas', department: 'Ventas', status: 'inactive', startDate: '2023-05-10T14:00:00Z', lastLogin: '2025-07-28T09:12:00Z', avatar: 'https://placehold.co/100x100/FBBF24/4A5568?text=LF', phone: '11-3456-7890', address: 'Av. Santa Fe 4321, CABA', emergencyContact: 'Pedro Fernandez (padre) - 11-0987-6543', vacationDays: 10, sickDays: 5 },
    { id: '4', displayName: 'Marcos Herrera', email: 'nuevo.usuario@email.com', role: 'employee', department: 'Logística', status: 'pending', startDate: '2025-08-10T09:00:00Z', lastLogin: null, avatar: 'https://placehold.co/100x100/4A5568/FBBF24?text=MH', phone: '', address: '', emergencyContact: '', vacationDays: 0, sickDays: 0 },
    { id: '5', displayName: 'Sofia Diaz', email: 'sofia.diaz@dontheo.com', role: 'repositor', department: 'Depósito', status: 'active', startDate: '2023-02-01T08:00:00Z', lastLogin: '2025-08-06T21:55:00Z', avatar: 'https://placehold.co/100x100/FBBF24/4A5568?text=SD', phone: '11-5678-9012', address: 'Av. Cabildo 2109, CABA', emergencyContact: 'Laura Diaz (madre) - 11-2109-8765', vacationDays: 12, sickDays: 0 },
    { id: '6', displayName: 'Javier Torres', email: 'javier.torres@dontheo.com', role: 'conductor', department: 'Logística', status: 'active', startDate: '2023-04-12T09:00:00Z', lastLogin: '2025-08-06T14:20:00Z', avatar: 'https://placehold.co/100x100/4A5568/FBBF24?text=JT', phone: '11-4567-8901', address: 'Av. Rivadavia 5678, CABA', emergencyContact: 'Laura Torres (hermana) - 11-1098-7654', vacationDays: 8, sickDays: 0 },
    { id: '7', displayName: 'Valeria Luna', email: 'valeria.luna@email.com', role: 'employee', department: 'Ventas', status: 'pending', startDate: '2025-08-06T10:15:00Z', lastLogin: null, avatar: 'https://placehold.co/100x100/FBBF24/4A5568?text=VL', phone: '', address: '', emergencyContact: '', vacationDays: 0, sickDays: 0 },
    { id: '8', displayName: 'Ricardo Peña', email: 'ricardo.pena@dontheo.com', role: 'repositor', department: 'Depósito', status: 'active', startDate: '2024-01-10T08:00:00Z', lastLogin: '2025-08-05T22:00:00Z', avatar: 'https://placehold.co/100x100/4A5568/FBBF24?text=RP', phone: '11-6789-0123', address: 'Av. del Libertador 3456, CABA', emergencyContact: 'Ana Peña (esposa) - 11-3210-9876', vacationDays: 5, sickDays: 2 },
    { id: '9', displayName: 'Gabriela Soto', email: 'gabriela.soto@dontheo.com', role: 'cajero', department: 'Ventas', status: 'active', startDate: '2024-06-01T11:00:00Z', lastLogin: '2025-08-06T17:30:00Z', avatar: 'https://placehold.co/100x100/FBBF24/4A5568?text=GS', phone: '11-7890-1234', address: 'Av. Pueyrredón 123, CABA', emergencyContact: 'Luis Soto (padre) - 11-4321-0987', vacationDays: 2, sickDays: 0 },
    { id: '10', displayName: 'Fernando Rios', email: 'fernando.rios@dontheo.com', role: 'conductor', department: 'Logística', status: 'inactive', startDate: '2022-11-05T09:00:00Z', lastLogin: '2025-06-15T13:00:00Z', avatar: 'https://placehold.co/100x100/4A5568/FBBF24?text=FR', phone: '11-8901-2345', address: 'Av. La Plata 789, CABA', emergencyContact: 'Marta Rios (madre) - 11-5432-1098', vacationDays: 0, sickDays: 0 },
    { id: '11', displayName: 'Micaela Vega', email: 'micaela.vega@email.com', role: 'employee', department: 'Administración', status: 'pending', startDate: '2025-08-11T09:00:00Z', lastLogin: null, avatar: 'https://placehold.co/100x100/FBBF24/4A5568?text=MV', phone: '', address: '', emergencyContact: '', vacationDays: 0, sickDays: 0 },
    { id: '12', displayName: 'Diego Costa', email: 'diego.costa@dontheo.com', role: 'ventas', department: 'Ventas', status: 'active', startDate: '2023-09-01T10:00:00Z', lastLogin: '2025-08-06T16:00:00Z', avatar: 'https://placehold.co/100x100/4A5568/FBBF24?text=DC', phone: '11-9012-3456', address: 'Av. Córdoba 987, CABA', emergencyContact: 'Sofia Costa (hermana) - 11-6543-2109', vacationDays: 7, sickDays: 1 },
    { id: '13', displayName: 'Laura Nuñez', email: 'laura.nunez@dontheo.com', role: 'cajero', department: 'Ventas', status: 'active', startDate: '2024-08-01T11:00:00Z', lastLogin: '2025-08-06T19:00:00Z', avatar: 'https://placehold.co/100x100/FBBF24/4A5568?text=LN', phone: '11-0123-4567', address: 'Av. Jujuy 654, CABA', emergencyContact: 'Marcos Nuñez (esposo) - 11-7654-3210', vacationDays: 1, sickDays: 0 },
    { id: '14', displayName: 'Esteban Paredes', email: 'esteban.paredes@dontheo.com', role: 'repositor', department: 'Depósito', status: 'active', startDate: '2022-07-20T08:00:00Z', lastLogin: '2025-08-05T18:00:00Z', avatar: 'https://placehold.co/100x100/4A5568/FBBF24?text=EP', phone: '11-1234-5678', address: 'Av. Boedo 321, CABA', emergencyContact: 'Clara Paredes (madre) - 11-8765-4321', vacationDays: 14, sickDays: 4 },
];

const mockActivity = [
    { id: 1, action: 'Inició sesión', timestamp: '2025-08-06T22:30:00Z' },
    { id: 2, action: 'Actualizó el producto "Lomo"', timestamp: '2025-08-06T22:35:00Z' },
    { id: 3, action: 'Creó la venta #00124', timestamp: '2025-08-06T18:40:00Z' },
    { id: 4, action: 'Cerró la sesión', timestamp: '2025-08-06T19:00:00Z' },
];

// --- Sub-componentes ---
const StatCard = ({ title, value, icon, colorClass }) => (
    <div className={`bg-gray-800 p-4 rounded-lg border-l-4 ${colorClass} flex items-center gap-4`}>
        <div className="text-2xl text-amber-400">{icon}</div>
        <div>
            <p className="text-sm text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-white">{value}</p>
        </div>
    </div>
);
const Toast = ({ message, show }) => (
    <div className={`fixed bottom-5 right-5 bg-green-500 text-white py-2 px-4 rounded-lg shadow-lg flex items-center gap-2 transition-transform duration-300 ${show ? 'translate-x-0' : 'translate-x-[calc(100%+20px)]'}`}>
        <CheckCircleIcon />
        <span>{message}</span>
    </div>
);

const UserManagement = () => {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [modalTab, setModalTab] = useState('personal');
    const [currentPage, setCurrentPage] = useState(1);
    const usersPerPage = 5;

    const triggerToast = (message) => {
        setToastMessage(message);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    const openEditModal = (user) => {
        setSelectedUser({ ...user });
        setModalTab('personal');
        setIsEditModalOpen(true);
    };

    const closeModal = () => {
        setIsEditModalOpen(false);
        setIsInviteModalOpen(false);
        setSelectedUser(null);
    };
    
    const handleInviteUser = () => {
        closeModal();
        triggerToast("Invitación enviada correctamente.");
    };

    const handleUpdateUser = () => {
        closeModal();
        triggerToast("Usuario actualizado correctamente.");
    };

    const filteredUsers = useMemo(() =>
        mockUsers.filter(user => {
            const matchesSearch = user.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesFilter = statusFilter === 'all' || user.status === statusFilter;
            return matchesSearch && matchesFilter;
        }),
        [searchTerm, statusFilter]
    );

    // --- Lógica de Paginación ---
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
    const paginatedUsers = filteredUsers.slice((currentPage - 1) * usersPerPage, currentPage * usersPerPage);
    const handleNextPage = () => { if (currentPage < totalPages) setCurrentPage(currentPage + 1); };
    const handlePrevPage = () => { if (currentPage > 1) setCurrentPage(currentPage - 1); };

    const getStatusBadge = (status) => {
        const styles = {
            active: "bg-green-500/10 text-green-400",
            pending: "bg-yellow-500/10 text-yellow-400",
            inactive: "bg-red-500/10 text-red-400",
        };
        return <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status]}`}>{status.charAt(0).toUpperCase() + status.slice(1)}</span>;
    };

    return (
        <div className="animate-fade-in">
            <Toast message={toastMessage} show={showToast} />
            <div className="mb-6">
                <h2 className="text-3xl font-bold text-white">Portal de Recursos Humanos</h2>
                <p className="text-gray-400 mt-1">Gestiona el ciclo de vida completo de los empleados de la empresa.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard title="Total de Empleados" value={mockUsers.length} icon={<BriefcaseIcon/>} colorClass="border-blue-500" />
                <StatCard title="Pendientes de Alta" value={mockUsers.filter(u => u.status === 'pending').length} icon={<UserPlusIcon/>} colorClass="border-yellow-500" />
                <StatCard title="Próximos Aniversarios" value="2" icon={<CalendarIcon/>} colorClass="border-green-500" />
                <StatCard title="Departamentos Activos" value="4" icon={<BuildingIcon/>} colorClass="border-purple-500" />
            </div>
            
            <div className="bg-gray-800 p-4 rounded-lg mb-4">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="relative w-full md:w-auto md:flex-grow">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400"><SearchIcon /></span>
                        <input type="text" placeholder="Buscar por nombre o email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full p-2 pl-10 bg-gray-700 text-white rounded-md border border-gray-600 focus:ring-2 focus:ring-amber-500"/>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setStatusFilter('all')} className={`px-3 py-1 rounded-md text-sm ${statusFilter === 'all' ? 'bg-amber-500 text-white' : 'bg-gray-700'}`}>Todos</button>
                        <button onClick={() => setStatusFilter('active')} className={`px-3 py-1 rounded-md text-sm ${statusFilter === 'active' ? 'bg-amber-500 text-white' : 'bg-gray-700'}`}>Activos</button>
                        <button onClick={() => setStatusFilter('pending')} className={`px-3 py-1 rounded-md text-sm ${statusFilter === 'pending' ? 'bg-amber-500 text-white' : 'bg-gray-700'}`}>Pendientes</button>
                    </div>
                    <button onClick={() => setIsInviteModalOpen(true)} className="w-full md:w-auto flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-4 rounded-lg transition-transform transform hover:scale-105">
                        <UserPlusIcon /> Invitar Usuario
                    </button>
                </div>
            </div>

            <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-gray-300">
                        <thead className="bg-gray-900/50">
                            <tr>
                                <th className="p-4 font-semibold">Empleado</th>
                                <th className="p-4 font-semibold">Posición</th>
                                <th className="p-4 font-semibold">Estado</th>
                                <th className="p-4 font-semibold">Fecha de Ingreso</th>
                                <th className="p-4 font-semibold text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedUsers.map(user => (
                                <tr key={user.id} className="border-b border-gray-700 hover:bg-gray-700/50 transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <img src={user.avatar} alt={user.displayName} className="w-10 h-10 rounded-full object-cover" />
                                            <div><p className="font-medium text-white">{user.displayName}</p><p className="text-xs text-gray-400">{user.email}</p></div>
                                        </div>
                                    </td>
                                    <td className="p-4"><div className="flex flex-col"><span className="font-semibold capitalize">{user.role}</span><span className="text-xs text-gray-400">{user.department}</span></div></td>
                                    <td className="p-4">{getStatusBadge(user.status)}</td>
                                    <td className="p-4 text-sm">{new Date(user.startDate).toLocaleDateString()}</td>
                                    <td className="p-4 text-right"><button onClick={() => openEditModal(user)} className="text-gray-400 hover:text-white p-2 rounded-full"><MoreVerticalIcon /></button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="p-4 flex justify-between items-center text-sm text-gray-400">
                    <span>Página {currentPage} de {totalPages}</span>
                    <div className="flex gap-1">
                        <button onClick={handlePrevPage} disabled={currentPage === 1} className="px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed">Anterior</button>
                        <button onClick={handleNextPage} disabled={currentPage === totalPages} className="px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed">Siguiente</button>
                    </div>
                </div>
            </div>

            {selectedUser && (
                <Modal isOpen={isEditModalOpen} onClose={closeModal} title="Legajo del Empleado">
                    <div className="flex items-center gap-4 border-b border-gray-700 pb-4 mb-4">
                        <img src={selectedUser.avatar} alt={selectedUser.displayName} className="w-16 h-16 rounded-full" />
                        <div><h3 className="text-xl font-bold text-white">{selectedUser.displayName}</h3><p className="text-gray-400">{selectedUser.email}</p></div>
                    </div>
                    <div className="flex border-b border-gray-700 mb-4">
                        <button onClick={() => setModalTab('personal')} className={`py-2 px-4 font-semibold ${modalTab === 'personal' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-gray-400'}`}>Info Personal</button>
                        <button onClick={() => setModalTab('role')} className={`py-2 px-4 font-semibold ${modalTab === 'role' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-gray-400'}`}>Posición y Rol</button>
                        <button onClick={() => setModalTab('absences')} className={`py-2 px-4 font-semibold ${modalTab === 'absences' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-gray-400'}`}>Ausencias</button>
                        <button onClick={() => setModalTab('documents')} className={`py-2 px-4 font-semibold ${modalTab === 'documents' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-gray-400'}`}>Documentos</button>
                    </div>

                    {modalTab === 'personal' && (
                        <div className="space-y-4 animate-fade-in">
                            <div><label className="block text-sm font-medium text-gray-400">Teléfono</label><input type="text" defaultValue={selectedUser.phone} className="w-full p-2 bg-gray-700 text-white rounded-md"/></div>
                            <div><label className="block text-sm font-medium text-gray-400">Dirección</label><input type="text" defaultValue={selectedUser.address} className="w-full p-2 bg-gray-700 text-white rounded-md"/></div>
                            <div><label className="block text-sm font-medium text-gray-400">Contacto de Emergencia</label><input type="text" defaultValue={selectedUser.emergencyContact} className="w-full p-2 bg-gray-700 text-white rounded-md"/></div>
                        </div>
                    )}
                    {modalTab === 'role' && (
                        <div className="space-y-4 animate-fade-in">
                            <div><label className="block text-sm font-medium text-gray-400">Departamento</label><input type="text" defaultValue={selectedUser.department} className="w-full p-2 bg-gray-700 text-white rounded-md"/></div>
                            <div><label className="block text-sm font-medium text-gray-400">Rol</label><select defaultValue={selectedUser.role} className="w-full p-2 bg-gray-700 text-white rounded-md"><option>Admin</option><option>Cajero</option></select></div>
                            <div><label className="block text-sm font-medium text-gray-400">Estado</label><select defaultValue={selectedUser.status} className="w-full p-2 bg-gray-700 text-white rounded-md"><option>Active</option><option>Pending</option></select></div>
                        </div>
                    )}
                    {modalTab === 'absences' && (
                        <div className="space-y-4 animate-fade-in">
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-sm font-medium text-gray-400">Días de Vacaciones</label><input type="number" defaultValue={selectedUser.vacationDays} className="w-full p-2 bg-gray-700 text-white rounded-md"/></div>
                                <div><label className="block text-sm font-medium text-gray-400">Días por Enfermedad</label><input type="number" defaultValue={selectedUser.sickDays} className="w-full p-2 bg-gray-700 text-white rounded-md"/></div>
                            </div>
                            <button className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-md">Registrar Nueva Ausencia</button>
                        </div>
                    )}
                    {modalTab === 'documents' && (
                        <div className="animate-fade-in text-center">
                            <p className="text-gray-400 mb-4">Gestionar documentos del empleado.</p>
                            <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">Subir Documento</button>
                        </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-4 mt-6 pt-4 border-t border-gray-700">
                        <button onClick={closeModal} className="w-full bg-red-600/20 hover:bg-red-600/40 text-red-400 font-bold py-2 px-4 rounded-lg">Archivar Empleado</button>
                        <button onClick={handleUpdateUser} className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-4 rounded-lg">Guardar Cambios</button>
                    </div>
                </Modal>
            )}

            <Modal isOpen={isInviteModalOpen} onClose={closeModal} title="Contratar Nuevo Miembro">
                <div className="space-y-4">
                    <div><label className="block text-sm font-medium text-gray-300 mb-1">Nombre Completo</label><input type="text" placeholder="Ej: Juan Pérez" className="w-full p-3 bg-gray-700 text-white rounded-md border border-gray-600"/></div>
                    <div><label className="block text-sm font-medium text-gray-300 mb-1">Correo Electrónico</label><input type="email" placeholder="juan.perez@email.com" className="w-full p-3 bg-gray-700 text-white rounded-md border border-gray-600"/></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium text-gray-300 mb-1">Departamento</label><select className="w-full p-3 bg-gray-700 text-white rounded-md border border-gray-600"><option>Ventas</option><option>Logística</option></select></div>
                        <div><label className="block text-sm font-medium text-gray-300 mb-1">Rol</label><select className="w-full p-3 bg-gray-700 text-white rounded-md border border-gray-600"><option>Cajero</option><option>Ventas</option></select></div>
                    </div>
                    <div><label className="block text-sm font-medium text-gray-300 mb-1">Fecha de Ingreso</label><input type="date" className="w-full p-3 bg-gray-700 text-white rounded-md border border-gray-600"/></div>
                    <div className="mt-6 pt-4 border-t border-gray-700">
                        <button onClick={handleInviteUser} className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-4 rounded-lg">Enviar Invitación y Crear Cuenta</button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default UserManagement;
