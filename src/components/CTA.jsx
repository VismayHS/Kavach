import { useState } from 'react'
import './CTA.css'
import { Rocket, MessageCircle, ArrowRight, Send } from 'lucide-react'

export default function CTA() {
    /* ── Early Access Form ── */
    const [earlyEmail, setEarlyEmail] = useState('')
    const [earlyName, setEarlyName] = useState('')
    const [earlySubmitted, setEarlySubmitted] = useState(false)

    const handleEarlyAccess = (e) => {
        e.preventDefault()
        if (!earlyEmail.trim()) return
        const existing = JSON.parse(localStorage.getItem('rakshak_early_access') || '[]')
        existing.push({ name: earlyName, email: earlyEmail, date: new Date().toISOString() })
        localStorage.setItem('rakshak_early_access', JSON.stringify(existing))
        setEarlySubmitted(true)
        setEarlyEmail('')
        setEarlyName('')
    }

    /* ── Contact Form ── */
    const [contactName, setContactName] = useState('')
    const [contactEmail, setContactEmail] = useState('')
    const [contactMessage, setContactMessage] = useState('')
    const [contactSubmitted, setContactSubmitted] = useState(false)

    const handleContact = (e) => {
        e.preventDefault()
        if (!contactEmail.trim() || !contactMessage.trim()) return
        const existing = JSON.parse(localStorage.getItem('rakshak_contacts') || '[]')
        existing.push({
            name: contactName,
            email: contactEmail,
            message: contactMessage,
            date: new Date().toISOString(),
        })
        localStorage.setItem('rakshak_contacts', JSON.stringify(existing))
        setContactSubmitted(true)
        setContactName('')
        setContactEmail('')
        setContactMessage('')
    }

    return (
        <section className="section cta" id="contact">

            <div className="container">
                <div className="cta__header reveal">
                    <h2 className="cta__title">
                        Help Us Build Safer Communities
                        <br />
                        <span style={{ color: 'var(--accent-blue)' }}>with RAKSHAK.</span>
                    </h2>
                    <p className="section-subtitle" style={{ margin: '0 auto', textAlign: 'center' }}>
                        Whether you're an individual, an NGO, a government body, or an investor —
                        join us in making silent safety technology a reality for millions.
                    </p>
                </div>

                <div className="cta__forms">
                    {/* Early Access */}
                    <div className="cta__form-card glass-card reveal reveal-delay-1" id="early-access">
                        <h3 className="cta__form-title">
                            <span className="cta__form-icon"><Rocket size={18} /></span>
                            Join Early Access
                        </h3>
                        <p className="cta__form-desc">
                            Be among the first to experience RAKSHAK when we launch.
                        </p>
                        {earlySubmitted ? (
                            <div className="cta__success">
                                <span className="cta__success-icon">✓</span>
                                <p>Thank you! You're on the early access list.</p>
                            </div>
                        ) : (
                            <form onSubmit={handleEarlyAccess} className="cta__form">
                                <div className="form-group">
                                    <label className="form-label" htmlFor="early-name">Your Name</label>
                                    <input
                                        id="early-name"
                                        className="form-input"
                                        type="text"
                                        placeholder="Enter your name"
                                        value={earlyName}
                                        onChange={(e) => setEarlyName(e.target.value)}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label" htmlFor="early-email">Email Address *</label>
                                    <input
                                        id="early-email"
                                        className="form-input"
                                        type="email"
                                        placeholder="you@example.com"
                                        value={earlyEmail}
                                        onChange={(e) => setEarlyEmail(e.target.value)}
                                        required
                                    />
                                </div>
                                <button type="submit" className="btn btn-primary cta__submit">
                                    Get Early Access
                                    <ArrowRight size={16} />
                                </button>
                            </form>
                        )}
                    </div>

                    {/* Contact */}
                    <div className="cta__form-card glass-card reveal reveal-delay-2">
                        <h3 className="cta__form-title">
                            <span className="cta__form-icon"><MessageCircle size={18} /></span>
                            Get in Touch
                        </h3>
                        <p className="cta__form-desc">
                            Questions, partnerships, or collaboration ideas — we'd love to hear from you.
                        </p>
                        {contactSubmitted ? (
                            <div className="cta__success">
                                <span className="cta__success-icon">✓</span>
                                <p>Message sent! We'll get back to you soon.</p>
                            </div>
                        ) : (
                            <form onSubmit={handleContact} className="cta__form">
                                <div className="form-group">
                                    <label className="form-label" htmlFor="contact-name">Your Name</label>
                                    <input
                                        id="contact-name"
                                        className="form-input"
                                        type="text"
                                        placeholder="Enter your name"
                                        value={contactName}
                                        onChange={(e) => setContactName(e.target.value)}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label" htmlFor="contact-email">Email Address *</label>
                                    <input
                                        id="contact-email"
                                        className="form-input"
                                        type="email"
                                        placeholder="you@example.com"
                                        value={contactEmail}
                                        onChange={(e) => setContactEmail(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label" htmlFor="contact-msg">Message *</label>
                                    <textarea
                                        id="contact-msg"
                                        className="form-textarea"
                                        placeholder="Tell us how you'd like to be involved…"
                                        value={contactMessage}
                                        onChange={(e) => setContactMessage(e.target.value)}
                                        required
                                    />
                                </div>
                                <button type="submit" className="btn btn-primary cta__submit">
                                    Send Message
                                    <Send size={16} />
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </section>
    )
}
