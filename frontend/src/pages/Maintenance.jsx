import { useState, useEffect } from 'react';
import { maintenanceAPI } from '../services/api';
import toast from 'react-hot-toast';
import {
    HiOutlinePlus, HiOutlineSearch, HiOutlineFilter, HiOutlineX,
    HiOutlineRefresh, HiOutlineTrash, HiOutlineCheckCircle
} from 'react-icons/hi';
import { FiTool } from 'react-icons/fi';

const issueTypes = [
    { value: 'engine', label: 'Engine Issue', emoji: '🔧' },
    { value: 'brakes', label: 'Brakes', emoji: '🛑' },
    { value: 'tires', label: 'Tires', emoji: '🛞' },
    { value: 'electrical', label: 'Electrical', emoji: '⚡' },
    { value: 'transmission', label: 'Transmission', emoji: '⚙️' },
    { value: 'oil-change', label: 'Oil Change', emoji: '🛢️' },
    { value: 'inspection', label: 'Inspection', emoji: '🔍' },
    { value: 'bodywork', label: 'Bodywork', emoji: '🚗' },
    { value: 'other', label: 'Other', emoji: '📋' },
];

const statusStyles = {
    'new': 'bg-amber-500/15 text-amber-400 border-amber-500/20',
    'in-progress': 'bg-blue-500/15 text-blue-400 border-blue-500/20',
    'completed': 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
};

const statusActions = {
    'new': [{ to: 'in-progress', label: 'Start Work', color: 'bg-blue-600 hover:bg-blue-500' }],
    'in-progress': [{ to: 'completed', label: 'Complete', color: 'bg-emerald-600 hover:bg-emerald-500' }],
    'completed': [],
};

const emptyForm = { vehicleId: '', issueType: '', description: '', cost: '', serviceDate: '', notes: '' };

const Maintenance = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalPages, setTotalPages] = useState(1);
    const [filters, setFilters] = useState({ search: '', status: '', issueType: '', page: 1 });
    const [showFilters, setShowFilters] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);
    const [vehicles, setVehicles] = useState([]);
    const [deleteTarget, setDeleteTarget] = useState(null);

    const fetchLogs = async () => {
        try {
            const res = await maintenanceAPI.getAll(filters);
            setLogs(res.data.logs);
            setTotalPages(res.data.totalPages);
        } catch (error) {
            toast.error('Failed to load service logs');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchLogs(); }, [filters.page, filters.status, filters.issueType]);

    const openNewForm = async () => {
        setForm({ ...emptyForm, serviceDate: new Date().toISOString().split('T')[0] });
        try {
            const res = await maintenanceAPI.getVehicles();
            setVehicles(res.data.vehicles);
            setShowForm(true);
        } catch (error) {
            toast.error('Failed to load vehicles');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await maintenanceAPI.create(form);
            toast.success('Service log created — vehicle moved to "In Shop"');
            setShowForm(false);
            fetchLogs();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create log');
        } finally {
            setSaving(false);
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            const res = await maintenanceAPI.updateStatus(id, newStatus);
            toast.success(res.data.message);
            fetchLogs();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            await maintenanceAPI.delete(deleteTarget);
            toast.success('Service log deleted');
            setDeleteTarget(null);
            fetchLogs();
        } catch (error) {
            toast.error('Failed to delete');
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setFilters({ ...filters, page: 1 });
        fetchLogs();
    };

    const getIssueInfo = (type) => issueTypes.find(i => i.value === type) || { emoji: '📋', label: type };
    const inputClass = "w-full py-2.5 px-3.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-sm outline-none placeholder-slate-600 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all";

    if (loading) {
        return <div className="flex items-center justify-center h-screen"><div className="spinner w-8 h-8 border-3" /></div>;
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div className="pl-12 lg:pl-0">
                    <h1 className="text-2xl sm:text-3xl font-bold text-white">Maintenance & Service</h1>
                    <p className="text-sm text-slate-400 mt-1">Track vehicle health & repairs</p>
                </div>
                <div className="flex items-center gap-2.5">
                    <button onClick={fetchLogs} className="px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-slate-400 hover:text-white hover:bg-white/[0.08] transition-all text-sm flex items-center gap-2">
                        <HiOutlineRefresh /> Refresh
                    </button>
                    <button onClick={openNewForm} className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 text-white text-sm font-medium flex items-center gap-2 hover:shadow-lg hover:shadow-amber-600/20 transition-all">
                        <HiOutlinePlus /> Create New Service
                    </button>
                </div>
            </div>

            {/* Search & Filters */}
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 mb-4">
                <div className="flex flex-col sm:flex-row gap-3">
                    <form onSubmit={handleSearch} className="flex-1 relative">
                        <HiOutlineSearch className="absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-500" />
                        <input type="text" placeholder="Search by description..."
                            value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                            className="w-full py-2.5 pl-10 pr-4 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-sm outline-none placeholder-slate-600 focus:border-blue-500/50 transition-all" />
                    </form>
                    <button onClick={() => setShowFilters(!showFilters)}
                        className={`px-4 py-2.5 rounded-xl border text-sm font-medium flex items-center gap-2 transition-all
              ${showFilters ? 'bg-blue-500/15 border-blue-500/30 text-blue-400' : 'bg-white/[0.04] border-white/[0.08] text-slate-400 hover:text-white'}`}>
                        <HiOutlineFilter /> Filters
                    </button>
                </div>
                {showFilters && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 pt-3 border-t border-white/[0.06] animate-fade-in">
                        <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
                            className="py-2.5 px-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white outline-none [&>option]:bg-[#0f172a]">
                            <option value="">All Statuses</option>
                            <option value="new">New</option>
                            <option value="in-progress">In Progress</option>
                            <option value="completed">Completed</option>
                        </select>
                        <select value={filters.issueType} onChange={(e) => setFilters({ ...filters, issueType: e.target.value, page: 1 })}
                            className="py-2.5 px-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white outline-none [&>option]:bg-[#0f172a]">
                            <option value="">All Issue Types</option>
                            {issueTypes.map(t => <option key={t.value} value={t.value}>{t.emoji} {t.label}</option>)}
                        </select>
                    </div>
                )}
            </div>

            {/* Service Logs Table */}
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px]">
                        <thead>
                            <tr className="border-b border-white/[0.06]">
                                <th className="text-left text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 sm:px-6 py-4">Log ID</th>
                                <th className="text-left text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 sm:px-6 py-4">Vehicle</th>
                                <th className="text-left text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 sm:px-6 py-4">Issue/Service</th>
                                <th className="text-left text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 sm:px-6 py-4 hidden sm:table-cell">Date</th>
                                <th className="text-left text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 sm:px-6 py-4 hidden md:table-cell">Cost</th>
                                <th className="text-left text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 sm:px-6 py-4">Status</th>
                                <th className="text-left text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 sm:px-6 py-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.length === 0 ? (
                                <tr><td colSpan={7} className="text-center py-12 text-slate-500 text-sm">No service logs found</td></tr>
                            ) : (
                                logs.map((log) => {
                                    const issue = getIssueInfo(log.issueType);
                                    return (
                                        <tr key={log.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                                            <td className="px-4 sm:px-6 py-3.5">
                                                <span className="text-sm font-semibold text-white">#{log.logNumber}</span>
                                            </td>
                                            <td className="px-4 sm:px-6 py-3.5">
                                                {log.vehicle ? (
                                                    <div>
                                                        <p className="text-sm text-white font-medium">{log.vehicle.registrationNumber}</p>
                                                        <p className="text-xs text-slate-500">{log.vehicle.make} {log.vehicle.model}</p>
                                                    </div>
                                                ) : <span className="text-xs text-slate-600 italic">Unknown</span>}
                                            </td>
                                            <td className="px-4 sm:px-6 py-3.5">
                                                <div className="flex items-center gap-2">
                                                    <span>{issue.emoji}</span>
                                                    <div>
                                                        <p className="text-sm text-slate-300">{issue.label}</p>
                                                        <p className="text-xs text-slate-500 truncate max-w-[200px]">{log.description}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 sm:px-6 py-3.5 hidden sm:table-cell text-sm text-slate-300">
                                                {log.serviceDate ? new Date(log.serviceDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '—'}
                                            </td>
                                            <td className="px-4 sm:px-6 py-3.5 hidden md:table-cell text-sm text-slate-300">
                                                {log.cost ? `₹${log.cost.toLocaleString()}` : '—'}
                                            </td>
                                            <td className="px-4 sm:px-6 py-3.5">
                                                <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium border capitalize ${statusStyles[log.status]}`}>
                                                    {log.status === 'in-progress' ? 'In Progress' : log.status}
                                                </span>
                                            </td>
                                            <td className="px-4 sm:px-6 py-3.5">
                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                    {statusActions[log.status]?.map((action) => (
                                                        <button key={action.to} onClick={() => handleStatusChange(log.id, action.to)}
                                                            className={`px-2.5 py-1 rounded-lg text-xs font-medium text-white transition-all ${action.color}`}>
                                                            {action.label}
                                                        </button>
                                                    ))}
                                                    {log.status !== 'completed' && (
                                                        <button onClick={() => setDeleteTarget(log.id)} title="Delete"
                                                            className="w-7 h-7 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all">
                                                            <HiOutlineTrash className="text-xs" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
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

            {/* New Service Form Modal */}
            {showForm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowForm(false)} />
                    <div className="relative bg-[#0f172a] border border-white/[0.08] rounded-2xl p-6 sm:p-8 w-full max-w-lg shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto">
                        <button onClick={() => setShowForm(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
                            <HiOutlineX className="text-xl" />
                        </button>

                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-amber-500/15 rounded-xl flex items-center justify-center">
                                <FiTool className="text-amber-400 text-lg" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">New Service Log</h3>
                                <p className="text-xs text-slate-400">Vehicle will be moved to "In Shop" automatically</p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="text-xs font-medium text-slate-400 mb-1.5 block uppercase tracking-wider">Vehicle <span className="text-red-400">*</span></label>
                                <select value={form.vehicleId} onChange={(e) => setForm({ ...form, vehicleId: e.target.value })} required
                                    className={inputClass + ' appearance-none cursor-pointer [&>option]:bg-[#0f172a]'}>
                                    <option value="">Select a vehicle...</option>
                                    {vehicles.map((v) => (
                                        <option key={v.id} value={v.id}>
                                            {v.registrationNumber} — {v.make} {v.model} ({v.status})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="text-xs font-medium text-slate-400 mb-1.5 block uppercase tracking-wider">Issue/Service <span className="text-red-400">*</span></label>
                                <select value={form.issueType} onChange={(e) => setForm({ ...form, issueType: e.target.value })} required
                                    className={inputClass + ' appearance-none cursor-pointer [&>option]:bg-[#0f172a]'}>
                                    <option value="">Select issue type...</option>
                                    {issueTypes.map(t => <option key={t.value} value={t.value}>{t.emoji} {t.label}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="text-xs font-medium text-slate-400 mb-1.5 block uppercase tracking-wider">Description <span className="text-red-400">*</span></label>
                                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    placeholder="Describe the issue or service needed..." rows={3} required className={inputClass + ' resize-none'} />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-medium text-slate-400 mb-1.5 block uppercase tracking-wider">Cost (₹)</label>
                                    <input type="number" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })}
                                        placeholder="e.g. 10000" min="0" className={inputClass} />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-slate-400 mb-1.5 block uppercase tracking-wider">Service Date <span className="text-red-400">*</span></label>
                                    <input type="date" value={form.serviceDate} onChange={(e) => setForm({ ...form, serviceDate: e.target.value })}
                                        required className={inputClass} />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-medium text-slate-400 mb-1.5 block uppercase tracking-wider">Notes</label>
                                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
                                    placeholder="Additional notes..." rows={2} className={inputClass + ' resize-none'} />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowForm(false)}
                                    className="flex-1 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.08] text-sm font-medium text-slate-300 hover:bg-white/[0.1] transition-all">Cancel</button>
                                <button type="submit" disabled={saving}
                                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 text-sm font-medium text-white hover:shadow-lg hover:shadow-amber-600/20 disabled:opacity-60 transition-all flex items-center justify-center gap-2">
                                    {saving ? <span className="spinner w-5 h-5" /> : <><FiTool /> Create</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {deleteTarget && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDeleteTarget(null)} />
                    <div className="relative bg-[#0f172a] border border-white/[0.08] rounded-2xl p-6 w-[90%] max-w-sm shadow-2xl animate-fade-in">
                        <div className="text-center">
                            <div className="w-12 h-12 mx-auto mb-4 bg-red-500/15 rounded-full flex items-center justify-center">
                                <HiOutlineTrash className="text-2xl text-red-400" />
                            </div>
                            <h3 className="text-lg font-bold text-white mb-1">Delete Service Log</h3>
                            <p className="text-sm text-slate-400 mb-6">Vehicle will be released if no other open logs exist.</p>
                            <div className="flex gap-3">
                                <button onClick={() => setDeleteTarget(null)}
                                    className="flex-1 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.08] text-sm font-medium text-slate-300 hover:bg-white/[0.1] transition-all">Cancel</button>
                                <button onClick={handleDelete}
                                    className="flex-1 py-2.5 rounded-xl bg-red-600 text-sm font-medium text-white hover:bg-red-500 transition-all">Delete</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Maintenance;
