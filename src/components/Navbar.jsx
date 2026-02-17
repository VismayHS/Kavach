import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Shield } from 'lucide-react'
import './Navbar.css'

const NAV_LINKS = [
    { label: 'Problem', href: '#problem' },
    { label: 'Solution', href: '#solution' },
    { label: 'Technology', href: '#technology' },
    { label: 'Privacy', href: '#privacy' },
    { label: 'Team', href: '#team' },
]

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false)
    const [mobileOpen, setMobileOpen] = useState(false)
    const { isAuthenticated } = useAuth()

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 40)
        window.addEventListener('scroll', onScroll, { passive: true })
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    const handleNavClick = (e, href) => {
        e.preventDefault()
        setMobileOpen(false)
        const el = document.querySelector(href)
        if (el) el.scrollIntoView({ behavior: 'smooth' })
    }

    return (
        <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`} id="navbar">
            <div className="navbar__inner container">
                <a href="#" className="navbar__brand" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) }}>
                    <span className="navbar__logo-icon"><Shield size={18} /></span>
                    <span className="navbar__logo-text">RAKSHAK</span>
                </a>

                <div className={`navbar__links ${mobileOpen ? 'navbar__links--open' : ''}`}>
                    {NAV_LINKS.map((link) => (
                        <a
                            key={link.href}
                            href={link.href}
                            className="navbar__link"
                            onClick={(e) => handleNavClick(e, link.href)}
                        >
                            {link.label}
                        </a>
                    ))}
                    {isAuthenticated ? (
                        <Link to="/dashboard" className="btn btn-primary navbar__cta">
                            Dashboard
                        </Link>
                    ) : (
                        <Link to="/auth/login" className="btn btn-primary navbar__cta">
                            Login
                        </Link>
                    )}
                </div>

                <button
                    className={`navbar__hamburger ${mobileOpen ? 'navbar__hamburger--open' : ''}`}
                    onClick={() => setMobileOpen(!mobileOpen)}
                    aria-label="Toggle menu"
                >
                    <span /><span /><span />
                </button>
            </div>
        </nav>
    )
}
