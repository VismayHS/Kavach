import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import AnimatedBackground from './AnimatedBackground'
import './Hero.css'

export default function Hero() {
    const scrollTo = (id) => {
        const el = document.querySelector(id)
        if (el) el.scrollIntoView({ behavior: 'smooth' })
    }

    return (
        <section className="hero" id="hero">
            {/* Animated particle network */}
            <AnimatedBackground particleCount={50} color="79, 110, 247" maxOpacity={0.3} />

            {/* Floating gradient orbs */}
            <div className="hero__orb hero__orb--1" />
            <div className="hero__orb hero__orb--2" />
            <div className="hero__orb hero__orb--3" />

            {/* Subtle ambient light */}
            <div className="hero__ambient" />

            <div className="hero__content container">
                <h1 className="hero__title reveal">
                    <span className="hero__title-line">RAKSHAK</span>
                    <span className="hero__title-sub">
                        The Silent Guardian That Protects
                        <br />
                        Without Being Seen.
                    </span>
                </h1>

                <p className="hero__description reveal reveal-delay-1">
                    An intelligent on-device AI system that silently detects distress
                    through voice, gestures, and behavior — alerting guardians in
                    real&#8209;time without ever compromising privacy.
                </p>

                <div className="hero__actions reveal reveal-delay-2">
                    <button className="btn btn-primary hero__cta-btn" onClick={() => scrollTo('#solution')}>
                        See How It Works
                        <ChevronRight size={16} />
                    </button>
                    <Link to="/auth/signup" className="btn btn-secondary hero__cta-btn">
                        Get Started
                    </Link>
                </div>

                <div className="hero__meta reveal reveal-delay-3">
                    <span className="hero__meta-line">Built for safer villages in India.</span>
                    <span className="hero__meta-divider">·</span>
                    <span className="hero__meta-team">By <strong>Team Kavach</strong></span>
                </div>
            </div>

            {/* Shield symbol */}
            <div className="hero__shield" aria-hidden="true">
                <svg viewBox="0 0 120 140" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M60 8L12 30v40c0 32 20 52 48 64 28-12 48-32 48-64V30L60 8z"
                        stroke="rgba(79,110,247,0.08)" strokeWidth="1.5" fill="none" />
                    <path d="M60 24L24 40v30c0 24 15 40 36 50 21-10 36-26 36-50V40L60 24z"
                        stroke="rgba(79,110,247,0.05)" strokeWidth="1" fill="none" />
                </svg>
            </div>
        </section>
    )
}
