import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { tripAPI } from '../services/api';
import toast from 'react-hot-toast';
import {
    HiOutlinePlus, HiOutlineSearch, HiOutlineFilter, HiOutlineX,
    HiOutlineRefresh, HiOutlineTrash, HiOutlineArrowRight
} from 'react-icons/hi';

const typeIcons = { truck: '🚛', van: '🚐', bike: '🏍️' };

const statusStyles = {
    draft: 'bg-slate-500/15 text-slate-400 border-slate-500/20',
    dispatched: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
    completed: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
    cancelled: 'bg-red-500/15 text-red-400 border-red-500/20',
};

const statusActions = {
    draft: [{ to: 'dispatched', label: 'Dispatch', color: 'bg-blue-600 hover:bg-blue-500' }, { to: 'cancelled', label: 'Cancel', color: 'bg-red-600/60 hover:bg-red-500' }],
    dispatched: [{ to: 'completed', label: 'Complete', color: 'bg-emerald-600 hover:bg-emerald-500' }, { to: 'cancelled', label: 'Cancel', color: 'bg-red-600/60 hover:bg-red-500' }],
    completed: [],
    cancelled: [],
};

const emptyForm = {
    vehicleId: '', driverId: '', origin: '', destination: '',
    cargo: '', cargoWeight: '', estimatedFuelCost: '', notes: ''
};

const TripDispatcher = () => {
    const { user } = useAuth();
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalPages, setTotalPages] = useState(1);
    const [filters, setFilters] = useState({ search: '', status: '', type: '', page: 1 });
    const [showFilters, setShowFilters] = useState(false);

    // Form
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);
    const [availableVehicles, setAvailableVehicles] = useState([]);
    const [availableDrivers, setAvailableDrivers] = useState([]);
    const [selectedVehicle, setSelectedVehicle] = useState(null);

    const [deleteTarget, setDeleteTarget] = useState(null);

    const fetchTrips = async () => {
        try {
            const res = await tripAPI.getAll(filters);
            setTrips(res.data.trips);
            setTotalPages(res.data.totalPages);
        } catch (error) {
            toast.error('Failed to load trips');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchTrips(); }, [filters.page, filters.status, filters.type]);

    const openNewForm = async () => {
        setForm(emptyForm);
        setSelectedVehicle(null);
        try {
            const res = await tripAPI.getAvailableResources();
            setAvailableVehicles(res.data.vehicles);
            setAvailableDrivers(res.data.drivers);
            setShowForm(true);
        } catch (error) {
            toast.error('Failed to load available resources');
        }
    };

    const handleVehicleSelect = (vehicleId) => {
        setForm({ ...form, vehicleId });
        const v = availableVehicles.find(v => v.id === vehicleId);
        setSelectedVehicle(v || null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await tripAPI.create(form);
            toast.success('Trip created!');
            setShowForm(false);
            fetchTrips();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create trip');
        } finally {
            setSaving(false);
        }
    };

    const handleStatusChange = async (tripId, newStatus) => {
        try {
            const res = await tripAPI.updateStatus(tripId, newStatus);
            toast.success(res.data.message);
            fetchTrips();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update status');
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            await tripAPI.delete(deleteTarget);
            toast.success('Trip deleted');
            setDeleteTarget(null);
            fetchTrips();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete');
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setFilters({ ...filters, page: 1 });
        fetchTrips();
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
                    <h1 className="text-2xl sm:text-3xl font-bold text-white">Trip Dispatcher</h1>
                    <p className="text-sm text-slate-400 mt-1">Manage deliveries & dispatches</p>
                </div>
                <div className="flex items-center gap-2.5">
                    <button onClick={fetchTrips} className="px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-slate-400 hover:text-white hover:bg-white/[0.08] transition-all text-sm flex items-center gap-2">
                        <HiOutlineRefresh /> Refresh
                    </button>
                    <button onClick={openNewForm} className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium flex items-center gap-2 hover:shadow-lg hover:shadow-blue-600/20 transition-all">
                        <HiOutlinePlus /> New Trip
                    </button>
                </div>
            </div>

            {/* Search & Filters */}
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 mb-4">
                <div className="flex flex-col sm:flex-row gap-3">
                    <form onSubmit={handleSearch} className="flex-1 relative">
                        <HiOutlineSearch className="absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-500" />
                        <input type="text" placeholder="Search trips, drivers, cargo..."
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
                            <option value="draft">Draft</option>
                            <option value="dispatched">Dispatched</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                        <select value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value, page: 1 })}
                            className="py-2.5 px-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white outline-none [&>option]:bg-[#0f172a]">
                            <option value="">All Vehicle Types</option>
                            <option value="truck">🚛 Truck</option>
                            <option value="van">🚐 Van</option>
                            <option value="bike">🏍️ Bike</option>
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
                                <th className="text-left text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 sm:px-6 py-4">Fleet Type</th>
                                <th className="text-left text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 sm:px-6 py-4 hidden sm:table-cell">Origin</th>
                                <th className="text-left text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 sm:px-6 py-4 hidden sm:table-cell">Destination</th>
                                <th className="text-left text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 sm:px-6 py-4 hidden md:table-cell">Driver</th>
                                <th className="text-left text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 sm:px-6 py-4">Status</th>
                                <th className="text-left text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 sm:px-6 py-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {trips.length === 0 ? (
                                <tr><td colSpan={7} className="text-center py-12 text-slate-500 text-sm">No trips found</td></tr>
                            ) : (
                                trips.map((trip, i) => (
                                    <tr key={trip.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                                        <td className="px-4 sm:px-6 py-3.5">
                                            <span className="text-sm font-semibold text-white">#{trip.tripNumber || i + 1}</span>
                                        </td>
                                        <td className="px-4 sm:px-6 py-3.5">
                                            {trip.vehicle ? (
                                                <div className="flex items-center gap-2">
                                                    <span>{typeIcons[trip.vehicle.type] || '🚗'}</span>
                                                    <span className="text-sm text-slate-300">{trip.vehicle.registrationNumber}</span>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-slate-600 italic">Unassigned</span>
                                            )}
                                        </td>
                                        <td className="px-4 sm:px-6 py-3.5 hidden sm:table-cell text-sm text-slate-300">{trip.origin}</td>
                                        <td className="px-4 sm:px-6 py-3.5 hidden sm:table-cell text-sm text-slate-300">{trip.destination}</td>
                                        <td className="px-4 sm:px-6 py-3.5 hidden md:table-cell text-sm text-slate-300">{trip.driverName || '—'}</td>
                                        <td className="px-4 sm:px-6 py-3.5">
                                            <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium border capitalize ${statusStyles[trip.status]}`}>
                                                {trip.status}
                                            </span>
                                        </td>
                                        <td className="px-4 sm:px-6 py-3.5">
                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                {statusActions[trip.status]?.map((action) => (
                                                    <button key={action.to} onClick={() => handleStatusChange(trip.id, action.to)}
                                                        className={`px-2.5 py-1 rounded-lg text-xs font-medium text-white transition-all ${action.color}`}>
                                                        {action.label}
                                                    </button>
                                                ))}
                                                {trip.status === 'draft' && (
                                                    <button onClick={() => setDeleteTarget(trip.id)} title="Delete"
                                                        className="w-7 h-7 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all">
                                                        <HiOutlineTrash className="text-xs" />
                                                    </button>
                                                )}
                                            </div>
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

            {/* New Trip Form Modal */}
            {showForm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowForm(false)} />
                    <div className="relative bg-[#0f172a] border border-white/[0.08] rounded-2xl p-6 sm:p-8 w-full max-w-lg shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto">
                        <button onClick={() => setShowForm(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
                            <HiOutlineX className="text-xl" />
                        </button>

                        <h3 className="text-lg font-bold text-white mb-1">New Trip</h3>
                        <p className="text-sm text-slate-400 mb-6">Set up a new delivery dispatch</p>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Vehicle Select */}
                            <div>
                                <label className="text-xs font-medium text-slate-400 mb-1.5 block uppercase tracking-wider">Select Vehicle <span className="text-red-400">*</span></label>
                                <select value={form.vehicleId} onChange={(e) => handleVehicleSelect(e.target.value)} required
                                    className={inputClass + ' appearance-none cursor-pointer [&>option]:bg-[#0f172a]'}>
                                    <option value="">Choose an available vehicle...</option>
                                    {availableVehicles.map((v) => (
                                        <option key={v.id} value={v.id}>
                                            {typeIcons[v.type]} {v.registrationNumber} — {v.make} {v.model} ({v.maxLoadCapacity || 0} tons)
                                        </option>
                                    ))}
                                </select>
                                {selectedVehicle && (
                                    <p className="mt-1.5 text-xs text-blue-400">
                                        Max capacity: <span className="font-semibold">{selectedVehicle.maxLoadCapacity || 0} tons ({(selectedVehicle.maxLoadCapacity || 0) * 1000} kg)</span>
                                    </p>
                                )}
                            </div>

                            {/* Cargo Weight */}
                            <div>
                                <label className="text-xs font-medium text-slate-400 mb-1.5 block uppercase tracking-wider">Cargo Weight (kg) <span className="text-red-400">*</span></label>
                                <input type="number" value={form.cargoWeight} onChange={(e) => setForm({ ...form, cargoWeight: e.target.value })}
                                    placeholder="e.g. 2000" min="0" required className={inputClass} />
                                {selectedVehicle && form.cargoWeight && (form.cargoWeight / 1000) > (selectedVehicle.maxLoadCapacity || 0) && selectedVehicle.maxLoadCapacity > 0 && (
                                    <p className="mt-1.5 text-xs text-red-400 font-medium">
                                        ⚠️ Exceeds max capacity! {form.cargoWeight} kg ({(form.cargoWeight / 1000).toFixed(1)} tons) &gt; {selectedVehicle.maxLoadCapacity} tons
                                    </p>
                                )}
                            </div>

                            {/* Driver Select */}
                            <div>
                                <label className="text-xs font-medium text-slate-400 mb-1.5 block uppercase tracking-wider">Select Driver</label>
                                <select value={form.driverId} onChange={(e) => setForm({ ...form, driverId: e.target.value })}
                                    className={inputClass + ' appearance-none cursor-pointer [&>option]:bg-[#0f172a]'}>
                                    <option value="">Choose a driver (optional)...</option>
                                    {availableDrivers.map((d) => (
                                        <option key={d.id} value={d.id}>{d.fullName} ({d.email})</option>
                                    ))}
                                </select>
                            </div>

                            {/* Route */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-medium text-slate-400 mb-1.5 block uppercase tracking-wider">Origin <span className="text-red-400">*</span></label>
                                    <input type="text" value={form.origin} onChange={(e) => setForm({ ...form, origin: e.target.value })}
                                        placeholder="e.g. Mumbai" required className={inputClass} />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-slate-400 mb-1.5 block uppercase tracking-wider">Destination <span className="text-red-400">*</span></label>
                                    <input type="text" value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })}
                                        placeholder="e.g. Pune" required className={inputClass} />
                                </div>
                            </div>

                            {/* Cargo Description */}
                            <div>
                                <label className="text-xs font-medium text-slate-400 mb-1.5 block uppercase tracking-wider">Cargo Description</label>
                                <input type="text" value={form.cargo} onChange={(e) => setForm({ ...form, cargo: e.target.value })}
                                    placeholder="e.g. Electronics" className={inputClass} />
                            </div>

                            {/* Fuel Cost */}
                            <div>
                                <label className="text-xs font-medium text-slate-400 mb-1.5 block uppercase tracking-wider">Estimated Fuel Cost (₹)</label>
                                <input type="number" value={form.estimatedFuelCost} onChange={(e) => setForm({ ...form, estimatedFuelCost: e.target.value })}
                                    placeholder="e.g. 5000" min="0" className={inputClass} />
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="text-xs font-medium text-slate-400 mb-1.5 block uppercase tracking-wider">Notes</label>
                                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
                                    placeholder="Additional instructions..." rows={2} className={inputClass + ' resize-none'} />
                            </div>

                            <button type="submit" disabled={saving}
                                className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold flex items-center justify-center gap-2 min-h-[48px] hover:shadow-lg hover:shadow-blue-600/20 disabled:opacity-60 transition-all">
                                {saving ? <span className="spinner w-5 h-5" /> : <><HiOutlineArrowRight /> Confirm & Create Trip</>}
                            </button>
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
                            <h3 className="text-lg font-bold text-white mb-1">Delete Trip</h3>
                            <p className="text-sm text-slate-400 mb-6">This will delete the draft trip and release the vehicle.</p>
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

export default TripDispatcher;
