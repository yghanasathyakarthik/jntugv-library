import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { useContext } from 'react';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentPortal from './pages/StudentPortal';
import AdminPortal from './pages/AdminPortal';
import LibrarianPortal from './pages/LibrarianPortal';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user } = useContext(AuthContext);
    
    if (!user) return <Navigate to="/login" replace />;
    if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/login" replace />;
    
    return children;
};

// Wrap portal routes in the layout
const PortalLayout = ({ children }) => {
    return (
        <div className="min-h-screen bg-slate-50 relative overflow-hidden font-sans flex w-full">
            {children}
        </div>
    );
};

function AppRoutes() {
    const { user, logout } = useContext(AuthContext);
    
    // Failsafe: If localStorage was corrupted by the bug, clear it to prevent infinite loop.
    if (user && !user.role) {
        logout();
        return <Navigate to="/login" replace />;
    }
    
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={user ? <Navigate to={`/${user.role}`} /> : <Login />} />
            <Route path="/register" element={user ? <Navigate to={`/${user.role}`} /> : <Register />} />
            
            <Route path="/student" element={
                <ProtectedRoute allowedRoles={['student']}>
                    <PortalLayout><StudentPortal /></PortalLayout>
                </ProtectedRoute>
            } />
            
            <Route path="/librarian" element={
                <ProtectedRoute allowedRoles={['librarian']}>
                    <PortalLayout><LibrarianPortal /></PortalLayout>
                </ProtectedRoute>
            } />
            
            <Route path="/admin" element={
                <ProtectedRoute allowedRoles={['admin']}>
                    <PortalLayout><AdminPortal /></PortalLayout>
                </ProtectedRoute>
            } />

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

function App() {
  return (
    <AuthProvider>
        <BrowserRouter>
            <AppRoutes />
        </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
