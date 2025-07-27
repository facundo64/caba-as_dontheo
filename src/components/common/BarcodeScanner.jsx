import React, { useEffect } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

const BarcodeScanner = ({ isOpen, onClose, onScanSuccess }) => {
    
    const scannerId = "qr-code-reader";

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const html5QrcodeScanner = new Html5Qrcode(scannerId);
        
        const config = { 
            fps: 10, 
            qrbox: { width: 250, height: 150 }
        };

        const startScanner = () => {
            html5QrcodeScanner.start(
                { facingMode: "environment" },
                config,
                (decodedText, decodedResult) => {
                    onScanSuccess(decodedText);
                    html5QrcodeScanner.stop().catch(err => console.error("Error al detener el escáner.", err));
                },
                (errorMessage) => {
                    // Ignorar errores
                }
            ).catch(err => {
                console.error("No se pudo iniciar el escáner.", err);
                alert("No se pudo iniciar la cámara. Asegúrate de dar los permisos necesarios en tu navegador.");
                onClose();
            });
        };
        
        startScanner();

        return () => {
            if (html5QrcodeScanner && html5QrcodeScanner.isScanning) {
                html5QrcodeScanner.stop().catch(err => {
                    console.warn("Advertencia al detener el escáner.", err);
                });
            }
        };
    }, [isOpen, onClose, onScanSuccess]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col items-center justify-center p-4">
            <style>{`
                @keyframes scan-line-animation {
                    0% { top: 0; }
                    100% { top: calc(100% - 2px); }
                }
                /* Usamos la variable scannerId para asegurar consistencia */
                #${scannerId} video {
                    width: 100% !important;
                    height: 100% !important;
                    object-fit: cover !important;
                }
            `}</style>

            <h3 className="text-white text-lg font-semibold mb-4 bg-black bg-opacity-50 px-4 py-2 rounded-lg">Apunta la cámara al código de barras</h3>
            
            <div className="relative w-full max-w-sm aspect-video bg-gray-800 rounded-lg overflow-hidden shadow-2xl">
                <div id={scannerId} className="w-full h-full"></div>
                
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-4 left-4 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-lg"></div>
                    <div className="absolute top-4 right-4 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-lg"></div>
                    <div className="absolute bottom-4 left-4 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-lg"></div>
                    <div className="absolute bottom-4 right-4 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-lg"></div>
                    
                    <div 
                        className="absolute left-[5%] w-[90%] h-0.5 bg-red-500 rounded-full" 
                        style={{
                            animation: 'scan-line-animation 2s linear infinite alternate',
                            boxShadow: '0 0 10px red, 0 0 20px red'
                        }}
                    ></div>
                </div>
            </div>

            <button 
                onClick={onClose}
                className="mt-6 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg transition-transform transform hover:scale-105"
            >
                Cancelar
            </button>
        </div>
    );
};

export default BarcodeScanner;