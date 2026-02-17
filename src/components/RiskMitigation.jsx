import './RiskMitigation.css'
import { WifiOff, Volume2, Network, BatteryCharging } from 'lucide-react'

const FEATURES = [
    {
        icon: <WifiOff size={22} />,
        title: 'Offline SMS Fallback',
        desc: 'When there is no internet, RAKSHAK falls back to SMS-based alerts with location coordinates — ensuring connectivity is never a barrier to safety.',
    },
    {
        icon: <Volume2 size={22} />,
        title: 'Noise-Resilient Models',
        desc: 'Our AI models are trained on diverse acoustic environments — from busy markets and traffic to rural silence — to reduce false positives and negatives.',
    },
    {
        icon: <Network size={22} />,
        title: 'Future Mesh Alerting',
        desc: 'Planned peer-to-peer mesh network support will enable nearby RAKSHAK devices to relay alerts, even when cellular infrastructure is unavailable.',
    },
    {
        icon: <BatteryCharging size={22} />,
        title: 'Battery-Efficient AI',
        desc: 'Optimized on-device models use minimal processing power, keeping battery consumption low while maintaining always-on protection.',
    },
]

export default function RiskMitigation() {
    return (
        <section className="section risk" id="risk">
            <div className="container">
                <div className="risk__header reveal">
                    <span className="section-label">Reliability</span>
                    <h2 className="section-title">
                        Built for the Real World
                    </h2>
                    <p className="section-subtitle" style={{ margin: '0 auto' }}>
                        Safety systems must work in the worst conditions.
                        RAKSHAK is engineered for resilience and reliability.
                    </p>
                </div>

                <div className="risk__grid">
                    {FEATURES.map((f, i) => (
                        <div key={i} className={`glass-card risk__card reveal reveal-delay-${i + 1}`}>
                            <div className="risk__card-header">
                                <div className="risk__card-icon">
                                    {f.icon}
                                </div>
                                <h3 className="risk__card-title">{f.title}</h3>
                            </div>
                            <p className="risk__card-desc">{f.desc}</p>
                            <div className="risk__card-indicator">
                                <div className="risk__card-bar" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
