import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';
import { HiOutlineUser, HiOutlineMail, HiOutlineLockClosed, HiOutlineTruck, HiOutlineShieldCheck } from 'react-icons/hi';
import { FiCheck } from 'react-icons/fi';

const highlights = [
    'Real-time fleet tracking & dispatch',
    'Role-based access control',
    'Automated maintenance alerts',
    'Financial analytics & reporting',
];

const roles = [
    { value: 'admin', label: 'Admin / Manager', icon: '🛡️' },
    { value: 'dispatcher', label: 'Dispatcher', icon: '📦' },
];

const Register = () => {
    const [form, setForm] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'dispatcher'
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.password !== form.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }
        setLoading(true);
        try {
            const res = await authAPI.register({
                fullName: form.fullName,
                email: form.email,
                password: form.password,
                role: form.role
            });
            toast.success(res.data.message);
            navigate('/verify-otp', { state: { email: form.email } });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const inputClass = "w-full py-3 sm:py-3.5 pl-10 sm:pl-11 pr-4 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-sm outline-none placeholder-slate-600 focus:border-blue-500/50 focus:bg-white/[0.06] focus:ring-1 focus:ring-blue-500/20 transition-all duration-300";

    return (
        <div className="min-h-screen flex flex-col lg:flex-row relative overflow-hidden bg-[#020617]">
            {/* Animated Background */}
            <div className="absolute inset-0">
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[150px] animate-pulse" />
                <div className="absolute bottom-[-15%] left-[-10%] w-[600px] h-[600px] bg-blue-600/15 rounded-full blur-[130px] animate-pulse" style={{ animationDelay: '2s' }} />
                <div className="absolute top-[30%] right-[40%] w-[250px] h-[250px] bg-violet-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '3s' }} />
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
            </div>

            {/* Left Panel - Branding */}
            <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center p-12">
                <div className="relative z-10 max-w-md">
                    <div className="w-16 h-16 mb-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-3xl text-white shadow-2xl shadow-blue-500/30 rotate-[-6deg] hover:rotate-0 transition-transform duration-500">
                        <HiOutlineTruck />
                    </div>
                    <h1 className="text-5xl font-extrabold text-white mb-4 leading-tight tracking-tight">
                        Get Started
                        <span className="block bg-gradient-to-r from-blue-400 via-cyan-400 to-indigo-400 bg-clip-text text-transparent">
                            With FleetFlow
                        </span>
                    </h1>
                    <p className="text-lg text-slate-400 leading-relaxed mb-10">
                        Create your account and start managing your fleet with powerful, real-time tools.
                    </p>

                    {/* Dynamic Highlights */}
                    <div className="space-y-4">
                        {highlights.map((item) => (
                            <div key={item} className="flex items-center gap-3">
                                <div className="w-6 h-6 rounded-full bg-blue-500/15 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                                    <FiCheck className="text-blue-400 text-xs" />
                                </div>
                                <span className="text-slate-300 text-sm">{item}</span>
                            </div>
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
            <div className="flex-1 flex items-center justify-center px-4 py-6 sm:p-10">
                <div className="w-full max-w-[440px] animate-fade-in">
                    {/* Mobile Logo */}
                    <div className="lg:hidden text-center mb-5">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-2.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl sm:rounded-2xl flex items-center justify-center text-2xl sm:text-3xl text-white shadow-xl shadow-blue-500/25">
                            <HiOutlineTruck />
                        </div>
                        <h1 className="text-xl sm:text-2xl font-bold text-white">FleetFlow</h1>
                        <p className="text-xs sm:text-sm text-slate-500 mt-1">Create your fleet management account</p>
                    </div>

                    {/* Card */}
                    <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/[0.06] rounded-2xl sm:rounded-3xl p-5 sm:p-8 md:p-10 shadow-2xl">
                        <h2 className="text-xl sm:text-2xl font-bold text-white mb-0.5">Create Account</h2>
                        <p className="text-slate-400 text-xs sm:text-sm mb-5 sm:mb-7">Fill in your details to get started</p>

                        <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4">
                            {/* Full Name */}
                            <div>
                                <label className="text-[10px] sm:text-xs font-medium text-slate-400 mb-1 sm:mb-1.5 block uppercase tracking-wider">Full Name</label>
                                <div className="relative group">
                                    <HiOutlineUser className="absolute top-1/2 left-3.5 sm:left-4 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                                    <input type="text" name="fullName" placeholder="Your full name" value={form.fullName} onChange={handleChange} required minLength={2} className={inputClass} />
                                </div>
                            </div>

                            {/* Email */}
                            <div>
                                <label className="text-[10px] sm:text-xs font-medium text-slate-400 mb-1 sm:mb-1.5 block uppercase tracking-wider">Email</label>
                                <div className="relative group">
                                    <HiOutlineMail className="absolute top-1/2 left-3.5 sm:left-4 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                                    <input type="email" name="email" placeholder="name@company.com" value={form.email} onChange={handleChange} required className={inputClass} />
                                </div>
                            </div>

                            {/* Password Row - stacks on mobile */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[10px] sm:text-xs font-medium text-slate-400 mb-1 sm:mb-1.5 block uppercase tracking-wider">Password</label>
                                    <div className="relative group">
                                        <HiOutlineLockClosed className="absolute top-1/2 left-3.5 sm:left-4 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                                        <input type="password" name="password" placeholder="Min 6 chars" value={form.password} onChange={handleChange} required minLength={6} className={inputClass} />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] sm:text-xs font-medium text-slate-400 mb-1 sm:mb-1.5 block uppercase tracking-wider">Confirm</label>
                                    <div className="relative group">
                                        <HiOutlineShieldCheck className="absolute top-1/2 left-3.5 sm:left-4 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                                        <input type="password" name="confirmPassword" placeholder="Re-enter" value={form.confirmPassword} onChange={handleChange} required minLength={6} className={inputClass} />
                                    </div>
                                </div>
                            </div>

                            {/* Role Selector */}
                            <div>
                                <label className="text-[10px] sm:text-xs font-medium text-slate-400 mb-1.5 sm:mb-2 block uppercase tracking-wider">Select Role</label>
                                <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                                    {roles.map((role) => (
                                        <label
                                            key={role.value}
                                            className={`relative flex flex-col items-center sm:flex-row sm:items-center gap-1.5 sm:gap-3 p-3 sm:p-4 rounded-xl border cursor-pointer transition-all duration-300 group
                        ${form.role === role.value
                                                    ? 'border-blue-500/40 bg-blue-500/[0.08] shadow-lg shadow-blue-500/5'
                                                    : 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12] hover:bg-white/[0.04]'
                                                }`}
                                        >
                                            <input type="radio" name="role" value={role.value} checked={form.role === role.value} onChange={handleChange} className="hidden" />
                                            <span className="text-lg sm:text-xl">{role.icon}</span>
                                            <div className="text-center sm:text-left">
                                                <p className={`text-xs sm:text-sm font-medium ${form.role === role.value ? 'text-white' : 'text-slate-300'}`}>{role.label}</p>
                                                <p className="text-[10px] text-slate-500 hidden sm:block">{role.desc}</p>
                                            </div>
                                            <div className={`absolute top-2 right-2 sm:top-3 sm:right-3 w-2 h-2 rounded-full transition-all duration-300 ${form.role === role.value ? 'bg-blue-400 shadow-md shadow-blue-400/50' : 'bg-slate-700'}`} />
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full py-3 sm:py-3.5 mt-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl text-white text-sm font-semibold flex items-center justify-center min-h-[44px] sm:min-h-[48px] hover:from-blue-500 hover:to-indigo-500 hover:shadow-xl hover:shadow-blue-600/25 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300"
                                disabled={loading}
                            >
                                {loading ? <span className="spinner" /> : 'Create Account'}
                            </button>
                        </form>

                        <div className="mt-4 sm:mt-5 flex items-center gap-3">
                            <div className="h-px flex-1 bg-white/[0.06]" />
                            <span className="text-xs text-slate-500">OR</span>
                            <div className="h-px flex-1 bg-white/[0.06]" />
                        </div>

                        <p className="text-center text-xs sm:text-sm text-slate-400 mt-4 sm:mt-5">
                            Already have an account?{' '}
                            <Link to="/login" className="text-blue-400 font-semibold hover:text-blue-300 transition-colors">
                                Sign In
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
