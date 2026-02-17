import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Shield, LayoutDashboard, User, Users, AlertTriangle, History, HardDrive, LogOut } from 'lucide-react'
import { useEffect } from 'react'
import { setAuthToken } from '../../services/api'
import './Dashboard.css'

const NAV_ITEMS = [
    { to: '/dashboard', icon: <LayoutDashboard size={18} />, label: 'Overview', end: true },
    { to: '/dashboard/profile', icon: <User size={18} />, label: 'Profile' },
    { to: '/dashboard/guardians', icon: <Users size={18} />, label: 'Guardians' },
    { to: '/dashboard/simulate', icon: <AlertTriangle size={18} />, label: 'Simulate Alert' },
    { to: '/dashboard/history', icon: <History size={18} />, label: 'Alert History' },
    { to: '/dashboard/evidence', icon: <HardDrive size={18} />, label: 'Evidence Vault' },
]

export default function Dashboard() {
    const { user, token, logout } = useAuth()
    const navigate = useNavigate()

    // Set API auth token whenever it changes
    useEffect(() => {
        setAuthToken(token)
    }, [token])

    const handleLogout = () => {
        logout()
        navigate('/', { replace: true })
    }

    const initials = user?.email
        ? user.email.substring(0, 2).toUpperCase()
        : 'U'

    return (
        <div className="dashboard">
            <aside className="dash-sidebar">
                <NavLink to="/" className="dash-sidebar__brand">
                    <Shield size={18} className="dash-sidebar__brand-icon" />
                    <span className="dash-sidebar__brand-text">RAKSHAK</span>
                </NavLink>

                <nav className="dash-sidebar__nav">
                    {NAV_ITEMS.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.end}
                            className={({ isActive }) =>
                                `dash-sidebar__link ${isActive ? 'active' : ''}`
                            }
                        >
                            {item.icon}
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                <div className="dash-sidebar__footer">
                    <div className="dash-sidebar__user">
                        <div className="dash-sidebar__avatar">{initials}</div>
                        <span className="dash-sidebar__email">{user?.email || 'User'}</span>
                    </div>
                    <button className="dash-sidebar__logout" onClick={handleLogout}>
                        <LogOut size={16} />
                        Sign Out
                    </button>
                </div>
            </aside>

            <main className="dash-main">
                <Outlet />
            </main>
        </div>
    )
}
