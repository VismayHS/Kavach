import './Problem.css'
import { AlertTriangle, BarChart3, Moon, Smartphone } from 'lucide-react'

const STATS = [
    {
        value: '31,677',
        label: 'Reported rapes in India (2022)',
        icon: <AlertTriangle size={22} />,
    },
    {
        value: '87',
        label: 'Sexual assaults per day',
        icon: <BarChart3 size={22} />,
    },
    {
        value: '70%',
        label: 'Women feel unsafe after dark',
        icon: <Moon size={22} />,
    },
    {
        value: '< 2%',
        label: 'Panic apps used during real danger',
        icon: <Smartphone size={22} />,
    },
]

export default function Problem() {
    return (
        <section className="section problem" id="problem">
            <div className="problem__bg-line" />
            <div className="container">
                <div className="problem__header reveal">
                    <span className="section-label">The Crisis</span>
                    <h2 className="section-title">
                        Millions of Women Live in Fear.
                        <br />
                        <span style={{ color: 'var(--text-secondary)', fontWeight: 400, fontSize: '0.7em' }}>
                            Existing safety apps fail when they're needed most.
                        </span>
                    </h2>
                </div>

                <div className="problem__grid">
                    {STATS.map((stat, i) => (
                        <div key={i} className={`glass-card problem__card reveal reveal-delay-${i + 1}`}>
                            <div className="problem__card-icon">
                                {stat.icon}
                            </div>
                            <div className="problem__card-value">
                                {stat.value}
                            </div>
                            <div className="problem__card-label">{stat.label}</div>
                        </div>
                    ))}
                </div>

                <div className="problem__explanation reveal">
                    <div className="problem__explain-card">
                        <h3>Why Panic Buttons Fail</h3>
                        <ul>
                            <li>
                                <span className="problem__x">✕</span>
                                Require <strong>active action</strong> — pressing a button during an attack
                            </li>
                            <li>
                                <span className="problem__x">✕</span>
                                Attackers can <strong>see or disable</strong> the phone
                            </li>
                            <li>
                                <span className="problem__x">✕</span>
                                Don't work <strong>without internet</strong>
                            </li>
                            <li>
                                <span className="problem__x">✕</span>
                                Provide <strong>no evidence</strong> for prosecution
                            </li>
                        </ul>
                    </div>
                    <div className="problem__explain-card problem__explain-card--solution">
                        <h3>What Women Really Need</h3>
                        <ul>
                            <li>
                                <span className="problem__check">✓</span>
                                <strong>Automatic detection</strong> — no action required
                            </li>
                            <li>
                                <span className="problem__check">✓</span>
                                <strong>Silent &amp; invisible</strong> — attacker never knows
                            </li>
                            <li>
                                <span className="problem__check">✓</span>
                                Works <strong>offline</strong> with SMS fallback
                            </li>
                            <li>
                                <span className="problem__check">✓</span>
                                <strong>Secure evidence</strong> capture for legal support
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    )
}
