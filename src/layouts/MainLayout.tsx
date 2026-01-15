import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function MainLayout() {
    const { user, loading, signOut } = useAuth();

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    if (!user) return <Navigate to="/login" replace />;

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-500 selection:text-white">
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
                <div className="max-w-5xl mx-auto px-4 h-16 flex justify-between items-center">
                    <h1 className="font-extrabold text-2xl tracking-tighter bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">GUS-T</h1>
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-slate-500 hidden sm:inline">{user.email}</span>
                        <button onClick={signOut} className="text-sm font-semibold text-slate-600 hover:text-red-600 transition-colors">
                            Sign out
                        </button>
                    </div>
                </div>
            </header>
            <main className="p-4 max-w-5xl mx-auto py-8">
                <Outlet />
            </main>
        </div>
    );
}
