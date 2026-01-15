import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function AuthLayout() {
    const { user, loading } = useAuth();
    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    if (user) return <Navigate to="/" replace />;

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 selection:bg-indigo-500 selection:text-white">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
                <Outlet />
            </div>
        </div>
    );
}
