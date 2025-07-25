
import React, { useRef } from 'react';
import { QualtechLogo, PrintIcon, FileDownIcon } from '../common/icons.jsx';

const PdfTicket = React.forwardRef(({ saleData }, ref) => {
    if (!saleData) return null;
    const companyDetails = {
        name: "Carnes Don Theo",
        address: "Av. Siempre Viva 742, Springfield",
        cuit: "30-12345678-9",
    };

    return (
        <div ref={ref} className="bg-white text-black p-8 font-sans">
            <div className="flex justify-between items-start mb-8">
                <div>
                     <QualtechLogo className="h-16 w-16 text-gray-800 fill-current" />
                     <h2 className="text-2xl font-bold mt-2">{companyDetails.name}</h2>
                     <p className="text-sm">{companyDetails.address}</p>
                </div>
                <div className="text-right">
                    <h1 className="text-3xl font-bold text-gray-700">RECIBO</h1>
                    <p className="text-sm">Recibo N°: {saleData.id.substring(0, 8)}</p>
                    <p className="text-sm">Fecha: {new Date(saleData.createdAt.seconds * 1000).toLocaleDateString()}</p>
                </div>
            </div>
            <div className="mb-8">
                <h3 className="font-bold border-b pb-1 mb-2">Cliente:</h3>
                <p>Consumidor Final</p>
            </div>
            <table className="w-full mb-8">
                <thead className="bg-gray-200">
                    <tr>
                        <th className="p-2 text-left">Producto</th>
                        <th className="p-2 text-right">Cantidad</th>
                        <th className="p-2 text-right">P. Unitario</th>
                        <th className="p-2 text-right">Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    {saleData.items.map(item => (
                        <tr key={item.id} className="border-b">
                            <td className="p-2">{item.name}</td>
                            <td className="p-2 text-right">{item.quantity}</td>
                            <td className="p-2 text-right">${item.price.toFixed(2)}</td>
                            <td className="p-2 text-right">${(item.price * item.quantity).toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="flex justify-end">
                <div className="w-1/3">
                    <div className="flex justify-between font-bold text-xl">
                        <span>TOTAL:</span>
                        <span>${saleData.total.toFixed(2)}</span>
                    </div>
                </div>
            </div>
            <div className="text-center text-xs text-gray-500 mt-16">
                <p>¡Gracias por su compra!</p>
                <p>Potenciado por Qualtech</p>
            </div>
        </div>
    );
});

const ThermalTicket = ({ saleData }) => {
    if (!saleData) return null;
     const companyDetails = {
        name: "Carnes Don Theo",
        address: "Av. Siempre Viva 742, Springfield",
        cuit: "30-12345678-9",
    };
    return (
        <div id="thermal-ticket-content" className="font-mono text-black bg-white p-2" style={{width: '300px'}}>
            <div className="text-center">
                <h2 className="text-xl font-bold">{companyDetails.name}</h2>
                <p className="text-xs">{companyDetails.address}</p>
                <p className="text-xs">CUIT: {companyDetails.cuit}</p>
            </div>
            <hr className="my-2 border-dashed border-black"/>
            <p className="text-xs">Fecha: {new Date(saleData.createdAt.seconds * 1000).toLocaleString()}</p>
            <p className="text-xs">Factura B Nro: {saleData.id.substring(0, 8)}</p>
            <p className="text-xs">Cliente: Consumidor Final</p>
            <hr className="my-2 border-dashed border-black"/>
            <table className="w-full text-xs">
                <thead>
                    <tr>
                        <th className="text-left">Desc</th>
                        <th className="text-right">Cant</th>
                        <th className="text-right">Precio</th>
                        <th className="text-right">Total</th>
                    </tr>
                </thead>
                <tbody>
                    {saleData.items.map(item => (
                        <tr key={item.id}>
                            <td>{item.name}</td>
                            <td className="text-right">{item.quantity}</td>
                            <td className="text-right">${item.price.toFixed(2)}</td>
                            <td className="text-right">${(item.price * item.quantity).toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <hr className="my-2 border-dashed border-black"/>
            <div className="text-right font-bold">
                <p>TOTAL: ${saleData.total.toFixed(2)}</p>
            </div>
            <hr className="my-2 border-dashed border-black"/>
            <div className="text-center text-xs">
                <p>¡Gracias por su compra!</p>
            </div>
        </div>
    );
};

const TicketModal = ({ isOpen, onClose, saleData }) => {
    const pdfRef = useRef();

    const handlePrintPdf = () => {
        const { jsPDF } = window.jspdf;
        const html2canvas = window.html2canvas;

        if (!jsPDF || !html2canvas) {
            console.error("PDF generation libraries not found on window object.");
            alert("No se pudieron cargar las librerías para generar el PDF.");
            return;
        }

        html2canvas(pdfRef.current).then((canvas) => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`recibo-${saleData.id.substring(0,8)}.pdf`);
        });
    };

    const handlePrintThermal = () => {
        const printWindow = window.open('', '_blank');
        const content = document.getElementById('thermal-ticket-content').innerHTML;
        printWindow.document.write(`
            <html>
                <head>
                    <title>Imprimir Ticket</title>
                    <style>
                        body { font-family: monospace; font-size: 10px; margin: 0; }
                        table { width: 100%; border-collapse: collapse; }
                        hr { border-style: dashed; }
                    </style>
                </head>
                <body>${content}</body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
    };

    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4">
            <div className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-3xl transform transition-all duration-300">
                <div className="flex justify-between items-center p-5 border-b border-gray-700">
                    <h3 className="text-xl font-semibold text-white">Venta Finalizada</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>
                <div className="p-6 max-h-[70vh] overflow-y-auto">
                    <PdfTicket ref={pdfRef} saleData={saleData} />
                    <div className="hidden">
                        <ThermalTicket saleData={saleData} />
                    </div>
                </div>
                <div className="flex justify-end gap-4 p-5 border-t border-gray-700">
                    <button onClick={handlePrintThermal} className="flex items-center gap-2 bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition-colors"><PrintIcon/>Imprimir Ticket Térmico</button>
                    <button onClick={handlePrintPdf} className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"><FileDownIcon/>Descargar PDF</button>
                </div>
            </div>
        </div>
    );
};

export default TicketModal;