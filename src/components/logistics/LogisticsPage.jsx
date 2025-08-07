import React, { useState, useEffect, useRef } from 'react';
import { MapPinIcon, TruckIcon, MessageCircleIcon, PlayIcon, PauseIcon, CheckCircleIcon, ClockIcon, NavigationIcon, PhoneIcon, AlertCircle, PackageIcon, PlusIcon, XIcon } from '../common/Icons.jsx';

// --- DATOS SIMULADOS ---
const sampleLocations = [
 { id: 1, address: "Av. Corrientes 1500, CABA", lat: -34.6037, lng: -58.3816, status: 'pending' },
 { id: 2, address: "Av. Santa Fe 2500, CABA", lat: -34.5956, lng: -58.3947, status: 'pending' },
 { id: 3, address: "Av. Rivadavia 3000, CABA", lat: -34.6092, lng: -58.4098, status: 'pending' },
];

// --- ALGORITMO DE OPTIMIZACIÓN DE RUTA (TSP Simplificado) ---
const optimizeRoute = (locations, startPoint = { lat: -34.6158, lng: -58.3731 }) => {
 if (locations.length === 0) return [];
 const calculateDistance = (point1, point2) => {
   const R = 6371;
   const dLat = (point2.lat - point1.lat) * Math.PI / 180;
   const dLng = (point2.lng - point1.lng) * Math.PI / 180;
   const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
     Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) *
     Math.sin(dLng / 2) * Math.sin(dLng / 2);
   return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
 };
 const optimized = [];
 const remaining = [...locations];
 let current = startPoint;
 while (remaining.length > 0) {
   let nearestIndex = 0;
   let minDistance = calculateDistance(current, remaining[0]);
   for (let i = 1; i < remaining.length; i++) {
     const distance = calculateDistance(current, remaining[i]);
     if (distance < minDistance) {
       minDistance = distance;
       nearestIndex = i;
     }
   }
   const nextLocation = remaining.splice(nearestIndex, 1)[0];
   optimized.push(nextLocation);
   current = nextLocation;
 }
 return optimized;
};

// --- COMPONENTE PARA EL VISOR DE MAPA SIMULADO ---
const SimulatedMap = ({ drivers, deliveries }) => {
    const mapBounds = {
        minLat: -34.645,
        maxLat: -34.555,
        minLng: -58.48,
        maxLng: -58.35
    };

    const getPosition = (lat, lng) => {
        const top = ((lat - mapBounds.maxLat) / (mapBounds.minLat - mapBounds.maxLat)) * 100;
        const left = ((lng - mapBounds.minLng) / (mapBounds.maxLng - mapBounds.minLng)) * 100;
        return { top: `${top}%`, left: `${left}%` };
    };

    return (
        <div className="bg-gray-700 rounded-lg h-full relative overflow-hidden border border-gray-600">
            {deliveries.map(delivery => {
                const { top, left } = getPosition(delivery.lat, delivery.lng);
                let colorClass = 'text-red-500';
                if (delivery.status === 'completed') colorClass = 'text-green-500';
                else if (delivery.assignedDriver) colorClass = 'text-yellow-400';
                return (
                    <div key={`del-${delivery.id}`} className="absolute z-20" style={{ top, left, transform: 'translate(-50%, -100%)' }} title={delivery.address}>
                        <MapPinIcon className={`w-6 h-6 ${colorClass}`} style={{filter: 'drop-shadow(0px 1px 2px rgba(0,0,0,0.5))'}} />
                    </div>
                );
            })}
            {drivers.map(driver => {
                const { top, left } = getPosition(driver.currentLocation.lat, driver.currentLocation.lng);
                const colorClass = driver.isMoving ? 'bg-green-500' : 'bg-blue-500';
                return (
                    <div key={`drv-${driver.id}`} className="absolute z-20" style={{ top, left, transform: 'translate(-50%, -50%)' }} title={`${driver.name} - ${driver.isMoving ? 'En movimiento' : 'Detenido'}`}>
                        <TruckIcon className={`w-8 h-8 text-white p-1 rounded-full shadow-lg ${colorClass} ${driver.isMoving ? 'animate-pulse' : ''}`} />
                    </div>
                );
            })}
        </div>
    );
};

// --- VISTA DE ADMINISTRADOR ---
const AdminView = ({ deliveries, drivers, setDeliveries, setDrivers, stats }) => {
    const [newLocationInput, setNewLocationInput] = useState('');

    const assignRoute = (driverId) => {
        const availableDeliveries = deliveries.filter(d => !d.assignedDriver);
        if (availableDeliveries.length === 0) return;
        const driver = drivers.find(d => d.id === driverId);
        if (!driver) return;
        const optimizedRoute = optimizeRoute(availableDeliveries, driver.currentLocation);
        setDrivers(prev => prev.map(d => d.id === driverId ? { ...d, assignedRoute: optimizedRoute, currentStop: 0, isMoving: false } : d));
        setDeliveries(prev => prev.map(delivery => {
            const isAssigned = optimizedRoute.some(r => r.id === delivery.id);
            return isAssigned ? { ...delivery, assignedDriver: driverId, status: 'in_progress' } : delivery;
        }));
    };

    const toggleDeliveryMovement = (driverId) => {
        setDrivers(prev => prev.map(d => (d.id === driverId && d.assignedRoute.length > d.currentStop) ? { ...d, isMoving: !d.isMoving } : d));
    };
    
    const addNewLocation = () => {
        if (!newLocationInput.trim()) return;
        const newLocation = { id: Date.now(), address: newLocationInput, lat: -34.6037 + (Math.random() * 0.08 - 0.04), lng: -58.41 + (Math.random() * 0.12 - 0.06), status: 'pending', assignedDriver: null };
        setDeliveries(prev => [...prev, newLocation]);
        setNewLocationInput('');
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <section className="lg:col-span-2 bg-gray-800 rounded-xl shadow-lg">
                <div className="p-6 border-b border-gray-700"><h2 className="text-xl font-semibold text-white">Seguimiento en Tiempo Real</h2></div>
                <div className="p-6 h-[650px] flex flex-col">
                    <div className="flex-grow"><SimulatedMap drivers={drivers} deliveries={deliveries} /></div>
                    <div className="mt-6 space-y-4">
                        {drivers.map(driver => (
                            <div key={driver.id} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                                <div className="flex items-center space-x-4">
                                    <div className={`w-3 h-3 rounded-full ${driver.isMoving ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                                    <div>
                                        <p className="font-medium text-white">{driver.name}</p>
                                        <p className="text-sm text-gray-400">{driver.vehicle} - {driver.assignedRoute.length} entregas</p>
                                    </div>
                                </div>
                                <div className="flex space-x-2">
                                    <button onClick={() => assignRoute(driver.id)} disabled={stats.pending === 0} className="px-3 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-500">Asignar</button>
                                    <button onClick={() => toggleDeliveryMovement(driver.id)} disabled={!driver.assignedRoute.length || driver.currentStop >= driver.assignedRoute.length} className={`p-2 rounded-lg text-white disabled:bg-gray-500 ${driver.isMoving ? 'bg-red-500 hover:bg-red-600' : 'bg-green-600 hover:bg-green-700'}`}>
                                        {driver.isMoving ? <PauseIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <aside className="space-y-6">
                <div className="bg-gray-800 rounded-xl shadow-lg">
                    <div className="p-6 border-b border-gray-700"><h3 className="text-lg font-semibold text-white">Gestión de Entregas</h3></div>
                    <div className="p-6">
                        <div className="flex space-x-2 mb-4">
                            <input type="text" value={newLocationInput} onChange={(e) => setNewLocationInput(e.target.value)} placeholder="Nueva dirección..." onKeyPress={(e) => e.key === 'Enter' && addNewLocation()} className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500" />
                            <button onClick={addNewLocation} className="p-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600"><PlusIcon className="w-5 h-5" /></button>
                        </div>
                        <div className="space-y-3 max-h-64 overflow-y-auto">
                            {deliveries.map(delivery => (
                                <div key={delivery.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                                    <div className="flex-1"><p className="text-sm font-medium text-white truncate">{delivery.address}</p><p className="text-xs text-gray-400">{delivery.status === 'completed' ? 'Completada' : delivery.assignedDriver ? `Asignada a R. ${delivery.assignedDriver}` : 'Pendiente'}</p></div>
                                    <div className={`w-3 h-3 rounded-full ${delivery.status === 'completed' ? 'bg-green-500' : delivery.assignedDriver ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </aside>
        </div>
    );
};

// --- VISTA DE REPARTIDOR ---
const DriverView = ({ deliveries, drivers, setDeliveries, setDrivers, selectedDriver, setSelectedDriver }) => {
    const currentDriver = drivers.find(d => d.id === selectedDriver);

    const completeStop = (driverId) => {
        const driver = drivers.find(d => d.id === driverId);
        if (!driver || driver.assignedRoute.length <= driver.currentStop) return;
        const currentStopId = driver.assignedRoute[driver.currentStop].id;
        setDeliveries(prevDeliveries => prevDeliveries.map(d => d.id === currentStopId ? { ...d, status: 'completed' } : d));
        setDrivers(prevDrivers => prevDrivers.map(d => {
            if (d.id === driverId) {
                const nextStop = d.currentStop + 1;
                return { ...d, currentStop: nextStop, isMoving: false };
            }
            return d;
        }));
    };
    
    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-gray-800 rounded-xl shadow-lg mb-6 p-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">Seleccionar Repartidor:</label>
                <select value={selectedDriver} onChange={(e) => setSelectedDriver(Number(e.target.value))} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500">
                    {drivers.map(driver => (<option key={driver.id} value={driver.id}>{driver.name} - {driver.vehicle}</option>))}
                </select>
            </div>
            {currentDriver?.assignedRoute.length > 0 ? (
                <div className="space-y-4">
                    {currentDriver.assignedRoute.map((delivery, index) => (
                        <div key={delivery.id} className={`p-4 rounded-lg border-2 ${index === currentDriver.currentStop ? 'border-amber-500 bg-gray-700' : index < currentDriver.currentStop ? 'border-gray-600 bg-gray-800 opacity-60' : 'border-gray-700 bg-gray-800'}`}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${index < currentDriver.currentStop ? 'bg-green-500 text-white' : index === currentDriver.currentStop ? 'bg-amber-500 text-white animate-pulse' : 'bg-gray-600 text-gray-300'}`}>{index < currentDriver.currentStop ? <CheckCircleIcon size={20}/> : index + 1}</div>
                                    <div><p className="font-medium text-white">{delivery.address}</p></div>
                                </div>
                                {index === currentDriver.currentStop && (
                                    <button onClick={() => completeStop(currentDriver.id)} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"><CheckCircleIcon className="w-4 h-4" /><span>Completar</span></button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-8 bg-gray-800 rounded-xl"><TruckIcon className="w-12 h-12 text-gray-500 mx-auto mb-4" /><p className="text-gray-400">No hay entregas asignadas</p></div>
            )}
        </div>
    );
};

// --- COMPONENTE PRINCIPAL DE LOGÍSTICA ---
const LogisticsPage = () => {
    const [currentView, setCurrentView] = useState('admin');
    const [deliveries, setDeliveries] = useState([]);
    const [drivers, setDrivers] = useState([
        { id: 1, name: 'Carlos', vehicle: 'Moto 001', currentLocation: { lat: -34.6158, lng: -58.3731 }, assignedRoute: [], currentStop: 0, isMoving: false },
        { id: 2, name: 'Maria', vehicle: 'Van 002', currentLocation: { lat: -34.5889, lng: -58.4020 }, assignedRoute: [], currentStop: 0, isMoving: false }
    ]);
    const [selectedDriver, setSelectedDriver] = useState(1);

    useEffect(() => {
        if (deliveries.length === 0) {
            setDeliveries(sampleLocations.map(loc => ({ ...loc, assignedDriver: null })));
        }
    }, [deliveries.length]);

    const stats = {
        total: deliveries.length,
        completed: deliveries.filter(d => d.status === 'completed').length,
        pending: deliveries.filter(d => d.status === 'pending' && !d.assignedDriver).length,
        inProgress: deliveries.filter(d => d.status === 'in_progress').length,
    };
    
    return (
        <div className="font-sans text-white">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold">Módulo de Logística</h2>
                <div className="flex space-x-2 p-1 bg-gray-700 rounded-lg">
                    <button onClick={() => setCurrentView('admin')} className={`px-4 py-2 rounded-md font-medium ${currentView === 'admin' ? 'bg-amber-500 text-white' : 'text-gray-300'}`}>Admin</button>
                    <button onClick={() => setCurrentView('driver')} className={`px-4 py-2 rounded-md font-medium ${currentView === 'driver' ? 'bg-amber-500 text-white' : 'text-gray-300'}`}>Repartidor</button>
                </div>
            </div>

            {currentView === 'admin' ? 
                <AdminView deliveries={deliveries} drivers={drivers} setDeliveries={setDeliveries} setDrivers={setDrivers} stats={stats} /> : 
                <DriverView deliveries={deliveries} drivers={drivers} setDeliveries={setDeliveries} setDrivers={setDrivers} selectedDriver={selectedDriver} setSelectedDriver={setSelectedDriver} />
            }
        </div>
    );
};

export default LogisticsPage;
