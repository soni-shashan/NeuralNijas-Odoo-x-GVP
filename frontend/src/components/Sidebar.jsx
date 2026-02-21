import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    HiOutlineTruck, HiOutlineViewGrid, HiOutlineClipboardList,
    HiOutlineCog, HiOutlineChartBar, HiOutlineCurrencyDollar,
    HiOutlineLogout, HiOutlineMenu, HiOutlineX, HiOutlineChartPie
} from 'react-icons/hi';
import { FiTool } from 'react-icons/fi';

const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: <HiOutlineViewGrid />, roles: ['admin', 'dispatcher'] },
    { to: '/vehicles', label: 'Vehicle Registry', icon: <HiOutlineTruck />, roles: ['admin'] },
    { to: '/trips', label: 'Trip Dispatcher', icon: <HiOutlineClipboardList />, roles: ['admin', 'dispatcher'] },
    { to: '/maintenance', label: 'Maintenance', icon: <FiTool />, roles: ['admin'] },
    { to: '/expenses', label: 'Trip & Expense', icon: <HiOutlineCurrencyDollar />, roles: ['admin', 'dispatcher'] },
    { to: '/performance', label: 'Performance', icon: <HiOutlineChartBar />, roles: ['admin'] },
    { to: '/analytics', label: 'Analytics', icon: <HiOutlineChartPie />, roles: ['admin'] },
];

const Sidebar = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const confirmLogout = () => {
        logout();
        navigate('/login');
        setShowLogoutModal(false);
    };

    const filteredNav = navItems.filter(item => item.roles.includes(user?.role));

    const linkClass = ({ isActive }) =>
        `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
     ${isActive
            ? 'bg-blue-500/15 text-blue-400 shadow-sm shadow-blue-500/5'
            : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
        }`;

    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="px-5 py-5 flex items-center gap-3 border-b border-white/[0.06]">
                <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white text-lg flex-shrink-0">
                    <HiOutlineTruck />
                </div>
                {!collapsed && <span className="text-lg font-bold text-white tracking-tight">FleetFlow</span>}
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                {filteredNav.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        onClick={() => setMobileOpen(false)}
                        className={linkClass}
                    >
                        <span className="text-lg flex-shrink-0">{item.icon}</span>
                        {!collapsed && <span>{item.label}</span>}
                    </NavLink>
                ))}
            </nav>

            {/* User + Logout */}
            <div className="px-3 py-4 border-t border-white/[0.06] space-y-2">
                {!collapsed && (
                    <div className="px-4 py-2">
                        <p className="text-sm font-medium text-white truncate">{user?.fullName}</p>
                        <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
                    </div>
                )}
                <button
                    onClick={() => setShowLogoutModal(true)}
                    className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all duration-200"
                >
                    <HiOutlineLogout className="text-lg" />
                    {!collapsed && 'Logout'}
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* Mobile hamburger */}
            <button
                onClick={() => setMobileOpen(true)}
                className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 bg-white/[0.06] border border-white/[0.1] rounded-xl flex items-center justify-center text-white backdrop-blur-lg"
            >
                <HiOutlineMenu className="text-xl" />
            </button>

            {/* Mobile overlay */}
            {mobileOpen && (
                <div className="lg:hidden fixed inset-0 z-50">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
                    <div className="absolute left-0 top-0 h-full w-[260px] bg-[#0a0f1e] border-r border-white/[0.06] animate-fade-in">
                        <button
                            onClick={() => setMobileOpen(false)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-white"
                        >
                            <HiOutlineX className="text-xl" />
                        </button>
                        <SidebarContent />
                    </div>
                </div>
            )}

            {/* Desktop sidebar */}
            <aside className={`hidden lg:flex flex-col bg-[#0a0f1e] border-r border-white/[0.06] h-screen sticky top-0 transition-all duration-300
        ${collapsed ? 'w-[72px]' : 'w-[240px]'}`}>

                {/* Collapse toggle */}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="absolute -right-3 top-7 w-6 h-6 bg-[#1e293b] border border-white/[0.1] rounded-full flex items-center justify-center text-slate-400 hover:text-white text-xs z-10 transition-colors"
                >
                    {collapsed ? '→' : '←'}
                </button>

                <SidebarContent />
            </aside>
            {/* Logout Confirmation Modal */}
            {showLogoutModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowLogoutModal(false)} />
                    <div className="relative bg-[#0f172a] border border-white/[0.08] rounded-2xl p-6 w-[90%] max-w-sm shadow-2xl animate-fade-in">
                        <div className="text-center">
                            <div className="w-12 h-12 mx-auto mb-4 bg-red-500/15 rounded-full flex items-center justify-center">
                                <HiOutlineLogout className="text-2xl text-red-400" />
                            </div>
                            <h3 className="text-lg font-bold text-white mb-1">Confirm Logout</h3>
                            <p className="text-sm text-slate-400 mb-6">Are you sure you want to log out of FleetFlow?</p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowLogoutModal(false)}
                                    className="flex-1 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.08] text-sm font-medium text-slate-300 hover:bg-white/[0.1] transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmLogout}
                                    className="flex-1 py-2.5 rounded-xl bg-red-600 text-sm font-medium text-white hover:bg-red-500 transition-all"
                                >
                                    Logout
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Sidebar;
