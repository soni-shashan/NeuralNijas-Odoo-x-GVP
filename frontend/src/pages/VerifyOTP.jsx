import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';
import { HiOutlineTruck, HiOutlineMail } from 'react-icons/hi';

const VerifyOTP = () => {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [countdown, setCountdown] = useState(60);
    const inputRefs = useRef([]);
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email;

    useEffect(() => { if (!email) navigate('/register'); }, [email, navigate]);
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    const handleChange = (index, value) => {
        if (value && !/^\d$/.test(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        if (value && index < 5) inputRefs.current[index + 1]?.focus();
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) inputRefs.current[index - 1]?.focus();
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        const newOtp = [...otp];
        for (let i = 0; i < pasted.length; i++) newOtp[i] = pasted[i];
        setOtp(newOtp);
        inputRefs.current[Math.min(pasted.length, 5)]?.focus();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const otpString = otp.join('');
        if (otpString.length !== 6) { toast.error('Please enter the complete 6-digit OTP'); return; }
        setLoading(true);
        try {
            const res = await authAPI.verifyOTP({ email, otp: otpString });
            login(res.data.token, res.data.user);
            toast.success('Email verified! Welcome to FleetFlow 🚀');
            navigate('/dashboard');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Verification failed');
        } finally { setLoading(false); }
    };

    const handleResend = async () => {
        setResendLoading(true);
        try {
            await authAPI.resendOTP({ email });
            toast.success('New OTP sent!');
            setCountdown(60);
            setOtp(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to resend OTP');
        } finally { setResendLoading(false); }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#020617] px-5">
            {/* Animated Background */}
            <div className="absolute inset-0">
                <div className="absolute top-[20%] left-[30%] w-[400px] h-[400px] bg-blue-600/20 rounded-full blur-[150px] animate-pulse" />
                <div className="absolute bottom-[10%] right-[20%] w-[350px] h-[350px] bg-indigo-600/15 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
            </div>

            <div className="relative w-full max-w-[440px] animate-fade-in">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-3xl text-white shadow-2xl shadow-blue-500/30">
                        <HiOutlineTruck />
                    </div>
                    <h1 className="text-2xl font-bold text-white">FleetFlow</h1>
                    <p className="text-sm text-slate-500 mt-1">Fleet & Logistics Management</p>
                </div>

                {/* Card */}
                <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/[0.06] rounded-3xl p-8 sm:p-10 shadow-2xl">
                    <div className="text-center mb-2">
                        <div className="w-14 h-14 mx-auto mb-4 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/20 rounded-2xl flex items-center justify-center">
                            <HiOutlineMail className="text-2xl text-emerald-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-1">Check Your Email</h2>
                        <p className="text-slate-400 text-sm">
                            We sent a 6-digit code to
                        </p>
                        <p className="text-blue-400 font-semibold text-sm mt-1 break-all">{email}</p>
                    </div>

                    <form onSubmit={handleSubmit} className="mt-8">
                        {/* OTP Inputs */}
                        <div className="flex gap-3 justify-center mb-8" onPaste={handlePaste}>
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={(el) => (inputRefs.current[index] = el)}
                                    type="text"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    autoFocus={index === 0}
                                    className="w-12 h-14 text-center text-xl font-bold text-white bg-white/[0.04] border-2 border-white/[0.08] rounded-xl outline-none font-mono caret-blue-400 focus:border-blue-500/60 focus:bg-white/[0.07] focus:shadow-lg focus:shadow-blue-500/10 transition-all duration-300"
                                />
                            ))}
                        </div>

                        <button
                            type="submit"
                            className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl text-white text-sm font-semibold flex items-center justify-center min-h-[48px] hover:from-blue-500 hover:to-indigo-500 hover:shadow-xl hover:shadow-blue-600/25 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300"
                            disabled={loading}
                        >
                            {loading ? <span className="spinner" /> : 'Verify & Continue'}
                        </button>

                        <div className="text-center mt-5">
                            {countdown > 0 ? (
                                <p className="text-xs text-slate-500">
                                    Resend code in <span className="text-amber-400 font-semibold">{countdown}s</span>
                                </p>
                            ) : (
                                <button type="button" onClick={handleResend} disabled={resendLoading}
                                    className="text-blue-400 text-sm font-medium hover:text-blue-300 disabled:text-slate-600 transition-colors">
                                    {resendLoading ? 'Sending...' : 'Resend Code'}
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                <p className="text-center text-sm text-slate-500 mt-6">
                    Wrong email?{' '}
                    <Link to="/register" className="text-blue-400 font-semibold hover:text-blue-300 transition-colors">Go back</Link>
                </p>
            </div>
        </div>
    );
};

export default VerifyOTP;
