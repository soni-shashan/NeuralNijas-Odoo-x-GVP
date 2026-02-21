import { useState, useEffect } from 'react';
import { vehicleAPI } from '../services/api';
import toast from 'react-hot-toast';
import {
    HiOutlinePlus, HiOutlineSearch, HiOutlineFilter, HiOutlinePencil,
    HiOutlineTrash, HiOutlineX, HiOutlineRefresh, HiOutlineBan, HiOutlineCheckCircle
} from 'react-icons/hi';

const typeIcons = { truck: '🚛', van: '🚐', bike: '🏍️' };

const statusStyles = {
    available: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
    'on-trip': 'bg-blue-500/15 text-blue-400 border-blue-500/20',
    'in-shop': 'bg-amber-500/15 text-amber-400 border-amber-500/20',
    idle: 'bg-slate-500/15 text-slate-400 border-slate-500/20',
    retired: 'bg-red-500/15 text-red-400 border-red-500/20',
};

const emptyForm = {
    registrationNumber: '', type: 'truck', make: '', model: '',
    year: new Date().getFullYear(), maxLoadCapacity: '', mileage: '', fuelType: 'diesel'
};

const VehicleRegistry = () => {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalPages, setTotalPages] = useState(1);
    const [filters, setFilters] = useState({ search: '', type: '', status: '', page: 1 });
    const [showFilters, setShowFilters] = useState(false);

    // Form state
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);

    // Delete confirmation
    const [deleteTarget, setDeleteTarget] = useState(null);

    const fetchVehicles = async () => {
        try {
            const res = await vehicleAPI.getAll(filters);
            setVehicles(res.data.vehicles);
            setTotalPages(res.data.totalPages);
        } catch (error) {
            toast.error('Failed to load vehicles');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchVehicles(); }, [filters.page, filters.type, filters.status]);

    const handleSearch = (e) => {
        e.preventDefault();
        setFilters({ ...filters, page: 1 });
        fetchVehicles();
    };

    const openNewForm = () => {
        setForm(emptyForm);
        setEditingId(null);
        setShowForm(true);
    };

    const openEditForm = (v) => {
        setForm({
            registrationNumber: v.registrationNumber,
            type: v.type,
            make: v.make,
            model: v.model,
            year: v.year || '',
            maxLoadCapacity: v.maxLoadCapacity || '',
            mileage: v.mileage || '',
            fuelType: v.fuelType || 'diesel'
        });
        setEditingId(v.id);
        setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (editingId) {
                await vehicleAPI.update(editingId, form);
                toast.success('Vehicle updated');
            } else {
                await vehicleAPI.create(form);
                toast.success('Vehicle registered');
            }
            setShowForm(false);
            setEditingId(null);
            fetchVehicles();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Operation failed');
        } finally {
            setSaving(false);
        }
    };

    const handleToggle = async (id) => {
        try {
            const res = await vehicleAPI.toggleStatus(id);
            toast.success(res.data.message);
            fetchVehicles();
        } catch (error) {
            toast.error('Failed to toggle status');
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            await vehicleAPI.delete(deleteTarget);
            toast.success('Vehicle deleted');
            setDeleteTarget(null);
            fetchVehicles();
        } catch (error) {
            toast.error('Failed to delete vehicle');
        }
    };

    const inputClass = "w-full py-2.5 px-3.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-sm outline-none placeholder-slate-600 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all";

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
                    <h1 className="text-2xl sm:text-3xl font-bold text-white">Vehicle Registry</h1>
                    <p className="text-sm text-slate-400 mt-1">Manage your fleet assets</p>
                </div>
                <div className="flex items-center gap-2.5">
                    <button onClick={fetchVehicles} className="px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-slate-400 hover:text-white hover:bg-white/[0.08] transition-all text-sm flex items-center gap-2">
                        <HiOutlineRefresh /> Refresh
                    </button>
                    <button onClick={openNewForm} className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium flex items-center gap-2 hover:shadow-lg hover:shadow-blue-600/20 transition-all">
                        <HiOutlinePlus /> New Vehicle
                    </button>
                </div>
            </div>

            {/* Search & Filters */}
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 mb-4">
                <div className="flex flex-col sm:flex-row gap-3">
                    <form onSubmit={handleSearch} className="flex-1 relative">
                        <HiOutlineSearch className="absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-500" />
                        <input type="text" placeholder="Search by plate, make, model..."
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
                        <select value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value, page: 1 })}
                            className="py-2.5 px-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white outline-none [&>option]:bg-[#0f172a]">
                            <option value="">All Types</option>
                            <option value="truck">🚛 Truck</option>
                            <option value="van">🚐 Van</option>
                            <option value="bike">🏍️ Bike</option>
                        </select>
                        <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
                            className="py-2.5 px-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white outline-none [&>option]:bg-[#0f172a]">
                            <option value="">All Statuses</option>
                            <option value="available">Available</option>
                            <option value="on-trip">On Trip</option>
                            <option value="in-shop">In Shop</option>
                            <option value="idle">Idle</option>
                            <option value="retired">Retired</option>
                        </select>
                    </div>
                )}
            </div>

            {/* Vehicle Table */}
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px]">
                        <thead>
                            <tr className="border-b border-white/[0.06]">
                                <th className="text-left text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 sm:px-6 py-4">#</th>
                                <th className="text-left text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 sm:px-6 py-4">Plate</th>
                                <th className="text-left text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 sm:px-6 py-4 hidden sm:table-cell">Model</th>
                                <th className="text-left text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 sm:px-6 py-4">Type</th>
                                <th className="text-left text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 sm:px-6 py-4 hidden md:table-cell">Capacity</th>
                                <th className="text-left text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 sm:px-6 py-4 hidden lg:table-cell">Odometer</th>
                                <th className="text-left text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 sm:px-6 py-4">Status</th>
                                <th className="text-left text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 sm:px-6 py-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {vehicles.length === 0 ? (
                                <tr><td colSpan={8} className="text-center py-12 text-slate-500 text-sm">No vehicles found</td></tr>
                            ) : (
                                vehicles.map((v, i) => (
                                    <tr key={v.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                                        <td className="px-4 sm:px-6 py-3.5 text-sm text-slate-500">{(filters.page - 1) * 15 + i + 1}</td>
                                        <td className="px-4 sm:px-6 py-3.5">
                                            <span className="text-sm font-semibold text-white">{v.registrationNumber}</span>
                                        </td>
                                        <td className="px-4 sm:px-6 py-3.5 hidden sm:table-cell">
                                            <p className="text-sm text-slate-300">{v.make} {v.model}</p>
                                            {v.year && <p className="text-xs text-slate-500">{v.year}</p>}
                                        </td>
                                        <td className="px-4 sm:px-6 py-3.5">
                                            <span className="text-sm">{typeIcons[v.type]} <span className="capitalize text-slate-300 hidden sm:inline">{v.type}</span></span>
                                        </td>
                                        <td className="px-4 sm:px-6 py-3.5 hidden md:table-cell">
                                            <span className="text-sm text-slate-300">{v.maxLoadCapacity ? `${v.maxLoadCapacity} tons` : '—'}</span>
                                        </td>
                                        <td className="px-4 sm:px-6 py-3.5 hidden lg:table-cell">
                                            <span className="text-sm text-slate-300">{v.mileage ? v.mileage.toLocaleString() + ' km' : '—'}</span>
                                        </td>
                                        <td className="px-4 sm:px-6 py-3.5">
                                            <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium border ${statusStyles[v.status]}`}>
                                                {v.status === 'on-trip' ? 'On Trip' : v.status === 'in-shop' ? 'In Shop' : v.status.charAt(0).toUpperCase() + v.status.slice(1)}
                                            </span>
                                        </td>
                                        <td className="px-4 sm:px-6 py-3.5">
                                            <div className="flex items-center gap-1.5">
                                                <button onClick={() => openEditForm(v)} title="Edit"
                                                    className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 hover:border-blue-500/20 transition-all">
                                                    <HiOutlinePencil className="text-sm" />
                                                </button>
                                                <button onClick={() => handleToggle(v.id)} title={v.status === 'retired' ? 'Reactivate' : 'Retire'}
                                                    className={`w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center transition-all
                            ${v.status === 'retired' ? 'text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/20' : 'text-amber-400 hover:bg-amber-500/10 hover:border-amber-500/20'}`}>
                                                    {v.status === 'retired' ? <HiOutlineCheckCircle className="text-sm" /> : <HiOutlineBan className="text-sm" />}
                                                </button>
                                                <button onClick={() => setDeleteTarget(v.id)} title="Delete"
                                                    className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-slate-400 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 transition-all">
                                                    <HiOutlineTrash className="text-sm" />
                                                </button>
                                            </div>
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
                            <button onClick={() => setFilters({ ...filters, page: filters.page - 1 })} disabled={filters.page <= 1}
                                className="px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs text-slate-400 disabled:opacity-30 hover:text-white transition-all">Prev</button>
                            <button onClick={() => setFilters({ ...filters, page: filters.page + 1 })} disabled={filters.page >= totalPages}
                                className="px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs text-slate-400 disabled:opacity-30 hover:text-white transition-all">Next</button>
                        </div>
                    </div>
                )}
            </div>

            {/* Add/Edit Vehicle Form Modal */}
            {showForm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowForm(false)} />
                    <div className="relative bg-[#0f172a] border border-white/[0.08] rounded-2xl p-6 sm:p-8 w-full max-w-lg shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto">
                        <button onClick={() => setShowForm(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
                            <HiOutlineX className="text-xl" />
                        </button>

                        <h3 className="text-lg font-bold text-white mb-1">{editingId ? 'Edit Vehicle' : 'New Vehicle Registration'}</h3>
                        <p className="text-sm text-slate-400 mb-6">{editingId ? 'Update vehicle details' : 'Add a new vehicle to your fleet'}</p>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="text-xs font-medium text-slate-400 mb-1.5 block uppercase tracking-wider">License Plate <span className="text-red-400">*</span></label>
                                <input type="text" value={form.registrationNumber} onChange={(e) => setForm({ ...form, registrationNumber: e.target.value.toUpperCase() })}
                                    placeholder="GJ-01-AB-1234" required className={inputClass} />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-medium text-slate-400 mb-1.5 block uppercase tracking-wider">Make <span className="text-red-400">*</span></label>
                                    <input type="text" value={form.make} onChange={(e) => setForm({ ...form, make: e.target.value })}
                                        placeholder="e.g. Tata" required className={inputClass} />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-slate-400 mb-1.5 block uppercase tracking-wider">Model <span className="text-red-400">*</span></label>
                                    <input type="text" value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })}
                                        placeholder="e.g. Prima" required className={inputClass} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-medium text-slate-400 mb-1.5 block uppercase tracking-wider">Type <span className="text-red-400">*</span></label>
                                    <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                                        className={inputClass + ' appearance-none cursor-pointer [&>option]:bg-[#0f172a]'}>
                                        <option value="truck">🚛 Truck</option>
                                        <option value="van">🚐 Van</option>
                                        <option value="bike">🏍️ Bike</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-slate-400 mb-1.5 block uppercase tracking-wider">Year</label>
                                    <input type="number" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })}
                                        placeholder="2024" min="2000" max="2030" className={inputClass} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-medium text-slate-400 mb-1.5 block uppercase tracking-wider">Max Payload (tons)</label>
                                    <input type="number" step="0.1" value={form.maxLoadCapacity} onChange={(e) => setForm({ ...form, maxLoadCapacity: e.target.value })}
                                        placeholder="e.g. 5" min="0" className={inputClass} />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-slate-400 mb-1.5 block uppercase tracking-wider">Odometer (km)</label>
                                    <input type="number" value={form.mileage} onChange={(e) => setForm({ ...form, mileage: e.target.value })}
                                        placeholder="e.g. 45000" min="0" className={inputClass} />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-medium text-slate-400 mb-1.5 block uppercase tracking-wider">Fuel Type</label>
                                <select value={form.fuelType} onChange={(e) => setForm({ ...form, fuelType: e.target.value })}
                                    className={inputClass + ' appearance-none cursor-pointer [&>option]:bg-[#0f172a]'}>
                                    <option value="diesel">⛽ Diesel</option>
                                    <option value="petrol">⛽ Petrol</option>
                                    <option value="electric">⚡ Electric</option>
                                    <option value="cng">🟢 CNG</option>
                                </select>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowForm(false)}
                                    className="flex-1 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.08] text-sm font-medium text-slate-300 hover:bg-white/[0.1] transition-all">
                                    Cancel
                                </button>
                                <button type="submit" disabled={saving}
                                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-sm font-medium text-white hover:shadow-lg hover:shadow-blue-600/20 disabled:opacity-60 transition-all flex items-center justify-center">
                                    {saving ? <span className="spinner w-5 h-5" /> : editingId ? 'Update' : 'Save'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteTarget && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDeleteTarget(null)} />
                    <div className="relative bg-[#0f172a] border border-white/[0.08] rounded-2xl p-6 w-[90%] max-w-sm shadow-2xl animate-fade-in">
                        <div className="text-center">
                            <div className="w-12 h-12 mx-auto mb-4 bg-red-500/15 rounded-full flex items-center justify-center">
                                <HiOutlineTrash className="text-2xl text-red-400" />
                            </div>
                            <h3 className="text-lg font-bold text-white mb-1">Delete Vehicle</h3>
                            <p className="text-sm text-slate-400 mb-6">Are you sure? This action cannot be undone.</p>
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

export default VehicleRegistry;
