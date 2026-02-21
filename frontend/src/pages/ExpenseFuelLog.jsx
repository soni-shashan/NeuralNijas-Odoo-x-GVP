import { useState, useEffect } from 'react';
import { expenseAPI } from '../services/api';
import toast from 'react-hot-toast';
import {
    HiOutlinePlus, HiOutlineSearch, HiOutlineFilter, HiOutlineX,
    HiOutlineRefresh, HiOutlineTrash, HiOutlineCurrencyRupee
} from 'react-icons/hi';
import { LuFuel, LuRoute, LuWrench, LuSquareParking, LuClipboardList } from 'react-icons/lu';

const typeStyles = {
    fuel: { icon: <LuFuel className="text-sm" />, label: 'Fuel', color: 'bg-amber-500/15 text-amber-400 border-amber-500/20' },
    toll: { icon: <LuRoute className="text-sm" />, label: 'Toll', color: 'bg-blue-500/15 text-blue-400 border-blue-500/20' },
    repair: { icon: <LuWrench className="text-sm" />, label: 'Repair', color: 'bg-red-500/15 text-red-400 border-red-500/20' },
    parking: { icon: <LuSquareParking className="text-sm" />, label: 'Parking', color: 'bg-violet-500/15 text-violet-400 border-violet-500/20' },
    misc: { icon: <LuClipboardList className="text-sm" />, label: 'Misc', color: 'bg-slate-500/15 text-slate-400 border-slate-500/20' },
};

const emptyForm = {
    tripId: '', vehicleId: '', driverName: '', type: 'fuel',
    fuelLiters: '', fuelCost: '', miscExpense: '', description: '',
    expenseDate: '', distance: ''
};

const ExpenseFuelLog = () => {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalPages, setTotalPages] = useState(1);
    const [filters, setFilters] = useState({ search: '', type: '', page: 1 });
    const [showFilters, setShowFilters] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);
    const [completedTrips, setCompletedTrips] = useState([]);
    const [deleteTarget, setDeleteTarget] = useState(null);

    // Cost summary
    const [costSummary, setCostSummary] = useState([]);
    const [showSummary, setShowSummary] = useState(false);

    const fetchExpenses = async () => {
        try {
            const res = await expenseAPI.getAll(filters);
            setExpenses(res.data.expenses);
            setTotalPages(res.data.totalPages);
        } catch (error) {
            toast.error('Failed to load expenses');
        } finally {
            setLoading(false);
        }
    };

    const fetchCostSummary = async () => {
        try {
            const res = await expenseAPI.getCostSummary();
            setCostSummary(res.data.summary);
        } catch (error) {
            toast.error('Failed to load cost summary');
        }
    };

    useEffect(() => { fetchExpenses(); }, [filters.page, filters.type]);

    const openNewForm = async () => {
        setForm({ ...emptyForm, expenseDate: new Date().toISOString().split('T')[0] });
        try {
            const res = await expenseAPI.getCompletedTrips();
            setCompletedTrips(res.data.trips);
            setShowForm(true);
        } catch (error) {
            toast.error('Failed to load trips');
        }
    };

    const handleTripSelect = (tripId) => {
        const trip = completedTrips.find(t => t.id === tripId);
        if (trip) {
            setForm({ ...form, tripId, vehicleId: trip.vehicleId, driverName: trip.driverName || '' });
        } else {
            setForm({ ...form, tripId: '', vehicleId: '', driverName: '' });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await expenseAPI.create(form);
            toast.success('Expense recorded');
            setShowForm(false);
            fetchExpenses();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to record expense');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            await expenseAPI.delete(deleteTarget);
            toast.success('Expense deleted');
            setDeleteTarget(null);
            fetchExpenses();
        } catch (error) {
            toast.error('Failed to delete');
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setFilters({ ...filters, page: 1 });
        fetchExpenses();
    };

    const toggleSummary = () => {
        if (!showSummary) fetchCostSummary();
        setShowSummary(!showSummary);
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
                    <h1 className="text-2xl sm:text-3xl font-bold text-white">Expense & Fuel Log</h1>
                    <p className="text-sm text-slate-400 mt-1">Track fuel, tolls & operational costs</p>
                </div>
                <div className="flex items-center gap-2.5">
                    <button onClick={toggleSummary}
                        className={`px-3 py-2 rounded-xl border text-sm flex items-center gap-2 transition-all
              ${showSummary ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400' : 'bg-white/[0.04] border-white/[0.08] text-slate-400 hover:text-white'}`}>
                        <HiOutlineCurrencyRupee /> Cost Summary
                    </button>
                    <button onClick={fetchExpenses} className="px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-slate-400 hover:text-white hover:bg-white/[0.08] transition-all text-sm flex items-center gap-2">
                        <HiOutlineRefresh /> Refresh
                    </button>
                    <button onClick={openNewForm} className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-medium flex items-center gap-2 hover:shadow-lg hover:shadow-emerald-600/20 transition-all">
                        <HiOutlinePlus /> Add Expense
                    </button>
                </div>
            </div>

            {/* Cost Summary Cards */}
            {showSummary && (
                <div className="mb-6 animate-fade-in">
                    <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Total Operational Cost per Vehicle (Fuel + Maintenance)</h2>
                    {costSummary.length === 0 ? (
                        <p className="text-sm text-slate-500 bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 text-center">No expense data yet</p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {costSummary.map((s) => (
                                <div key={s.vehicleId} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 hover:border-white/[0.1] transition-all group">
                                    <div className="flex items-center justify-between mb-3">
                                        <div>
                                            <p className="text-sm font-bold text-white">{s.vehicle?.registrationNumber}</p>
                                            <p className="text-xs text-slate-500">{s.vehicle?.make} {s.vehicle?.model}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-bold text-emerald-400">₹{s.totalOperationalCost.toLocaleString()}</p>
                                            <p className="text-[10px] text-slate-500 uppercase">Total Cost</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/[0.06]">
                                        <div>
                                            <p className="text-xs text-slate-500">Fuel</p>
                                            <p className="text-sm font-medium text-amber-400">₹{s.totalFuelCost.toLocaleString()}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500">Misc</p>
                                            <p className="text-sm font-medium text-blue-400">₹{s.totalMiscExpense.toLocaleString()}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500">Maint.</p>
                                            <p className="text-sm font-medium text-red-400">₹{s.totalMaintenanceCost.toLocaleString()}</p>
                                        </div>
                                    </div>
                                    {s.totalLiters > 0 && (
                                        <p className="text-xs text-slate-500 mt-2 flex items-center gap-1"><LuFuel className="text-amber-400" /> {s.totalLiters.toFixed(1)}L • <LuRoute className="text-blue-400" /> {s.totalDistance.toLocaleString()} km</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Search & Filters */}
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 mb-4">
                <div className="flex flex-col sm:flex-row gap-3">
                    <form onSubmit={handleSearch} className="flex-1 relative">
                        <HiOutlineSearch className="absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-500" />
                        <input type="text" placeholder="Search by driver, description..."
                            value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                            className="w-full py-2.5 pl-10 pr-4 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-sm outline-none placeholder-slate-600 focus:border-blue-500/50 transition-all" />
                    </form>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setShowFilters(!showFilters)}
                            className={`px-4 py-2.5 rounded-xl border text-sm font-medium flex items-center gap-2 transition-all
                  ${showFilters ? 'bg-blue-500/15 border-blue-500/30 text-blue-400' : 'bg-white/[0.04] border-white/[0.08] text-slate-400 hover:text-white'}`}>
                            <HiOutlineFilter /> Filters
                        </button>
                        {filters.type && (
                            <button onClick={() => { setFilters({ search: '', type: '', page: 1 }); setTimeout(fetchExpenses, 50); }} className="px-3 py-2.5 rounded-xl text-xs text-red-400 hover:bg-red-500/10 transition-all">
                                Clear
                            </button>
                        )}
                    </div>
                </div>
                {showFilters && (
                    <div className="mt-3 pt-3 border-t border-white/[0.06] animate-fade-in">
                        <select value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value, page: 1 })}
                            className="py-2.5 px-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white outline-none [&>option]:bg-[#0f172a] w-full sm:w-auto">
                            <option value="">All Types</option>
                            <option value="fuel">Fuel</option>
                            <option value="toll">Toll</option>
                            <option value="repair">Repair</option>
                            <option value="parking">Parking</option>
                            <option value="misc">Misc</option>
                        </select>
                    </div>
                )}
            </div>

            {/* Expense Table */}
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px]">
                        <thead>
                            <tr className="border-b border-white/[0.06]">
                                <th className="text-left text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 sm:px-6 py-4">Trip ID</th>
                                <th className="text-left text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 sm:px-6 py-4">Vehicle</th>
                                <th className="text-left text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 sm:px-6 py-4 hidden sm:table-cell">Driver</th>
                                <th className="text-left text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 sm:px-6 py-4 hidden md:table-cell">Distance</th>
                                <th className="text-left text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 sm:px-6 py-4">Fuel</th>
                                <th className="text-left text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 sm:px-6 py-4">Misc</th>
                                <th className="text-left text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 sm:px-6 py-4">Status</th>
                                <th className="text-left text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 sm:px-6 py-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {expenses.length === 0 ? (
                                <tr><td colSpan={8} className="text-center py-12 text-slate-500 text-sm">No expenses found</td></tr>
                            ) : (
                                expenses.map((exp) => {
                                    const tInfo = typeStyles[exp.type] || typeStyles.misc;
                                    return (
                                        <tr key={exp.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                                            <td className="px-4 sm:px-6 py-3.5">
                                                <span className="text-sm font-semibold text-white">
                                                    {exp.trip ? `#${exp.trip.tripNumber}` : '—'}
                                                </span>
                                            </td>
                                            <td className="px-4 sm:px-6 py-3.5">
                                                {exp.vehicle ? (
                                                    <div>
                                                        <p className="text-sm text-white font-medium">{exp.vehicle.registrationNumber}</p>
                                                        <p className="text-xs text-slate-500">{exp.vehicle.make} {exp.vehicle.model}</p>
                                                    </div>
                                                ) : <span className="text-xs text-slate-600">—</span>}
                                            </td>
                                            <td className="px-4 sm:px-6 py-3.5 hidden sm:table-cell text-sm text-slate-300">{exp.driverName || '—'}</td>
                                            <td className="px-4 sm:px-6 py-3.5 hidden md:table-cell text-sm text-slate-300">
                                                {exp.distance ? `${exp.distance.toLocaleString()} km` : '—'}
                                            </td>
                                            <td className="px-4 sm:px-6 py-3.5">
                                                <div>
                                                    <p className="text-sm text-amber-400 font-medium">₹{(exp.fuelCost || 0).toLocaleString()}</p>
                                                    {exp.fuelLiters > 0 && <p className="text-xs text-slate-500">{exp.fuelLiters}L</p>}
                                                </div>
                                            </td>
                                            <td className="px-4 sm:px-6 py-3.5 text-sm text-blue-400 font-medium">
                                                ₹{(exp.miscExpense || 0).toLocaleString()}
                                            </td>
                                            <td className="px-4 sm:px-6 py-3.5">
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border ${tInfo.color}`}>
                                                    {tInfo.icon} {tInfo.label}
                                                </span>
                                            </td>
                                            <td className="px-4 sm:px-6 py-3.5">
                                                <button onClick={() => setDeleteTarget(exp.id)} title="Delete"
                                                    className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all">
                                                    <HiOutlineTrash className="text-sm" />
                                                </button>
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

            {/* Add Expense Form Modal */}
            {showForm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowForm(false)} />
                    <div className="relative bg-[#0f172a] border border-white/[0.08] rounded-2xl p-6 sm:p-8 w-full max-w-lg shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto">
                        <button onClick={() => setShowForm(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
                            <HiOutlineX className="text-xl" />
                        </button>

                        <h3 className="text-lg font-bold text-white mb-1">Add Expense</h3>
                        <p className="text-sm text-slate-400 mb-6">Log fuel, toll, or other trip expenses</p>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Trip Select */}
                            <div>
                                <label className="text-xs font-medium text-slate-400 mb-1.5 block uppercase tracking-wider">Trip ID <span className="text-red-400">*</span></label>
                                <select value={form.tripId} onChange={(e) => handleTripSelect(e.target.value)} required
                                    className={inputClass + ' appearance-none cursor-pointer [&>option]:bg-[#0f172a]'}>
                                    <option value="">Select a completed trip...</option>
                                    {completedTrips.map((t) => (
                                        <option key={t.id} value={t.id}>
                                            #{t.tripNumber} — {t.origin} → {t.destination} ({t.vehicle?.registrationNumber || 'N/A'})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-medium text-slate-400 mb-1.5 block uppercase tracking-wider">Driver</label>
                                    <input type="text" value={form.driverName} onChange={(e) => setForm({ ...form, driverName: e.target.value })}
                                        placeholder="Auto-filled" className={inputClass} />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-slate-400 mb-1.5 block uppercase tracking-wider">Distance (km)</label>
                                    <input type="number" value={form.distance} onChange={(e) => setForm({ ...form, distance: e.target.value })}
                                        placeholder="e.g. 1000" min="0" className={inputClass} />
                                </div>
                            </div>

                            {/* Expense Type */}
                            <div>
                                <label className="text-xs font-medium text-slate-400 mb-1.5 block uppercase tracking-wider">Type <span className="text-red-400">*</span></label>
                                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} required
                                    className={inputClass + ' appearance-none cursor-pointer [&>option]:bg-[#0f172a]'}>
                                    <option value="fuel">Fuel</option>
                                    <option value="toll">Toll</option>
                                    <option value="repair">Repair</option>
                                    <option value="parking">Parking</option>
                                    <option value="misc">Misc</option>
                                </select>
                            </div>

                            {/* Fuel fields */}
                            {form.type === 'fuel' && (
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs font-medium text-slate-400 mb-1.5 block uppercase tracking-wider">Fuel Liters</label>
                                        <input type="number" step="0.1" value={form.fuelLiters} onChange={(e) => setForm({ ...form, fuelLiters: e.target.value })}
                                            placeholder="e.g. 50" min="0" className={inputClass} />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-slate-400 mb-1.5 block uppercase tracking-wider">Fuel Cost (₹) <span className="text-red-400">*</span></label>
                                        <input type="number" value={form.fuelCost} onChange={(e) => setForm({ ...form, fuelCost: e.target.value })}
                                            placeholder="e.g. 5000" min="0" required className={inputClass} />
                                    </div>
                                </div>
                            )}

                            {/* Misc Expense */}
                            <div>
                                <label className="text-xs font-medium text-slate-400 mb-1.5 block uppercase tracking-wider">
                                    {form.type === 'fuel' ? 'Additional Expense (₹)' : 'Amount (₹)'} <span className="text-red-400">*</span>
                                </label>
                                <input type="number" value={form.miscExpense} onChange={(e) => setForm({ ...form, miscExpense: e.target.value })}
                                    placeholder="e.g. 3000" min="0" required={form.type !== 'fuel'} className={inputClass} />
                            </div>

                            {/* Date */}
                            <div>
                                <label className="text-xs font-medium text-slate-400 mb-1.5 block uppercase tracking-wider">Date <span className="text-red-400">*</span></label>
                                <input type="date" value={form.expenseDate} onChange={(e) => setForm({ ...form, expenseDate: e.target.value })}
                                    required className={inputClass} />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowForm(false)}
                                    className="flex-1 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.08] text-sm font-medium text-slate-300 hover:bg-white/[0.1] transition-all">Cancel</button>
                                <button type="submit" disabled={saving}
                                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-sm font-medium text-white hover:shadow-lg hover:shadow-emerald-600/20 disabled:opacity-60 transition-all flex items-center justify-center gap-2">
                                    {saving ? <span className="spinner w-5 h-5" /> : <><HiOutlinePlus /> Record</>}
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
                            <h3 className="text-lg font-bold text-white mb-1">Delete Expense</h3>
                            <p className="text-sm text-slate-400 mb-6">Are you sure? This cannot be undone.</p>
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

export default ExpenseFuelLog;
