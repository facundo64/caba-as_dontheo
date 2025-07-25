import React from 'react';


const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {

    if (!isOpen) return null;

   
    const sizeClasses = {
        md: 'max-w-md',
        lg: 'max-w-3xl',
        xl: 'max-w-5xl'
    };

    return (
       
        <div 
            className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 transition-opacity duration-300"
            onClick={onClose} 
        >
            <div 
                className={`bg-gray-800 rounded-2xl shadow-2xl w-full ${sizeClasses[size]} transform transition-all duration-300 scale-95 hover:scale-100`}
                onClick={e => e.stopPropagation()} 
            >
           
                <div className="flex justify-between items-center p-5 border-b border-gray-700">
                    <h3 className="text-xl font-semibold text-white">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
          
          
                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;