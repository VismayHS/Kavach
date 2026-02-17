import './Privacy.css'
import { Smartphone, EyeOff, CircleDot, UserCheck, Lock } from 'lucide-react'

const PRINCIPLES = [
    {
        icon: <Smartphone size={24} />,
        title: 'On-Device Processing',
        desc: 'All audio and video analysis happens entirely on your phone. Raw data never leaves your device.',
    },
    {
        icon: <EyeOff size={24} />,
        title: 'No Continuous Upload',
        desc: 'RAKSHAK does not stream or upload any surveillance data. Your daily life stays completely private.',
    },
    {
        icon: <CircleDot size={24} />,
        title: 'Danger-Only Recording',
        desc: 'Evidence is captured and securely stored only when the AI confirms a genuine threat — not before.',
    },
    {
        icon: <UserCheck size={24} />,
        title: 'Full User Control',
        desc: 'You decide what triggers alerts, who receives them, and can disable the system at any time.',
    },
]

export default function Privacy() {
    return (
        <section className="section privacy" id="privacy">
            <div className="container">
                <div className="privacy__header reveal">
                    <span className="section-label">Privacy & Ethics</span>
                    <h2 className="section-title">
                        Your Privacy Is Non-Negotiable.
                    </h2>
                    <p className="section-subtitle" style={{ margin: '0 auto' }}>
                        Safety technology must earn trust. RAKSHAK is built from the
                        ground up with privacy-first architecture and ethical AI principles.
                    </p>
                </div>

                <div className="privacy__grid">
                    {PRINCIPLES.map((p, i) => (
                        <div key={i} className={`glass-card privacy__card reveal reveal-delay-${i + 1}`}>
                            <div className="privacy__card-icon">{p.icon}</div>
                            <h3 className="privacy__card-title">{p.title}</h3>
                            <p className="privacy__card-desc">{p.desc}</p>
                        </div>
                    ))}
                </div>

                <div className="privacy__commitment reveal">
                    <div className="privacy__lock">
                        <Lock size={20} />
                    </div>
                    <p>
                        <strong>Our Commitment:</strong> RAKSHAK will never sell data,
                        share personal information with third parties, or use AI models
                        that compromise user dignity. Safety without surveillance is not
                        just our design choice — it's our ethical mandate.
                    </p>
                </div>
            </div>
        </section>
    )
}
