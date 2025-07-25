import React from 'react';

const Placeholder = ({ title, message }) => (
    <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 animate-fade-in">
        <div className="bg-gray-800 p-10 rounded-2xl shadow-xl">
            <h2 className="text-3xl font-bold text-white mb-4">{title}</h2>
            <p className="max-w-sm">{message}</p>
        </div>
    </div>
);

export default Placeholder;