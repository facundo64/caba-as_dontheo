import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import LoginPage from './pages/LoginPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';

function App() {
    return (
        <AuthProvider>
            <Main />
        </AuthProvider>
    );
}

const Main = () => {
    const { currentUser } = useAuth();
    const [authError, setAuthError] = useState(''); 

    return currentUser ? 
        <DashboardPage /> : 
        <LoginPage 
            authError={authError} 
            setAuthError={setAuthError}
        />;
}

export default App;