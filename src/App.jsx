import React from 'react';
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
  
    return currentUser ? <DashboardPage /> : <LoginPage />;
}

export default App;