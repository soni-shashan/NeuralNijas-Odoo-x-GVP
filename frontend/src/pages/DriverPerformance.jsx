import { useState, useEffect } from 'react';
import { driverAPI } from '../services/api';
import toast from 'react-hot-toast';
import {
    HiOutlineSearch, HiOutlineFilter, HiOutlineRefresh, HiOutlinePencil,
    HiOutlineX, HiOutlineShieldCheck, HiOutlineExclamation
} from 'react-icons/hi';

const dutyStyles = {
    'on-duty': 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
    'off-duty': 'bg-slate-500/15 text-slate-400 border-slate-500/20',
    'suspended': 'bg-red-500/15 text-red-400 border-red-500/20',
};

const dutyOptions = [
    { value: 'on-duty', label: 'On Duty' },
    { value: 'off-duty', label: 'Off Duty' },
    { value: 'suspended', label: 'Suspended' },
];

const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-amber-400';
    return 'text-red-400';
};

const DriverPerformance = () => {
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalPages, setTotalPages] = useState(1);
    const [filters, setFilters] = useState({ search: '', dutyStatus: '', page: 1 });
    const [showFilters, setShowFilters] = useState(false);

    // Edit modal
    const [editDriver, setEditDriver] = useState(null);
    const [editForm, setEditForm] = useState({ licenseNumber: '', licenseExpiry: '', safetyScore: '', complaints: '' });
    const [saving, setSaving] = useState(false);

    const fetchDrivers = async () => {
        try {
            const res = await driverAPI.getAll(filters);
            setDrivers(res.data.drivers);
            setTotalPages(res.data.totalPages);
        } catch (error) {
            toast.error('Failed to load drivers');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchDrivers(); }, [filters.page, filters.dutyStatus]);

    const handleSearch = (e) => {
        e.preventDefault();
        setFilters({ ...filters, page: 1 });
        fetchDrivers();
    };

    const handleDutyChange = async (driverId, newStatus) => {
        try {
            await driverAPI.updateDutyStatus(driverId, newStatus);
            toast.success(`Driver set to ${newStatus}`);
            fetchDrivers();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const openEditModal = (driver) => {
        setEditDriver(driver);
        setEditForm({
            licenseNumber: driver.licenseNumber || '',
            licenseExpiry: driver.licenseExpiry || '',
            safetyScore: driver.safetyScore ?? 100,
            complaints: driver.complaints ?? 0
        });
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await driverAPI.updateProfile(editDriver.id, editForm);
            toast.success('Driver profile updated');
            setEditDriver(null);
            fetchDrivers();
        } catch (error) {
            toast.error('Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const inputClass = "w-full py-2.5 px-3.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-sm outline-none placeholder-slate-600 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all";

    if (loading) {
        return <div className="flex items-center justify-center h-screen"><div className="spinner w-8 h-8 border-3" /></div>;
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div className="pl-12 lg:pl-0">
                    <h1 className="text-2xl sm:text-3xl font-bold text-white">Driver Performance</h1>
                    <p className="text-sm text-slate-400 mt-1">Compliance, safety scores & duty status</p>
                </div>
                <button onClick={fetchDrivers} className="px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-slate-400 hover:text-white hover:bg-white/[0.08] transition-all text-sm flex items-center gap-2 self-start">
                    <HiOutlineRefresh /> Refresh
                </button>
            </div>

            {/* Search & Filters */}
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 mb-4">
                <div className="flex flex-col sm:flex-row gap-3">
                    <form onSubmit={handleSearch} className="flex-1 relative">
                        <HiOutlineSearch className="absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-500" />
                        <input type="text" placeholder="Search by name, email, license..."
                            value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                            className="w-full py-2.5 pl-10 pr-4 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-sm outline-none placeholder-slate-600 focus:border-blue-500/50 transition-all" />
                    </form>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setShowFilters(!showFilters)}
                            className={`px-4 py-2.5 rounded-xl border text-sm font-medium flex items-center gap-2 transition-all
                  ${showFilters ? 'bg-blue-500/15 border-blue-500/30 text-blue-400' : 'bg-white/[0.04] border-white/[0.08] text-slate-400 hover:text-white'}`}>
                            <HiOutlineFilter /> Filters
                        </button>
                        {filters.dutyStatus && (
                            <button onClick={() => { setFilters({ search: '', dutyStatus: '', page: 1 }); setTimeout(fetchDrivers, 50); }} className="px-3 py-2.5 rounded-xl text-xs text-red-400 hover:bg-red-500/10 transition-all">
                                Clear
                            </button>
                        )}
                    </div>
                </div>
                {showFilters && (
                    <div className="mt-3 pt-3 border-t border-white/[0.06] animate-fade-in">
                        <select value={filters.dutyStatus} onChange={(e) => setFilters({ ...filters, dutyStatus: e.target.value, page: 1 })}
                            className="py-2.5 px-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white outline-none [&>option]:bg-[#0f172a] w-full sm:w-auto">
                            <option value="">All Statuses</option>
                            {dutyOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                    </div>
                )}
            </div>

            {/* Driver Table */}
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px]">
                        <thead>
                            <tr className="border-b border-white/[0.06]">
                                <th className="text-left text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 sm:px-6 py-4">Name</th>
                                <th className="text-left text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 sm:px-6 py-4 hidden sm:table-cell">License #</th>
                                <th className="text-left text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 sm:px-6 py-4 hidden md:table-cell">Expiry</th>
                                <th className="text-left text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 sm:px-6 py-4">Completion</th>
                                <th className="text-left text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 sm:px-6 py-4">Safety</th>
                                <th className="text-left text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 sm:px-6 py-4 hidden lg:table-cell">Complaints</th>
                                <th className="text-left text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 sm:px-6 py-4">Duty</th>
                                <th className="text-left text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 sm:px-6 py-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {drivers.length === 0 ? (
                                <tr><td colSpan={8} className="text-center py-12 text-slate-500 text-sm">No drivers found</td></tr>
                            ) : (
                                drivers.map((d) => (
                                    <tr key={d.id} className={`border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors ${d.isLicenseExpired ? 'bg-red-500/[0.03]' : ''}`}>
                                        <td className="px-4 sm:px-6 py-3.5">
                                            <div>
                                                <p className="text-sm font-semibold text-white">{d.fullName}</p>
                                                <p className="text-xs text-slate-500">{d.email}</p>
                                            </div>
                                        </td>
                                        <td className="px-4 sm:px-6 py-3.5 hidden sm:table-cell">
                                            <span className="text-sm text-slate-300 font-mono">{d.licenseNumber || '—'}</span>
                                        </td>
                                        <td className="px-4 sm:px-6 py-3.5 hidden md:table-cell">
                                            {d.licenseExpiry ? (
                                                <div className="flex items-center gap-1.5">
                                                    <span className={`text-sm ${d.isLicenseExpired ? 'text-red-400 font-semibold' : 'text-slate-300'}`}>
                                                        {new Date(d.licenseExpiry).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })}
                                                    </span>
                                                    {d.isLicenseExpired && (
                                                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30">EXPIRED</span>
                                                    )}
                                                </div>
                                            ) : <span className="text-xs text-slate-600">Not set</span>}
                                        </td>
                                        <td className="px-4 sm:px-6 py-3.5">
                                            <div>
                                                <p className="text-sm font-semibold text-white">{d.completionRate}%</p>
                                                <p className="text-xs text-slate-500">{d.completedTrips}/{d.totalTrips} trips</p>
                                            </div>
                                        </td>
                                        <td className="px-4 sm:px-6 py-3.5">
                                            <div className="flex items-center gap-1.5">
                                                <HiOutlineShieldCheck className={`text-lg ${getScoreColor(d.safetyScore ?? 100)}`} />
                                                <span className={`text-sm font-bold ${getScoreColor(d.safetyScore ?? 100)}`}>{d.safetyScore ?? 100}%</span>
                                            </div>
                                        </td>
                                        <td className="px-4 sm:px-6 py-3.5 hidden lg:table-cell">
                                            <span className={`text-sm font-medium ${(d.complaints || 0) > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
                                                {d.complaints || 0}
                                            </span>
                                        </td>
                                        <td className="px-4 sm:px-6 py-3.5">
                                            <select value={d.dutyStatus || 'off-duty'} onChange={(e) => handleDutyChange(d.id, e.target.value)}
                                                className={`px-2 py-1 rounded-lg text-xs font-medium border outline-none cursor-pointer appearance-none ${dutyStyles[d.dutyStatus || 'off-duty']} [&>option]:bg-[#0f172a] [&>option]:text-white`}>
                                                {dutyOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                            </select>
                                        </td>
                                        <td className="px-4 sm:px-6 py-3.5">
                                            <button onClick={() => openEditModal(d)} title="Edit Profile"
                                                className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 hover:border-blue-500/20 transition-all">
                                                <HiOutlinePencil className="text-sm" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-white/[0.06]">
                        <p className="text-xs text-slate-500">Page {filters.page} of {totalPages}</p>
                        <div className="flex gap-2">
                            <button onClick={() => setFilters({ ...filters, page: filters.page - 1 })} disabled={filters.page <= 1}
                                className="px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs text-slate-400 disabled:opacity-30 hover:text-white transition-all">Prev</button>
                            <button onClick={() => setFilters({ ...filters, page: filters.page + 1 })} disabled={filters.page >= totalPages}
                                className="px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs text-slate-400 disabled:opacity-30 hover:text-white transition-all">Next</button>
                        </div>
                    </div>
                )}
            </div>

            {/* Edit Driver Profile Modal */}
            {editDriver && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setEditDriver(null)} />
                    <div className="relative bg-[#0f172a] border border-white/[0.08] rounded-2xl p-6 sm:p-8 w-full max-w-md shadow-2xl animate-fade-in">
                        <button onClick={() => setEditDriver(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
                            <HiOutlineX className="text-xl" />
                        </button>

                        <h3 className="text-lg font-bold text-white mb-1">{editDriver.fullName}</h3>
                        <p className="text-sm text-slate-400 mb-6">Update compliance & safety info</p>

                        <form onSubmit={handleEditSubmit} className="space-y-4">
                            <div>
                                <label className="text-xs font-medium text-slate-400 mb-1.5 block uppercase tracking-wider">License Number</label>
                                <input type="text" value={editForm.licenseNumber} onChange={(e) => setEditForm({ ...editForm, licenseNumber: e.target.value })}
                                    placeholder="e.g. DL-0420110012345" className={inputClass} />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-400 mb-1.5 block uppercase tracking-wider">License Expiry</label>
                                <input type="date" value={editForm.licenseExpiry} onChange={(e) => setEditForm({ ...editForm, licenseExpiry: e.target.value })}
                                    className={inputClass} />
                                {editForm.licenseExpiry && new Date(editForm.licenseExpiry) < new Date() && (
                                    <p className="mt-1.5 text-xs text-red-400 font-medium flex items-center gap-1">
                                        <HiOutlineExclamation /> Expired — driver will be blocked from new trip assignments
                                    </p>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-medium text-slate-400 mb-1.5 block uppercase tracking-wider">Safety Score (%)</label>
                                    <input type="number" min="0" max="100" value={editForm.safetyScore} onChange={(e) => setEditForm({ ...editForm, safetyScore: e.target.value })}
                                        className={inputClass} />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-slate-400 mb-1.5 block uppercase tracking-wider">Complaints</label>
                                    <input type="number" min="0" value={editForm.complaints} onChange={(e) => setEditForm({ ...editForm, complaints: e.target.value })}
                                        className={inputClass} />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setEditDriver(null)}
                                    className="flex-1 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.08] text-sm font-medium text-slate-300 hover:bg-white/[0.1] transition-all">Cancel</button>
                                <button type="submit" disabled={saving}
                                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-sm font-medium text-white hover:shadow-lg hover:shadow-blue-600/20 disabled:opacity-60 transition-all flex items-center justify-center">
                                    {saving ? <span className="spinner w-5 h-5" /> : 'Save'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DriverPerformance;
