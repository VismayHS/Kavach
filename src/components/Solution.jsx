import './Solution.css'
import { Mic, Activity, Hand, Clock, MapPin } from 'lucide-react'

const STEPS = [
    {
        num: '01',
        title: 'Voice Distress Detection',
        desc: 'On-device speech recognition identifies distress keywords, whispers for help, and urgent vocal patterns — even in noisy environments.',
        icon: <Mic size={24} />,
    },
    {
        num: '02',
        title: 'Scream Acoustic Analysis',
        desc: 'Advanced audio classification distinguishes genuine screams of distress from ambient sounds like traffic, music, or celebrations.',
        icon: <Activity size={24} />,
    },
    {
        num: '03',
        title: 'Hand Gesture Recognition',
        desc: 'Computer vision detects predefined help gestures through the phone camera — enabling truly silent calls for help.',
        icon: <Hand size={24} />,
    },
    {
        num: '04',
        title: 'Behavioral Anomaly Detection',
        desc: 'AI monitors movement patterns, travel routes, and phone usage — detecting unusual behavior like unexpected stops or route deviations.',
        icon: <Clock size={24} />,
    },
    {
        num: '05',
        title: 'Silent Alert & Location Share',
        desc: 'When danger is confirmed, RAKSHAK silently alerts trusted guardians with real-time GPS location, evidence, and emergency routing.',
        icon: <MapPin size={24} />,
    },
]

export default function Solution() {
    return (
        <section className="section solution" id="solution">
            <div className="container">
                <div className="solution__header reveal">
                    <span className="section-label">How It Works</span>
                    <h2 className="section-title">
                        Multi-Modal AI Detection
                        <br />
                        <span style={{ color: 'var(--text-secondary)', fontWeight: 400, fontSize: '0.7em' }}>
                            Five layers of silent, intelligent protection.
                        </span>
                    </h2>
                    <p className="section-subtitle" style={{ margin: '0 auto' }}>
                        RAKSHAK combines multiple AI models running entirely on your device
                        to detect danger without any manual action — automatically, silently,
                        and privately.
                    </p>
                </div>

                <div className="solution__pipeline">
                    {STEPS.map((step, i) => (
                        <div key={i} className={`solution__step glass-card reveal reveal-delay-${i + 1}`}>
                            <div className="solution__step-num">
                                {step.num}
                            </div>
                            <div className="solution__step-icon">
                                {step.icon}
                            </div>
                            <h3 className="solution__step-title">{step.title}</h3>
                            <p className="solution__step-desc">{step.desc}</p>
                        </div>
                    ))}
                </div>


                <div className="solution__emphasis reveal">
                    <div className="solution__emphasis-inner">
                        <span className="solution__emphasis-icon">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                        </span>
                        <p>
                            <strong>Fully automatic. Completely silent. Entirely private.</strong>
                            <br />
                            No buttons to press. No apps to open. RAKSHAK works invisibly to
                            keep you safe.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    )
}
