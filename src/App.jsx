import { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'

// Landing page components
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Problem from './components/Problem'
import Solution from './components/Solution'
import TechStack from './components/TechStack'
import Privacy from './components/Privacy'
import RiskMitigation from './components/RiskMitigation'
import Team from './components/Team'
import Footer from './components/Footer'

// Auth pages
import Login from './pages/auth/Login'
import Signup from './pages/auth/Signup'
import Verify from './pages/auth/Verify'

// Dashboard
import Dashboard from './pages/dashboard/Dashboard'
import Overview from './pages/dashboard/Overview'
import Profile from './pages/dashboard/Profile'
import Guardians from './pages/dashboard/Guardians'
import SimulateAlert from './pages/dashboard/SimulateAlert'
import AlertHistory from './pages/dashboard/AlertHistory'
import Evidence from './pages/dashboard/Evidence'

// Components
import ProtectedRoute from './components/ProtectedRoute'

/* Intersection Observer hook for reveal animations */
function useRevealObserver() {
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible')
                    }
                })
            },
            { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
        )
        document.querySelectorAll('.reveal').forEach((el) => observer.observe(el))
        return () => observer.disconnect()
    }, [])
}

/* Landing page (static marketing site) */
function LandingPage() {
    useRevealObserver()

    return (
        <div className="app">
            <Navbar />
            <main>
                <Hero />
                <Problem />
                <Solution />
                <TechStack />
                <Privacy />
                <RiskMitigation />
                <Team />
            </main>
            <Footer />
        </div>
    )
}

function App() {
    return (
        <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/signup" element={<Signup />} />
            <Route path="/auth/verify" element={<Verify />} />

            {/* Protected dashboard */}
            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                }
            >
                <Route index element={<Overview />} />
                <Route path="profile" element={<Profile />} />
                <Route path="guardians" element={<Guardians />} />
                <Route path="simulate" element={<SimulateAlert />} />
                <Route path="history" element={<AlertHistory />} />
                <Route path="evidence" element={<Evidence />} />
            </Route>
        </Routes>
    )
}

export default App
