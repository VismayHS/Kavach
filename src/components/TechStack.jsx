import './TechStack.css'
import { Mic, Radio, Eye, Brain, Lock, Zap, Database, Shield, Send, KeyRound } from 'lucide-react'

const ON_DEVICE = [
    { title: 'Offline Speech Recognition', desc: 'Real-time voice processing without internet', icon: <Mic size={20} /> },
    { title: 'Acoustic Scream Detection', desc: 'ML models for distress sound classification', icon: <Radio size={20} /> },
    { title: 'Gesture Vision Model', desc: 'Camera-based hand gesture recognition', icon: <Eye size={20} /> },
    { title: 'Behavioral Anomaly AI', desc: 'Movement and pattern analysis engine', icon: <Brain size={20} /> },
    { title: 'On-Device Privacy Processing', desc: 'All data processed locally, nothing uploaded', icon: <Lock size={20} /> },
]

const CLOUD = [
    { title: 'Serverless Compute', desc: 'Scalable cloud functions for alert routing', icon: <Zap size={20} /> },
    { title: 'Secure Database', desc: 'Encrypted storage for guardian contacts', icon: <Database size={20} /> },
    { title: 'Evidence Storage', desc: 'End-to-end encrypted evidence vault', icon: <Shield size={20} /> },
    { title: 'Emergency Messaging', desc: 'Multi-channel alert dispatch system', icon: <Send size={20} /> },
    { title: 'Auth & Monitoring', desc: 'Zero-trust authentication and health monitoring', icon: <KeyRound size={20} /> },
]

function TechCard({ item, delay }) {
    return (
        <div className={`glass-card tech__card reveal reveal-delay-${delay}`}>
            <div className="tech__card-icon">{item.icon}</div>
            <div>
                <h4 className="tech__card-title">{item.title}</h4>
                <p className="tech__card-desc">{item.desc}</p>
            </div>
        </div>
    )
}

export default function TechStack() {
    return (
        <section className="section tech" id="technology">
            <div className="container">
                <div className="tech__header reveal">
                    <span className="section-label">Technology</span>
                    <h2 className="section-title">
                        Engineering You Can Trust
                    </h2>
                    <p className="section-subtitle" style={{ margin: '0 auto' }}>
                        Built with production-grade AI and cloud infrastructure.
                        Designed for reliability, privacy, and scale.
                    </p>
                </div>

                <div className="tech__columns">
                    <div className="tech__column">
                        <h3 className="tech__column-title reveal">
                            <span className="tech__column-badge tech__column-badge--device">On-Device AI</span>
                        </h3>
                        <div className="tech__list">
                            {ON_DEVICE.map((item, i) => (
                                <TechCard key={i} item={item} delay={(i % 5) + 1} />
                            ))}
                        </div>
                    </div>

                    <div className="tech__divider" />

                    <div className="tech__column">
                        <h3 className="tech__column-title reveal">
                            <span className="tech__column-badge tech__column-badge--cloud">Cloud Backend</span>
                        </h3>
                        <div className="tech__list">
                            {CLOUD.map((item, i) => (
                                <TechCard key={i} item={item} delay={(i % 5) + 1} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
