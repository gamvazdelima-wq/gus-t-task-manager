import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, Menu, UserCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function MainLayout() {
    const { user, loading } = useAuth();
    const navigate = useNavigate();

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        navigate('/login');
    };

    useEffect(() => {
        if (!loading && !user) {
            navigate('/login');
        }
    }, [user, loading, navigate]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f0f4f8]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#6750A4]"></div>
            </div>
        );
    }

    if (!user) return null; // Prevent flash of content before redirect

    return (
        <div className="min-h-screen bg-[#f0f4f8] text-[#1D1B20]">
            {/* Material 3 Top App Bar (Small) */}
            <header className="bg-[#f0f4f8] sticky top-0 z-50 transition-shadow duration-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="h-16 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button className="p-2 -ml-2 rounded-full hover:bg-slate-200/50 text-[#49454F] transition-colors">
                                <Menu className="w-6 h-6" />
                            </button>
                            <Link to="/" className="text-xl font-normal text-[#1D1B1F] tracking-tight">
                                GUS-T
                            </Link>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="hidden md:flex flex-col items-end mr-2">
                                <span className="text-sm font-medium text-[#1D1B20]">{user?.email}</span>
                            </div>
                            <div className="relative group">
                                <button className="p-1 rounded-full text-[#49454F] hover:bg-slate-200/50 transition-all">
                                    <UserCircle className="w-8 h-8" />
                                </button>
                                {/* Dropdown Menu */}
                                <div className="absolute right-0 mt-2 w-48 bg-[#EEE8F4] rounded-xl shadow-lg py-1 hidden group-hover:block animate-in fade-in zoom-in-95 duration-100 origin-top-right">
                                    <button
                                        onClick={handleSignOut}
                                        className="w-full text-left px-4 py-3 text-sm text-[#49454F] hover:bg-[#D0BCFF]/30 flex items-center gap-2 transition-colors"
                                    >
                                        <LogOut className="w-4 h-4" /> Sign out
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Outlet />
            </main>
        </div>
    );
}
