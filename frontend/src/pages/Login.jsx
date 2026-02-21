import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineTruck } from 'react-icons/hi';
import { FiMapPin, FiTruck, FiShield, FiBarChart2 } from 'react-icons/fi';

const features = [
    { icon: <FiTruck />, text: 'Fleet Tracking' },
    { icon: <FiMapPin />, text: 'Smart Dispatch' },
    { icon: <FiBarChart2 />, text: 'Analytics' },
    { icon: <FiShield />, text: 'Safety Scores' },
];

const Login = () => {
    const [form, setForm] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await authAPI.login(form);
            login(res.data.token, res.data.user);
            toast.success('Welcome back!');
            navigate('/dashboard');
        } catch (error) {
            const msg = error.response?.data?.message || 'Login failed';
            toast.error(msg);
            if (error.response?.data?.needsVerification) {
                navigate('/verify-otp', { state: { email: error.response.data.email } });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col lg:flex-row relative overflow-hidden bg-[#020617]">
            {/* Animated Background */}
            <div className="absolute inset-0">
                <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[150px] animate-pulse" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-indigo-600/15 rounded-full blur-[130px] animate-pulse" style={{ animationDelay: '2s' }} />
                <div className="absolute top-[40%] left-[50%] w-[300px] h-[300px] bg-cyan-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '4s' }} />
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
            </div>

            {/* Left Panel - Branding */}
            <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center p-12">
                <div className="relative z-10 max-w-md">
                    <div className="w-16 h-16 mb-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-3xl text-white shadow-2xl shadow-blue-500/30 rotate-[-6deg] hover:rotate-0 transition-transform duration-500">
                        <HiOutlineTruck />
                    </div>
                    <h1 className="text-5xl font-extrabold text-white mb-4 leading-tight tracking-tight">
                        Manage Your
                        <span className="block bg-gradient-to-r from-blue-400 via-cyan-400 to-indigo-400 bg-clip-text text-transparent">
                            Fleet Smarter
                        </span>
                    </h1>
                    <p className="text-lg text-slate-400 leading-relaxed mb-10">
                        Centralized logistics hub for vehicle lifecycle management, driver safety monitoring, and financial performance tracking.
                    </p>

                    {/* Dynamic Feature pills */}
                    <div className="flex flex-wrap gap-3">
                        {features.map((f) => (
                            <span key={f.text} className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-sm text-slate-300 backdrop-blur-sm hover:bg-white/[0.07] hover:border-white/[0.15] transition-all duration-300 cursor-default">
                                <span className="text-blue-400">{f.icon}</span>
                                {f.text}
                            </span>
                        ))}
                    </div>

                    <div className="mt-12 flex items-center gap-3">
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
                        <span className="text-xs text-slate-500 uppercase tracking-widest">FleetFlow</span>
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
                    </div>
                </div>
            </div>

            {/* Right Panel - Form */}
            <div className="flex-1 flex items-center justify-center px-4 py-8 sm:p-10">
                <div className="w-full max-w-[440px] animate-fade-in">
                    {/* Mobile Logo */}
                    <div className="lg:hidden text-center mb-6">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl sm:rounded-2xl flex items-center justify-center text-2xl sm:text-3xl text-white shadow-xl shadow-blue-500/25">
                            <HiOutlineTruck />
                        </div>
                        <h1 className="text-xl sm:text-2xl font-bold text-white">FleetFlow</h1>
                        <p className="text-xs sm:text-sm text-slate-500 mt-1">Fleet & Logistics Management</p>
                    </div>

                    {/* Card */}
                    <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/[0.06] rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 shadow-2xl">
                        <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">Welcome Back</h2>
                        <p className="text-slate-400 text-xs sm:text-sm mb-6 sm:mb-8">Enter your credentials to access your account</p>

                        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                            <div>
                                <label className="text-[10px] sm:text-xs font-medium text-slate-400 mb-1.5 sm:mb-2 block uppercase tracking-wider">Email</label>
                                <div className="relative group">
                                    <HiOutlineMail className="absolute top-1/2 left-3.5 sm:left-4 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="name@company.com"
                                        value={form.email}
                                        onChange={handleChange}
                                        required
                                        className="w-full py-3 sm:py-3.5 pl-10 sm:pl-11 pr-4 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-sm outline-none placeholder-slate-600 focus:border-blue-500/50 focus:bg-white/[0.06] focus:ring-1 focus:ring-blue-500/20 transition-all duration-300"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] sm:text-xs font-medium text-slate-400 mb-1.5 sm:mb-2 block uppercase tracking-wider">Password</label>
                                <div className="relative group">
                                    <HiOutlineLockClosed className="absolute top-1/2 left-3.5 sm:left-4 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                                    <input
                                        type="password"
                                        name="password"
                                        placeholder="••••••••"
                                        value={form.password}
                                        onChange={handleChange}
                                        required
                                        minLength={6}
                                        className="w-full py-3 sm:py-3.5 pl-10 sm:pl-11 pr-4 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-sm outline-none placeholder-slate-600 focus:border-blue-500/50 focus:bg-white/[0.06] focus:ring-1 focus:ring-blue-500/20 transition-all duration-300"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full py-3 sm:py-3.5 mt-1 sm:mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl text-white text-sm font-semibold flex items-center justify-center min-h-[44px] sm:min-h-[48px] hover:from-blue-500 hover:to-indigo-500 hover:shadow-xl hover:shadow-blue-600/25 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300"
                                disabled={loading}
                            >
                                {loading ? <span className="spinner" /> : 'Sign In'}
                            </button>
                        </form>

                        <div className="mt-5 sm:mt-6 flex items-center gap-3">
                            <div className="h-px flex-1 bg-white/[0.06]" />
                            <span className="text-xs text-slate-500">OR</span>
                            <div className="h-px flex-1 bg-white/[0.06]" />
                        </div>

                        <p className="text-center text-xs sm:text-sm text-slate-400 mt-5 sm:mt-6">
                            Don't have an account?{' '}
                            <Link to="/register" className="text-blue-400 font-semibold hover:text-blue-300 transition-colors">
                                Create Account
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
