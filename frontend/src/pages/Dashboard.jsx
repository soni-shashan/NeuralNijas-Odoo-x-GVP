import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dashboardAPI } from '../services/api';
import toast from 'react-hot-toast';
import {
    HiOutlineTruck, HiOutlineExclamation, HiOutlineChartBar, HiOutlineCube,
    HiOutlineSearch, HiOutlineFilter, HiOutlinePlus, HiOutlineRefresh
} from 'react-icons/hi';

const statusColors = {
    'draft': 'bg-slate-500/15 text-slate-400 border-slate-500/20',
    'dispatched': 'bg-blue-500/15 text-blue-400 border-blue-500/20',
    'completed': 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
    'cancelled': 'bg-red-500/15 text-red-400 border-red-500/20',
};

const vehicleTypeIcons = { truck: '🚛', van: '🚐', bike: '🏍️' };

const Dashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalPages, setTotalPages] = useState(1);
    const [filters, setFilters] = useState({
        search: '', type: '', status: '', region: '', page: 1
    });
    const [showFilters, setShowFilters] = useState(false);

    const fetchData = async () => {
        try {
            const [statsRes, tripsRes] = await Promise.all([
                dashboardAPI.getStats(),
                dashboardAPI.getTrips(filters)
            ]);
            setStats(statsRes.data);
            setTrips(tripsRes.data.trips);
            setTotalPages(tripsRes.data.totalPages);
        } catch (error) {
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, [filters.page, filters.type, filters.status, filters.region]);

    const handleSearch = (e) => {
        e.preventDefault();
        setFilters({ ...filters, page: 1 });
        fetchData();
    };

    const clearFilters = () => {
        setFilters({ search: '', type: '', status: '', region: '', page: 1 });
        setTimeout(fetchData, 50);
    };

    const kpiCards = stats ? [
        { label: 'Active Fleet', value: stats.activeFleet, icon: <HiOutlineTruck />, color: 'from-blue-500 to-cyan-500', bgGlow: 'bg-blue-500/10' },
        { label: 'Maintenance Alerts', value: stats.maintenanceAlerts, icon: <HiOutlineExclamation />, color: 'from-amber-500 to-orange-500', bgGlow: 'bg-amber-500/10' },
        { label: 'Utilization Rate', value: `${stats.utilizationRate}%`, icon: <HiOutlineChartBar />, color: 'from-emerald-500 to-teal-500', bgGlow: 'bg-emerald-500/10' },
        { label: 'Pending Cargo', value: stats.pendingCargo, icon: <HiOutlineCube />, color: 'from-violet-500 to-purple-500', bgGlow: 'bg-violet-500/10' },
    ] : [];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="spinner w-8 h-8 border-3" />
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div className="pl-12 lg:pl-0">
                    <h1 className="text-2xl sm:text-3xl font-bold text-white">Command Center</h1>
                    <p className="text-sm text-slate-400 mt-1">
                        Welcome back, <span className="text-blue-400 font-medium">{user?.fullName}</span>
                    </p>
                </div>
                <div className="flex items-center gap-2.5">
                    <button onClick={fetchData} className="px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-slate-400 hover:text-white hover:bg-white/[0.08] transition-all text-sm flex items-center gap-2">
                        <HiOutlineRefresh /> Refresh
                    </button>
                    {user?.role === 'admin' && (
                        <Link to="/trips" className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium flex items-center gap-2 hover:shadow-lg hover:shadow-blue-600/20 transition-all">
                            <HiOutlinePlus /> New Trip
                        </Link>
                    )}
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
                {kpiCards.map((kpi) => (
                    <div key={kpi.label} className="relative bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 sm:p-5 overflow-hidden group hover:border-white/[0.1] transition-all duration-300">
                        <div className={`absolute top-0 right-0 w-24 h-24 ${kpi.bgGlow} rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${kpi.color} flex items-center justify-center text-white text-xl mb-3 shadow-lg`}>
                            {kpi.icon}
                        </div>
                        <p className="text-2xl sm:text-3xl font-bold text-white">{kpi.value}</p>
                        <p className="text-xs sm:text-sm text-slate-400 mt-1">{kpi.label}</p>
                    </div>
                ))}
            </div>

            {/* Search & Filters Bar */}
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 mb-4">
                <div className="flex flex-col sm:flex-row gap-3">
                    <form onSubmit={handleSearch} className="flex-1 relative">
                        <HiOutlineSearch className="absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search trips, drivers, cargo..."
                            value={filters.search}
                            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                            className="w-full py-2.5 pl-10 pr-4 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-sm outline-none placeholder-slate-600 focus:border-blue-500/50 transition-all"
                        />
                    </form>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`px-4 py-2.5 rounded-xl border text-sm font-medium flex items-center gap-2 transition-all
                ${showFilters ? 'bg-blue-500/15 border-blue-500/30 text-blue-400' : 'bg-white/[0.04] border-white/[0.08] text-slate-400 hover:text-white'}`}
                        >
                            <HiOutlineFilter /> Filters
                        </button>
                        {(filters.type || filters.status || filters.region) && (
                            <button onClick={clearFilters} className="px-3 py-2.5 rounded-xl text-xs text-red-400 hover:bg-red-500/10 transition-all">
                                Clear
                            </button>
                        )}
                    </div>
                </div>

                {/* Filter dropdowns */}
                {showFilters && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3 pt-3 border-t border-white/[0.06] animate-fade-in">
                        <select value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value, page: 1 })}
                            className="py-2.5 px-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white outline-none appearance-none cursor-pointer [&>option]:bg-[#0f172a]">
                            <option value="">All Vehicle Types</option>
                            <option value="truck">🚛 Truck</option>
                            <option value="van">🚐 Van</option>
                            <option value="bike">🏍️ Bike</option>
                        </select>
                        <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
                            className="py-2.5 px-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white outline-none appearance-none cursor-pointer [&>option]:bg-[#0f172a]">
                            <option value="">All Statuses</option>
                            <option value="draft">Draft</option>
                            <option value="dispatched">Dispatched</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                        <select value={filters.region} onChange={(e) => setFilters({ ...filters, region: e.target.value, page: 1 })}
                            className="py-2.5 px-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white outline-none appearance-none cursor-pointer [&>option]:bg-[#0f172a]">
                            <option value="">All Regions</option>
                            <option value="North">North</option>
                            <option value="South">South</option>
                            <option value="West">West</option>
                            <option value="East">East</option>
                        </select>
                    </div>
                )}
            </div>

            {/* Trips Table */}
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px]">
                        <thead>
                            <tr className="border-b border-white/[0.06]">
                                <th className="text-left text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 sm:px-6 py-4">Trip</th>
                                <th className="text-left text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 sm:px-6 py-4">Vehicle</th>
                                <th className="text-left text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 sm:px-6 py-4 hidden sm:table-cell">Route</th>
                                <th className="text-left text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 sm:px-6 py-4">Driver</th>
                                <th className="text-left text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 sm:px-6 py-4 hidden md:table-cell">Cargo</th>
                                <th className="text-left text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 sm:px-6 py-4">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {trips.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-12 text-slate-500 text-sm">No trips found</td>
                                </tr>
                            ) : (
                                trips.map((trip, i) => (
                                    <tr key={trip.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                                        <td className="px-4 sm:px-6 py-3.5">
                                            <span className="text-sm font-semibold text-white">#{trip.tripNumber || i + 1}</span>
                                        </td>
                                        <td className="px-4 sm:px-6 py-3.5">
                                            {trip.vehicle ? (
                                                <div className="flex items-center gap-2">
                                                    <span>{vehicleTypeIcons[trip.vehicle.type] || '🚗'}</span>
                                                    <div>
                                                        <p className="text-sm text-white font-medium">{trip.vehicle.registrationNumber}</p>
                                                        <p className="text-xs text-slate-500">{trip.vehicle.make} {trip.vehicle.model}</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-slate-600 italic">Unassigned</span>
                                            )}
                                        </td>
                                        <td className="px-4 sm:px-6 py-3.5 hidden sm:table-cell">
                                            <p className="text-sm text-slate-300">{trip.origin}</p>
                                            <p className="text-xs text-slate-500">→ {trip.destination}</p>
                                        </td>
                                        <td className="px-4 sm:px-6 py-3.5">
                                            <span className="text-sm text-slate-300">{trip.driverName || '—'}</span>
                                        </td>
                                        <td className="px-4 sm:px-6 py-3.5 hidden md:table-cell">
                                            <span className="text-sm text-slate-400">{trip.cargo || '—'}</span>
                                        </td>
                                        <td className="px-4 sm:px-6 py-3.5">
                                            <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium border ${statusColors[trip.status]}`}>
                                                {trip.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-white/[0.06]">
                        <p className="text-xs text-slate-500">Page {filters.page} of {totalPages}</p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                                disabled={filters.page <= 1}
                                className="px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs text-slate-400 disabled:opacity-30 hover:text-white transition-all"
                            >
                                Prev
                            </button>
                            <button
                                onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                                disabled={filters.page >= totalPages}
                                className="px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs text-slate-400 disabled:opacity-30 hover:text-white transition-all"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
