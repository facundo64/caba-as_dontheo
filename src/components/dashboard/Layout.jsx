import React from 'react';
import Sidebar from './Sidebar.jsx';

const Layout = ({ children, activeView, setActiveView }) => {
    return (
        <div className="flex h-screen bg-gray-900 text-white font-sans">
            <Sidebar activeView={activeView} setActiveView={setActiveView} />
            <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto">
                {children}
            </main>
        </div>
    );
};

export default Layout;
