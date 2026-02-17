import { Link } from 'react-router-dom'
import { Shield } from 'lucide-react'
import './Footer.css'

export default function Footer() {
    return (
        <footer className="footer">
            <div className="container">
                <div className="footer__inner">
                    <div className="footer__brand">
                        <div className="footer__logo">
                            <span className="navbar__logo-icon"><Shield size={18} /></span>
                            <span className="navbar__logo-text">RAKSHAK</span>
                        </div>
                        <p className="footer__tagline">
                            AI-Powered Silent Guardian System
                            <br />
                            Built by Team Kavach
                        </p>
                    </div>

                    <div className="footer__links">
                        <div className="footer__col">
                            <h4 className="footer__col-title">Project</h4>
                            <a href="#solution">How It Works</a>
                            <a href="#technology">Technology</a>
                            <a href="#privacy">Privacy</a>
                            <a href="#team">Team</a>
                        </div>
                        <div className="footer__col">
                            <h4 className="footer__col-title">Platform</h4>
                            <Link to="/auth/signup">Get Started</Link>
                            <Link to="/auth/login">Login</Link>
                            <Link to="/dashboard">Dashboard</Link>
                        </div>
                    </div>
                </div>

                <div className="footer__bottom">
                    <p>&copy; {new Date().getFullYear()} Team Kavach. All rights reserved.</p>
                    <p className="footer__built">
                        Built with purpose. Designed for impact.
                    </p>
                </div>
            </div>
        </footer>
    )
}
