import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { UserPlus, Mail, Lock } from 'lucide-react';

export default function Register() {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error } = await supabase.auth.signUp({
            email,
            password,
        });

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            // Auto login often works, or prompts confirm. For this simple case, we assume success.
            // Supabase default is "Confirm Email" unless disabled. 
            // If "Enable Email Confirmations" is ON (default), user won't be logged in until they click link.
            // But for local dev it might differ. Let's assume flow.
            alert('Registration successful! Check your email for confirmation link if enabled, or sign in.');
            navigate('/login');
        }
    };

    return (
        <>
            <div className="text-center mb-8">
                <div className="bg-indigo-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <UserPlus className="w-8 h-8 text-indigo-600" />
                </div>
                <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Create account</h2>
                <p className="text-slate-500 mt-2">Get started with GUS-T today</p>
            </div>

            <form onSubmit={handleRegister} className="space-y-5">
                {error && (
                    <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100">
                        {error}
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email address</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Mail className="h-5 w-5 text-slate-400" />
                        </div>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all sm:text-sm"
                            placeholder="you@example.com"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-slate-400" />
                        </div>
                        <input
                            type="password"
                            required
                            minLength={6}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all sm:text-sm"
                            placeholder="Minimum 6 characters"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    {loading ? 'Creating account...' : 'Create Account'}
                </button>
            </form>

            <div className="mt-6 text-center">
                <p className="text-sm text-slate-600">
                    Already have an account?{' '}
                    <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors">
                        Sign in
                    </Link>
                </p>
            </div>
        </>
    );
}
