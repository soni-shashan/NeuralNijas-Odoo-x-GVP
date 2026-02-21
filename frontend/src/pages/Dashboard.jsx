import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
    const { user, logout } = useAuth();

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-fleet-bg text-fleet-text">
            <h1 className="text-3xl font-bold mb-2">🚛 Welcome to FleetFlow</h1>
            <p className="text-fleet-muted text-base mb-6">
                Logged in as <strong className="text-fleet-accent">{user?.fullName}</strong> ({user?.role})
            </p>
            <button
                onClick={logout}
                className="py-2.5 px-6 bg-fleet-danger/15 border border-fleet-danger/30 rounded-[10px] text-fleet-danger text-sm font-medium cursor-pointer hover:bg-fleet-danger/25 transition-all"
            >
                Logout
            </button>
        </div>
    );
};

export default Dashboard;
