import { useState, useEffect } from 'react';
import { analyticsAPI } from '../services/api';
import toast from 'react-hot-toast';
import {
    HiOutlineRefresh, HiOutlineDownload, HiOutlineTrendingUp,
    HiOutlineCurrencyRupee, HiOutlineChartBar, HiOutlineTruck
} from 'react-icons/hi';
import { LuFuel, LuBanknote, LuChartColumnIncreasing } from 'react-icons/lu';

const Analytics = () => {
    const [overview, setOverview] = useState(null);
    const [fuelEfficiency, setFuelEfficiency] = useState([]);
    const [costliest, setCostliest] = useState([]);
    const [monthly, setMonthly] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchAll = async () => {
        try {
            const [ov, fe, cv, ms] = await Promise.all([
                analyticsAPI.getOverview(),
                analyticsAPI.getFuelEfficiency(),
                analyticsAPI.getCostliestVehicles(),
                analyticsAPI.getMonthlySummary()
            ]);
            setOverview(ov.data);
            setFuelEfficiency(fe.data.efficiency || []);
            setCostliest(cv.data.costliest || []);
            setMonthly(ms.data.summary || []);
        } catch (error) {
            toast.error('Failed to load analytics');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAll(); }, []);

    const downloadCSV = async (type) => {
        try {
            const res = await analyticsAPI.exportCSV(type);
            const blob = new Blob([res.data], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `fleetflow_${type}_${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
            window.URL.revokeObjectURL(url);
            toast.success(`${type} CSV downloaded`);
        } catch (error) {
            toast.error('Failed to download');
        }
    };

    const fmt = (n) => n != null ? `₹${Number(n).toLocaleString('en-IN')}` : '₹0';
    const fmtMonth = (m) => {
        if (!m || m === 'Unknown') return m;
        const [y, mo] = m.split('-');
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${months[parseInt(mo) - 1]} ${y}`;
    };

    // Find max cost for bar rendering
    const maxCost = costliest.length > 0 ? Math.max(...costliest.map(c => c.totalCost)) : 1;
    const maxEff = fuelEfficiency.length > 0 ? Math.max(...fuelEfficiency.map(e => parseFloat(e.kmPerLiter || 0))) : 1;

    if (loading) {
        return <div className="flex items-center justify-center h-screen"><div className="spinner w-8 h-8 border-3" /></div>;
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div className="pl-12 lg:pl-0">
                    <h1 className="text-2xl sm:text-3xl font-bold text-white">Analytics & Reports</h1>
                    <p className="text-sm text-slate-400 mt-1">Operational insights & financial data</p>
                </div>
                <div className="flex items-center gap-2.5 flex-wrap">
                    <button onClick={fetchAll} className="px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-slate-400 hover:text-white text-sm flex items-center gap-2 transition-all">
                        <HiOutlineRefresh /> Refresh
                    </button>
                    <div className="relative group">
                        <button className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-medium flex items-center gap-2 hover:shadow-lg hover:shadow-indigo-600/20 transition-all">
                            <HiOutlineDownload /> Export CSV
                        </button>
                        <div className="absolute right-0 top-full mt-1 bg-[#0f172a] border border-white/[0.1] rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 min-w-[160px]">
                            {['expenses', 'maintenance', 'trips'].map(t => (
                                <button key={t} onClick={() => downloadCSV(t)}
                                    className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-white/[0.06] hover:text-white transition-all first:rounded-t-xl last:rounded-b-xl capitalize">
                                    📄 {t}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* KPI Cards */}
            {overview && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
                    {[
                        { label: 'Total Fuel Cost', value: fmt(overview.totalFuelCost), icon: <HiOutlineCurrencyRupee />, color: 'from-amber-500 to-orange-500', glow: 'bg-amber-500/10' },
                        { label: 'Fleet ROI', value: `${overview.fleetROI > 0 ? '+' : ''}${overview.fleetROI}%`, icon: <HiOutlineTrendingUp />, color: overview.fleetROI >= 0 ? 'from-emerald-500 to-teal-500' : 'from-red-500 to-rose-500', glow: 'bg-emerald-500/10' },
                        { label: 'Utilization Rate', value: `${overview.utilizationRate}%`, icon: <HiOutlineChartBar />, color: 'from-blue-500 to-cyan-500', glow: 'bg-blue-500/10' },
                        { label: 'Completed Trips', value: `${overview.completedTrips}/${overview.totalTrips}`, icon: <HiOutlineTruck />, color: 'from-violet-500 to-purple-500', glow: 'bg-violet-500/10' },
                    ].map((kpi) => (
                        <div key={kpi.label} className="relative bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 sm:p-5 overflow-hidden group hover:border-white/[0.1] transition-all duration-300">
                            <div className={`absolute top-0 right-0 w-24 h-24 ${kpi.glow} rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${kpi.color} flex items-center justify-center text-white text-xl mb-3 shadow-lg`}>
                                {kpi.icon}
                            </div>
                            <p className="text-2xl sm:text-3xl font-bold text-white">{kpi.value}</p>
                            <p className="text-xs sm:text-sm text-slate-400 mt-1">{kpi.label}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Two-column layout: Fuel Efficiency + Top 5 Costliest */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
                {/* Fuel Efficiency */}
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
                    <h2 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2"><LuFuel className="text-cyan-400" /> Fuel Efficiency (km/L)</h2>
                    {fuelEfficiency.length === 0 ? (
                        <p className="text-sm text-slate-500 text-center py-8">No fuel data yet</p>
                    ) : (
                        <div className="space-y-3">
                            {fuelEfficiency.slice(0, 8).map((v, i) => (
                                <div key={v.vehicleId} className="flex items-center gap-3">
                                    <span className="text-xs text-slate-500 w-4">{i + 1}</span>
                                    <div className="min-w-[100px]">
                                        <p className="text-xs font-medium text-white">{v.vehicle?.registrationNumber}</p>
                                        <p className="text-[10px] text-slate-500">{v.vehicle?.make} {v.vehicle?.model}</p>
                                    </div>
                                    <div className="flex-1 h-6 bg-white/[0.04] rounded-lg overflow-hidden relative">
                                        <div className="h-full bg-gradient-to-r from-cyan-600 to-blue-600 rounded-lg transition-all duration-700"
                                            style={{ width: `${Math.min((parseFloat(v.kmPerLiter) / maxEff) * 100, 100)}%` }} />
                                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] font-bold text-white">{v.kmPerLiter} km/L</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Top 5 Costliest */}
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
                    <h2 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2"><LuBanknote className="text-red-400" /> Top 5 Costliest Vehicles</h2>
                    {costliest.length === 0 ? (
                        <p className="text-sm text-slate-500 text-center py-8">No cost data yet</p>
                    ) : (
                        <div className="space-y-3">
                            {costliest.map((v, i) => (
                                <div key={v.vehicleId} className="flex items-center gap-3">
                                    <span className={`text-xs font-bold w-4 ${i === 0 ? 'text-red-400' : i === 1 ? 'text-amber-400' : 'text-slate-500'}`}>{i + 1}</span>
                                    <div className="min-w-[100px]">
                                        <p className="text-xs font-medium text-white">{v.vehicle?.registrationNumber}</p>
                                        <p className="text-[10px] text-slate-500">{v.vehicle?.make} {v.vehicle?.model}</p>
                                    </div>
                                    <div className="flex-1 h-6 bg-white/[0.04] rounded-lg overflow-hidden relative">
                                        <div className="h-full bg-gradient-to-r from-red-600 to-orange-600 rounded-lg transition-all duration-700"
                                            style={{ width: `${(v.totalCost / maxCost) * 100}%` }} />
                                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] font-bold text-white">{fmt(v.totalCost)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Financial Summary of Month */}
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden">
                <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-slate-300 flex items-center gap-2"><LuChartColumnIncreasing className="text-indigo-400" /> Financial Summary by Month</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/[0.06]">
                                <th className="text-left text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider px-5 py-3">Month</th>
                                <th className="text-right text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider px-5 py-3">Revenue</th>
                                <th className="text-right text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider px-5 py-3">Fuel Cost</th>
                                <th className="text-right text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider px-5 py-3">Maintenance</th>
                                <th className="text-right text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider px-5 py-3">Net Profit</th>
                            </tr>
                        </thead>
                        <tbody>
                            {monthly.length === 0 ? (
                                <tr><td colSpan={5} className="text-center py-10 text-slate-500 text-sm">No financial data yet</td></tr>
                            ) : (
                                monthly.map((m) => (
                                    <tr key={m.month} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                                        <td className="px-5 py-3 text-sm font-medium text-white">{fmtMonth(m.month)}</td>
                                        <td className="px-5 py-3 text-sm text-right text-emerald-400 font-medium">{fmt(m.revenue)}</td>
                                        <td className="px-5 py-3 text-sm text-right text-amber-400">{fmt(m.fuelCost)}</td>
                                        <td className="px-5 py-3 text-sm text-right text-red-400">{fmt(m.maintenance)}</td>
                                        <td className="px-5 py-3 text-sm text-right font-bold">
                                            <span className={m.netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                                                {m.netProfit >= 0 ? '+' : ''}{fmt(m.netProfit)}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                            {monthly.length > 0 && (
                                <tr className="bg-white/[0.04] border-t border-white/[0.08]">
                                    <td className="px-5 py-3 text-sm font-bold text-white">Total</td>
                                    <td className="px-5 py-3 text-sm text-right text-emerald-400 font-bold">{fmt(monthly.reduce((s, m) => s + m.revenue, 0))}</td>
                                    <td className="px-5 py-3 text-sm text-right text-amber-400 font-bold">{fmt(monthly.reduce((s, m) => s + m.fuelCost, 0))}</td>
                                    <td className="px-5 py-3 text-sm text-right text-red-400 font-bold">{fmt(monthly.reduce((s, m) => s + m.maintenance, 0))}</td>
                                    <td className="px-5 py-3 text-sm text-right font-bold">
                                        {(() => {
                                            const total = monthly.reduce((s, m) => s + m.netProfit, 0);
                                            return <span className={total >= 0 ? 'text-emerald-400' : 'text-red-400'}>{total >= 0 ? '+' : ''}{fmt(total)}</span>;
                                        })()}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
